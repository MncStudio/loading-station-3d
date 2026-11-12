import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { building } from './model.js';

const height = 1.68;
const radius = 0.34;
const walkSpeed = 0.72;
const initialPosition = [-4.6, 0, 0];
export const avatarCameraOffset = new THREE.Vector3(-3.1, 2.15, -4.0);

function samplePoseClip(source, name, start, end = start) {
  const frames = Math.round((end - start) * 24);
  const times = Float32Array.from({ length: frames + 1 }, (_, frame) => frame / 24);
  const tracks = source.tracks.map((track) => {
    const size = track.getValueSize();
    const values = new Float32Array(times.length * size);
    const interpolant = track.createInterpolant();
    const hips = track.name.endsWith('Hips.position');
    const first = hips ? interpolant.evaluate(start).slice() : null;
    const last = hips ? interpolant.evaluate(end).slice() : null;

    for (let frame = 0; frame < times.length; frame++) {
      const index = frame * size;
      values.set(interpolant.evaluate(start + times[frame]), index);
      if (hips) {
        // Preserve gait sway and height while removing the clip's forward drift.
        const phase = frames ? frame / frames : 0;
        values[index] -= THREE.MathUtils.lerp(first[0], last[0], phase);
        values[index + 2] -= THREE.MathUtils.lerp(first[2], last[2], phase);
      }
      if (frames && frame > frames - 3) {
        const blend = THREE.MathUtils.smoothstep(frame, frames - 3, frames);
        if (track.ValueTypeName === 'quaternion') {
          THREE.Quaternion.slerpFlat(values, index, values, index, values, 0, blend);
        } else {
          for (let axis = 0; axis < size; axis++) {
            values[index + axis] = THREE.MathUtils.lerp(values[index + axis], values[axis], blend);
          }
        }
      }
    }
    const sampled = track.clone();
    sampled.times = times;
    sampled.values = values;
    return sampled.optimize();
  });
  return new THREE.AnimationClip(name, frames ? end - start : 1, tracks);
}

function createWalkCollision(model) {
  const { frontX, rearX, endZ } = building;
  const cellSize = 0.14;
  const columns = Math.ceil((rearX - frontX) / cellSize);
  const rows = Math.ceil(2 * endZ / cellSize);
  const cells = new Uint8Array(columns * rows);
  const instance = new THREE.Matrix4();
  const transform = new THREE.Matrix4();
  const box = new THREE.Box3();
  const columnAt = (x) => Math.floor((x - frontX) / cellSize);
  const rowAt = (z) => Math.floor((z + endZ) / cellSize);

  function mark(bounds) {
    if (bounds.max.y < 0.16 || bounds.min.y > height) return;
    const startX = Math.max(0, columnAt(bounds.min.x - radius));
    const endX = Math.min(columns - 1, columnAt(bounds.max.x + radius));
    const startZ = Math.max(0, rowAt(bounds.min.z - radius));
    const endZ = Math.min(rows - 1, rowAt(bounds.max.z + radius));
    if (startX > endX || startZ > endZ) return;
    for (let row = startZ; row <= endZ; row++) {
      cells.fill(1, row * columns + startX, row * columns + endX + 1);
    }
  }

  model.traverse((mesh) => {
    if (!mesh.isMesh) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    if (mesh.isInstancedMesh) {
      for (let index = 0; index < mesh.count; index++) {
        mesh.getMatrixAt(index, instance);
        transform.multiplyMatrices(mesh.matrixWorld, instance);
        mark(box.copy(mesh.geometry.boundingBox).applyMatrix4(transform));
      }
    } else {
      mark(box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld));
    }
  });

  return (x, z) => (
    x >= frontX + radius && x <= rearX - radius && Math.abs(z) <= endZ - radius
    && cells[rowAt(z) * columns + columnAt(x)] === 0
  );
}

function createContactShadow() {
  const size = 32;
  const pixels = new Uint8Array(size * size * 4);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const d = Math.hypot((column + 0.5) / size * 2 - 1, (row + 0.5) / size * 2 - 1);
      pixels[(row * size + column) * 4 + 3] = 255 * (1 - THREE.MathUtils.smoothstep(d, 0.12, 0.95));
    }
  }
  const map = new THREE.DataTexture(pixels, size, size);
  map.magFilter = THREE.LinearFilter;
  map.needsUpdate = true;
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 0.8),
    new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0.24, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(initialPosition[0], 0.011, initialPosition[2]);
  return shadow;
}

export async function loadWarehouseAvatar(model, scene) {
  const { scene: rig, animations } = await new GLTFLoader().loadAsync(
    `${import.meta.env.BASE_URL}models/warehouse-avatar.glb`,
  );
  const canWalkAt = createWalkCollision(model);
  const idle = samplePoseClip(animations[0], '数字人待机', 4.75);
  const walk = samplePoseClip(animations[0], '数字人走路', 0.75, 2);
  const mixer = new THREE.AnimationMixer(rig);
  const standing = mixer.clipAction(idle).play();
  const gait = mixer.clipAction(walk).setEffectiveTimeScale(1.9).setEffectiveWeight(0).play();
  gait.paused = true;
  mixer.update(0);
  rig.updateMatrixWorld(true);

  const poseBounds = new THREE.Box3().setFromObject(rig, true);
  const scale = height / (poseBounds.max.y - poseBounds.min.y);
  rig.scale.setScalar(scale);
  rig.position.y = -poseBounds.min.y * scale;
  rig.traverse((object) => {
    if (object.isSkinnedMesh) {
      object.frustumCulled = false;
      object.receiveShadow = true;
    }
  });

  const root = new THREE.Group();
  root.name = '仓库数字人';
  root.position.fromArray(initialPosition);
  root.rotation.y = Math.atan2(avatarCameraOffset.x, avatarCameraOffset.z);
  root.add(rig);
  model.add(root);
  const shadow = createContactShadow();
  const selectionRing = new THREE.Mesh(
    new THREE.RingGeometry(0.56, 0.59, 48),
    new THREE.MeshBasicMaterial({ color: 0x87ebd8, toneMapped: false }),
  );
  selectionRing.position.z = 0.002;
  selectionRing.visible = false;
  shadow.add(selectionRing);
  scene.add(shadow);

  let walkWeight = 0;
  const displacement = new THREE.Vector3();
  function update(direction, seconds) {
    const { x, z } = root.position;
    if (direction.lengthSq()) {
      const travel = walkSpeed * seconds;
      const steps = Math.ceil(travel / 0.065);
      const stepX = direction.x * travel / steps;
      const stepZ = direction.z * travel / steps;
      for (let step = 0; step < steps; step++) {
        if (canWalkAt(root.position.x + stepX, root.position.z)) root.position.x += stepX;
        if (canWalkAt(root.position.x, root.position.z + stepZ)) root.position.z += stepZ;
      }
      const turn = Math.atan2(direction.x, direction.z) - root.rotation.y;
      root.rotation.y += Math.atan2(Math.sin(turn), Math.cos(turn)) * (1 - Math.exp(-18 * seconds));
    }
    displacement.set(root.position.x - x, 0, root.position.z - z);
    shadow.position.x = root.position.x;
    shadow.position.z = root.position.z;

    const moving = displacement.lengthSq() > 0.000001;
    const nextWeight = THREE.MathUtils.clamp(walkWeight + (moving ? 1 : -1) * seconds * 7, 0, 1);
    if (moving && walkWeight === 0) gait.time = 0;
    walkWeight = nextWeight;
    gait.paused = !walkWeight;
    gait.setEffectiveWeight(walkWeight);
    standing.setEffectiveWeight(1 - walkWeight);
    mixer.update(seconds);
    return displacement;
  }

  function stop() {
    walkWeight = 0;
    gait.paused = true;
    gait.setEffectiveWeight(0);
    standing.setEffectiveWeight(1);
    mixer.update(0);
  }

  function setSelected(selected) {
    selectionRing.visible = selected;
  }

  return { root, clips: [idle, walk], update, stop, setSelected, get settling() { return walkWeight > 0; } };
}
