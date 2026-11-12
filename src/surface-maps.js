import * as THREE from 'three';

function grain(x, y, seed) {
  let hash = Math.imul(x ^ seed, 0x1f123bb5) ^ Math.imul(y + seed, 0x5f356495);
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  return ((hash ^ (hash >>> 15)) >>> 0) / 2147483648 - 1;
}

function noise(u, v, frequency, seed) {
  const x = u * frequency;
  const y = v * frequency;
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const tx = fx * fx * (3 - 2 * fx);
  const ty = fy * fy * (3 - 2 * fy);
  const right = (ix + 1) % frequency;
  const above = (iy + 1) % frequency;
  const low = THREE.MathUtils.lerp(grain(ix, iy, seed), grain(right, iy, seed), tx);
  const high = THREE.MathUtils.lerp(grain(ix, above, seed), grain(right, above, seed), tx);
  return THREE.MathUtils.lerp(low, high, ty);
}

function makeTexture(bytes, size) {
  let texture;
  if (typeof document === 'undefined') {
    texture = new THREE.DataTexture(new Uint8Array(bytes.buffer), size, size);
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.getContext('2d').putImageData(new ImageData(bytes, size, size), 0, 0);
    texture = new THREE.CanvasTexture(canvas);
  }
  texture.flipY = false;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function makeConcreteDetail() {
  const size = 256;
  const normals = new Uint8ClampedArray(size * size * 4);
  const finish = new Uint8ClampedArray(normals.length);
  const heights = new Float32Array(size * size);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const u = column / size;
      const v = row / size;
      const fine = grain(column, row, 107);
      const pores = noise(u, v, 92, 18);
      const index = (row * size + column) * 4;
      heights[index / 4] = pores * 0.21 + fine * 0.15 + noise(u, v, 36, 52) * 0.21;
      finish.set([255, 240 + fine * 4 + pores * 8, 255, 255], index);
    }
  }
  const heightAt = (x, y) => heights[((y + size) % size) * size + (x + size) % size];
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const dx = heightAt(column - 1, row) - heightAt(column + 1, row);
      const dy = heightAt(column, row - 1) - heightAt(column, row + 1);
      const normalLength = Math.hypot(dx, dy, 1);
      normals.set([
        127.5 * (1 + dx / normalLength),
        127.5 * (1 + dy / normalLength),
        127.5 * (1 + 1 / normalLength),
        255,
      ], (row * size + column) * 4);
    }
  }
  return {
    normal: makeTexture(normals, size),
    finish: makeTexture(finish, size),
  };
}

export function applySurfaceMaps(materials, floor) {
  const { normal, finish } = makeConcreteDetail();
  for (const material of [materials.concrete, materials.coping, materials.wallBase, materials.slab]) {
    material.normalMap = normal;
    material.normalScale.setScalar(0.25);
    material.roughnessMap = material.metalnessMap = finish;
  }

  const repeats = [(floor.maxX - floor.minX) / 2.2, floor.depth / 2.2];
  const floorNormal = normal.clone();
  const floorFinish = finish.clone();
  for (const map of [floorNormal, floorFinish]) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(...repeats);
    map.needsUpdate = true;
  }
  materials.floor.normalMap = floorNormal;
  materials.floor.normalScale.setScalar(0.19);
  materials.floor.roughnessMap = materials.floor.metalnessMap = floorFinish;
}
