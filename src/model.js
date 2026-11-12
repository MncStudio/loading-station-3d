import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { addWarehouseWalls } from './warehouse-walls.js';
import { addAisleStacker } from './stacker.js';
import { applySurfaceMaps } from './surface-maps.js';

export const warehouse = {
  areaOffset: 21.9,
  floor: { minX: -17.6, maxX: 27.9, depth: 64.8, wallZ: 29.85 },
  rack: {
    face: 12.91, rows: 4, stationsPerRow: 2, columnsPerStation: 2,
    stationGap: 0.12, columnGap: 0.11, bays: 24, levels: 8,
    bayWidth: 1.97, rowDepth: 2.16, rowPitch: 3.65, levelPitch: 1.32, farEnd: 23.64,
  },
};

const laneInside = warehouse.areaOffset + 0.25;
const laneOutside = warehouse.areaOffset + 6.21;
export const building = {
  frontX: -12.9, rearX: 26.55, endZ: warehouse.floor.wallZ, height: 15.94,
  doors: [
    { from: -laneOutside, to: -laneInside, top: 6.35 },
    { from: -1.35, to: 1.15, top: 3.95 },
    { from: laneInside, to: laneOutside, top: 6.35 },
  ],
};

const rackStart = warehouse.rack.farEnd - warehouse.rack.bays * warehouse.rack.bayWidth;
const aisleWidth = warehouse.rack.rowPitch - warehouse.rack.rowDepth;
const { stationsPerRow, columnsPerStation, stationGap, columnGap, rowDepth } = warehouse.rack;
const stationDepth = (rowDepth - (stationsPerRow - 1) * stationGap) / stationsPerRow;
const stationPitch = stationDepth + stationGap;
const columnDepth = (stationDepth - (columnsPerStation - 1) * columnGap) / columnsPerStation;
const columnPitch = columnDepth + columnGap;
const upperGuideY = warehouse.rack.levels * warehouse.rack.levelPitch + 0.37;
export const stackerPosition = {
  x: warehouse.rack.face + 2 * warehouse.rack.rowPitch - aisleWidth / 2,
  z: warehouse.rack.farEnd - 4.4,
  guideY: upperGuideY,
};
const manualIntakeBay = 5;
export const manualIntake = {
  bay: manualIntakeBay,
  z: rackStart + (manualIntakeBay + 0.5) * warehouse.rack.bayWidth,
  openingHeight: 2.68,
};

const endTransfer = {
  railStart: 6.25,
  railEnd: 26.18,
  railZ: -27.72,
  gauge: 1.55,
  bedStart: -26.73,
  rollerY: 0.77,
};

const inboundComponents = [
  { id: 'truck', name: '牵引车及挂车', icon: 'truck', color: '#58a69f', description: '牵引驾驶室、厢式挂车和车轮底盘。' },
  { id: 'gantry', name: '龙门装卸系统', icon: 'gantry', color: '#69bdb5', description: '双轨龙门、跨梁小车、升降立柱和吊具。' },
  { id: 'conveyors', name: '入库滚筒输送线', icon: 'conveyor', color: '#a2b5bf', description: '车边滚筒、梯状交接台、两条纵向输送线及蓝色升降机。' },
  { id: 'inbound-transfer', name: '货架侧接驳轨道', icon: 'transfer', color: '#8eb8de', description: '沿货架端部的地面双轨、蓝色移载车和各排货架前的短接驳台。' },
  { id: 'manual-intake', name: '人工入库口', icon: 'conveyor', color: '#a2b5bf', description: '双列滚筒、导向挡板、检测门架和就地控制台。' },
  { id: 'fences', name: '入库安全围栏', icon: 'fence', color: '#efc15d', description: '车边与滚筒交接工位的黄色围栏。' },
];

const outboundComponents = [
  { id: 'outbound-gantry', name: '出库龙门架', icon: 'gantry', color: '#69bdb5', description: '双侧长轨、跨梁小车及下降到交接工位的双柱吊具。' },
  { id: 'outbound-conveyors', name: '出库滚筒输送线', icon: 'conveyor', color: '#a2b5bf', description: '装车交接段、回形滚筒线、蓝色升降机和检测门架。' },
  { id: 'outbound-transfer', name: '出库移载轨道', icon: 'transfer', color: '#8eb8de', description: '出库端地面双轨、蓝色移载车及各排货架前的成对接驳台。' },
  { id: 'outbound-fences', name: '出库安全围栏', icon: 'fence', color: '#efc15d', description: '沿空车道及末端交接区设置的黄色网格护栏。' },
];

export const components = [
  { id: 'inbound', name: '入库区', icon: 'inbound', color: '#71c8ba', description: '货车泊位、入库龙门架及通向货架的输送设备。', children: inboundComponents },
  { id: 'outbound', name: '出库区', icon: 'outbound', color: '#8eb8de', description: '空置的装车通道、出库龙门架及末端滚筒交接工位。', children: outboundComponents },
  { id: 'rack', name: '高位立体货架', icon: 'rack', color: '#d4dddf', description: '十六列白色货架分为四组，组间留出三条堆垛机巷道。每条端部接驳轨道对应两列。' },
  { id: 'stacker', name: '巷道堆垛机', icon: 'stacker', color: '#58a3da', description: '单立柱堆垛机沿货架巷道行走，通过升降载货台和货叉存取货物。' },
  { id: 'rack-guard', name: '货架黄色防护网', icon: 'fence', color: '#efc15d', description: '沿货架全长布置的高位防护网，人工入库口下方留出滚筒通道。' },
  { id: 'cranes', name: '桥式行车', icon: 'crane', color: '#c7b55e', description: '三台前后跨向的双梁行车，轨道通过顶部吊架和墙侧托座安装。' },
  { id: 'site', name: '地坪与围墙', icon: 'site', color: '#7b979a', description: '作业地坪、通道标线和混凝土围墙。' },
  { id: 'walls', name: '仓库外墙', icon: 'wall', color: '#dbd7c1', description: '四面浅色压型板墙、混凝土墙裙、分格窗及装卸门洞。' },
];

const palette = {
  floor: [0x93918a, 0.84], slab: [0x6c6a64, 0.94], seam: [0x706e65, 0.95],
  paint: [0xbdbbae, 0.89], concrete: [0x9a9990, 0.96], coping: [0xb8b6ac, 0.95],
  teal: [0x375650, 0.57, 0.22], tealDark: [0x2f4641, 0.61, 0.24],
  tealLight: [0x496860, 0.55, 0.21], trailer: [0x3f514b, 0.64, 0.24],
  glass: [0x182125, 0.23, 0.35], glassEdge: [0x3e494b, 0.39, 0.24],
  black: [0x172225, 0.64], rubber: [0x202526, 0.95], tread: [0x2a3030, 0.94],
  rim: [0xa3a4a0, 0.36, 0.65], steel: [0x868986, 0.53, 0.56],
  zinc: [0xbac0bd, 0.52, 0.56], silver: [0xcfd0cc, 0.32, 0.72],
  rollerSteel: [0xd5d7d4, 0.195, 0.9],
  cabinet: [0xa6a79e, 0.65, 0.16], cabinetDark: [0x535957, 0.69, 0.2],
  yellow: [0xc99625, 0.54, 0.14], mesh: [0x858982, 0.64, 0.36], guardMesh: [0xaa862f, 0.7, 0.25],
  rackWhite: [0xc8ccc7, 0.46, 0.54],
  crane: [0xa18e49, 0.58, 0.21], craneDark: [0x6e6240, 0.6, 0.23], craneRail: [0xb39e5c, 0.58, 0.23],
  blue: [0x365c7a, 0.55, 0.21], blueLight: [0x537791, 0.53, 0.23],
  stackerBlue: [0x235e88, 0.51, 0.24], stackerDark: [0x254c67, 0.58, 0.21],
  drumSteel: [0x68584d, 0.38, 0.55], drumRim: [0x998779, 0.38, 0.6],
  lamp: [0xeee7c8, 0.24, 0.13], amber: [0xf8aa36, 0.34, 0.1], red: [0xb1443f, 0.43, 0.09],
  cladding: [0xc9c4b5, 0.75, 0.18], claddingRib: [0xd1ccbf, 0.74, 0.18],
  wallBase: [0x96948a, 0.95], wallTrim: [0x646968, 0.58, 0.38],
  wallGlazing: [0x2c3439, 0.24, 0.41], wallGlazingLight: [0x3a444a, 0.26, 0.38],
};

const geometries = {
  box: new THREE.BoxGeometry(),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 16),
  bolt: new THREE.CylinderGeometry(1, 1, 1, 6),
  tire: new THREE.CylinderGeometry(1, 1, 1, 32),
};

const axis = new THREE.Vector3(0, 1, 0);

class ModelBuilder {
  constructor(group, materials) {
    this.group = group;
    this.materials = materials;
    this.batches = new Map();
    this.transform = new THREE.Object3D();
  }

  part(geometry, material, position, scale, orientation, shadow = true) {
    const transform = this.transform;
    transform.position.fromArray(position);
    transform.scale.fromArray(scale);
    if (orientation instanceof THREE.Quaternion) {
      transform.quaternion.copy(orientation);
    } else {
      transform.rotation.set(...(orientation ?? [0, 0, 0]));
    }
    transform.updateMatrix();
    const key = [geometry.uuid, material, shadow].join('/');
    if (!this.batches.has(key)) {
      this.batches.set(key, { geometry, material, shadow, matrices: [] });
    }
    this.batches.get(key).matrices.push(transform.matrix.clone());
  }

  box(x, y, z, w, h, d, material, shadow = true) {
    this.part(geometries.box, material, [x, y, z], [w, h, d], undefined, shadow);
  }

  cylinder(x, y, z, radius, length, material, direction = 'y', shape = 'cylinder') {
    const rotation = { x: [0, 0, -Math.PI / 2], z: [Math.PI / 2, 0, 0] }[direction];
    this.part(geometries[shape], material, [x, y, z], [radius, length, radius], rotation);
  }

  beam(start, end, width, depth, material, shadow = true) {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    const length = direction.length();
    const rotation = new THREE.Quaternion().setFromUnitVectors(axis, direction.normalize());
    const center = from.lerp(to, 0.5).toArray();
    this.part(geometries.box, material, center, [width, length, depth], rotation, shadow);
  }

  rounded(x, y, z, w, h, d, radius, material) {
    this.part(new RoundedBoxGeometry(w, h, d, 3, radius), material, [x, y, z], [1, 1, 1]);
  }

  profile(points, centerZ, thickness, material, bevel = 0) {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 3,
      steps: 1,
    });
    this.part(geometry, material, [0, 0, centerZ - thickness / 2], [1, 1, 1]);
  }

  finish() {
    for (const { geometry, material, shadow, matrices } of this.batches.values()) {
      let mesh;
      if (matrices.length === 1) {
        mesh = new THREE.Mesh(geometry, this.materials[material]);
        matrices[0].decompose(mesh.position, mesh.quaternion, mesh.scale);
      } else {
        mesh = new THREE.InstancedMesh(geometry, this.materials[material], matrices.length);
        matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
        mesh.computeBoundingSphere();
      }
      mesh.name = material;
      mesh.castShadow = shadow;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
  }
}

function concreteWall(m, x1, z1, x2, z2) {
  const length = Math.hypot(x2 - x1, z2 - z1);
  const panels = Math.ceil(length / 3.9);
  const point = (t, y) => [THREE.MathUtils.lerp(x1, x2, t), y, THREE.MathUtils.lerp(z1, z2, t)];
  for (let index = 0; index <= panels; index++) {
    m.box(...point(index / panels, 1.09), 0.34, 2.18, 0.34, 'coping');
    if (index === panels) break;
    const [x, , z] = point((index + 0.5) / panels, 0);
    const alongX = z1 === z2;
    const width = length / panels - 0.25;
    m.box(x, 0.81, z, alongX ? width : 0.21, 1.62, alongX ? 0.21 : width, 'concrete');
    m.box(x, 1.62, z, alongX ? width : 0.24, 0.07, alongX ? 0.24 : width, 'coping');
  }
}

function addSite(m) {
  const { minX, maxX, depth, wallZ: outerZ } = warehouse.floor;
  const length = maxX - minX;
  const centerX = (minX + maxX) / 2;
  m.box(centerX, -0.27, 0, length, 0.48, depth, 'slab');
  m.box(centerX, -0.043, 0, length, 0.085, depth, 'floor', false);
  for (let x = -13; x < maxX; x += 4.5) {
    m.box(x, 0.002, 0, 0.019, 0.004, depth - 0.3, 'seam', false);
  }
  for (let z = -28; z <= 28; z += 4) {
    m.box(centerX, 0.003, z, length - 0.25, 0.005, 0.018, 'seam', false);
  }

  const { frontX, rearX, doors } = building;
  for (const side of [-1, 1]) {
    for (const z of [laneInside, laneOutside - 0.16]) {
      m.box(-5.62, 0.007, side * z, 20.96, 0.007, 0.048, 'paint', false);
    }
    const markX = side === -1 ? 5.79 : 7.77;
    const markLength = side === -1 ? 6.07 : 8.15;
    const markZ = side === -1 ? 5.52 : 5.36;
    m.box(markX, 0.009, side * (warehouse.areaOffset - markZ), markLength, 0.009, 0.046, 'yellow', false);
    concreteWall(m, frontX, side * outerZ, rearX, side * outerZ);
  }
  for (let x = -15.8; x <= 2.6; x += 2.15) {
    m.box(x, 0.008, -warehouse.areaOffset - 3.25, 1.28, 0.008, 0.075, 'paint', false);
  }
  let from = -outerZ;
  for (const door of doors) {
    concreteWall(m, frontX, from, frontX, door.from);
    from = door.to;
  }
  concreteWall(m, frontX, from, frontX, outerZ);
  concreteWall(m, rearX, -outerZ, rearX, outerZ);

  for (const z of [rackStart + 0.27, -17.35, manualIntake.z + 1.4, -8.6, -4.3, 0, 4.3, 8.6, 13.2, 16.8, warehouse.rack.farEnd - 0.27]) {
    const height = Math.abs(z) >= 16.8 ? 8.3 : 6.65;
    const atRackEnd = Math.abs(z) >= 16.8;
    const x = atRackEnd ? 12.47 : 11.85;
    m.box(x, 0.15, z, atRackEnd ? 0.6 : 0.68, 0.3, 0.72, 'concrete');
    m.box(x, height / 2, z, 0.36, height, 0.42, 'coping');
    m.box(x - 0.2, height / 2, z, 0.055, height, 0.43, 'concrete');
  }
  for (const z of [0.6, 11.8]) cabinet(m, 10.94, z, 0.58, 1.16, 0.53);
}

function wheel(m, x, centerZ, offset, radius) {
  for (const side of [-1, 1]) {
    const z = centerZ + side * offset;
    m.cylinder(x, radius + 0.016, z, radius, 0.32, 'rubber', 'z', 'tire');
    m.cylinder(x, radius + 0.016, z, radius * 1.007, 0.21, 'tread', 'z', 'tire');
    m.cylinder(x, radius + 0.016, z + side * 0.166, radius * 0.66, 0.041, 'rim', 'z');
    m.cylinder(x, radius + 0.016, z + side * 0.191, radius * 0.43, 0.039, 'steel', 'z');
    m.cylinder(x, radius + 0.016, z + side * 0.217, radius * 0.2, 0.042, 'rim', 'z');
    for (let index = 0; index < 8; index++) {
      const angle = index * Math.PI / 4;
      m.cylinder(
        x + Math.cos(angle) * radius * 0.32,
        radius + 0.016 + Math.sin(angle) * radius * 0.32,
        z + side * 0.219, 0.023, 0.026, 'rim', 'z', 'bolt',
      );
    }
  }
  m.cylinder(x, radius + 0.016, centerZ, 0.075, offset * 2, 'black', 'z');
}

function addTruck(m) {
  const z = -3.18;
  const sides = [-1, 1];
  m.box(-13.08, 0.76, z, 5.24, 0.27, 1.68, 'black');
  m.cylinder(-10.51, 0.9, z, 0.55, 0.13, 'black');
  m.box(-3.85, 0.93, z, 12.78, 0.24, 1.94, 'tealDark');
  m.box(-3.82, 1.18, z, 13.43, 0.28, 2.55, 'teal');
  m.rounded(-3.82, 2.36, z, 13.38, 2.4, 2.53, 0.075, 'trailer');
  m.rounded(-3.82, 3.57, z, 13.46, 0.13, 2.61, 0.05, 'tealLight');
  for (const side of sides) {
    const panel = z + side * 1.275;
    m.box(-3.82, 1.34, panel, 13.46, 0.089, 0.045, 'tealLight');
    m.box(-3.82, 3.5, panel, 13.45, 0.052, 0.045, 'tealLight');
    m.box(-3.91, 2.94, panel, 13.24, 0.023, 0.021, 'tealDark');
    for (const x of [-10.48, -8.2, -5.95, -3.7, -1.45, 0.8, 2.85]) {
      m.box(x, 2.38, panel, 0.037, 2.17, 0.028, 'tealDark');
    }
    for (const x of [-10.25, -7.2, -4.14, -1.1, 2.45]) {
      m.box(x, 1.16, panel, 0.12, 0.046, 0.027, 'amber');
    }
    m.box(-4.92, 0.76, z + side * 1.05, 5.18, 0.34, 0.11, 'teal');
    m.box(-4.92, 0.61, z + side * 1.11, 5.18, 0.07, 0.13, 'tealLight');
    m.box(-8.9, 0.48, z + side * 0.77, 0.14, 0.8, 0.16, 'steel');
    m.box(-8.9, 0.12, z + side * 0.77, 0.31, 0.11, 0.23, 'black');
  }
  for (let x = -9.97; x <= 2.5; x += 1.08) {
    m.box(x, 3.636, z, 0.028, 0.014, 2.39, 'teal');
  }
  m.box(2.89, 2.35, z, 0.09, 2.23, 2.51, 'tealDark');
  for (const dz of [-0.625, 0.625]) {
    m.box(2.947, 2.34, z + dz, 0.035, 2.13, 1.18, 'trailer');
    m.cylinder(2.983, 2.37, z + dz * 0.62, 0.025, 1.95, 'steel');
    m.box(3.015, 2.14, z + dz * 0.62, 0.05, 0.057, 0.24, 'rim');
    m.box(2.95, 0.81, z + dz * 1.66, 0.076, 0.11, 0.2, 'red');
  }
  m.box(2.92, 0.74, z, 0.11, 0.16, 2.54, 'steel');

  const cab = [
    [-15.73, 0.92], [-15.83, 1.45], [-15.73, 2.33], [-15.47, 2.88],
    [-15.11, 3.12], [-13.22, 3.11], [-12.81, 2.82], [-12.76, 1.05],
    [-13.08, 0.92],
  ];
  m.profile(cab, z, 2.26, 'teal', 0.075);
  m.rounded(-14.35, 3.1, z, 2.58, 0.24, 2.31, 0.11, 'tealLight');
  m.rounded(-15.52, 0.78, z, 0.65, 0.33, 2.46, 0.11, 'tealDark');
  m.rounded(-15.75, 1.29, z, 0.21, 0.69, 1.65, 0.06, 'black');
  for (let y = 1.08; y <= 1.6; y += 0.105) {
    m.box(-15.872, y, z, 0.035, 0.035, 1.58, 'steel');
  }
  for (const dz of [-0.52, 0.52]) {
    m.part(geometries.box, 'glassEdge', [-15.828, 2.13, z + dz], [0.066, 0.75, 1.027], [0, 0, -0.16]);
    m.part(geometries.box, 'glass', [-15.869, 2.13, z + dz], [0.026, 0.66, 0.956], [0, 0, -0.16]);
    m.beam([-15.924, 1.89, z + dz - 0.27], [-15.904, 2.02, z + dz + 0.27], 0.022, 0.025, 'black');
  }
  for (const side of sides) {
    const cabSide = z + side * 1.218;
    m.profile([[-15.46, 1.82], [-15.39, 2.49], [-15.19, 2.6], [-14.12, 2.6], [-14.08, 1.84]], cabSide, 0.032, 'glassEdge');
    m.profile([[-15.38, 1.88], [-15.3, 2.44], [-15.12, 2.54], [-14.18, 2.54], [-14.15, 1.9]], cabSide + side * 0.02, 0.025, 'glass');
    m.profile([[-13.97, 1.0], [-13.97, 2.64], [-13.1, 2.66], [-13.08, 1.03]], cabSide, 0.027, 'tealDark');
    m.profile([[-13.91, 1.05], [-13.91, 2.58], [-13.16, 2.6], [-13.14, 1.06]], cabSide + side * 0.02, 0.023, 'teal');
    m.box(-14.15, 1.7, cabSide + side * 0.025, 0.27, 0.058, 0.05, 'black');
    m.rounded(-15.79, 0.936, z + side * 0.94, 0.18, 0.22, 0.35, 0.04, 'lamp');
    m.box(-15.872, 0.92, z + side * 1.064, 0.032, 0.09, 0.1, 'amber');
    m.beam([-15.3, 2.44, cabSide], [-15.25, 2.42, cabSide + side * 0.34], 0.05, 0.05, 'black');
    m.rounded(-15.25, 2.25, cabSide + side * 0.34, 0.16, 0.42, 0.2, 0.04, 'tealDark');
    for (const y of [0.55, 0.72, 0.89]) {
      m.box(-13.53, y, z + side * 1.12, 0.6, 0.072, 0.32, 'steel');
    }
    m.cylinder(-12.66, 0.74, z + side * 0.86, 0.25, 0.76, 'steel', 'x');
    m.box(-11.64, 1.005, z + side * 0.97, 1.66, 0.14, 0.58, 'tealDark');
  }
  for (const x of [-14.66, -12.17, -11.1]) wheel(m, x, z, 0.98, 0.49);
  for (const x of [0.48, 1.37, 2.26]) wheel(m, x, z, 0.99, 0.425);
}

function addGantry(m, { trolleyX = 2.1, trolleyZ = -3.06, headY = 4.81, gripCount = 3, gripLength = 0.77 } = {}) {
  const rails = [-5.49, -0.79];
  const railY = 5.43;
  for (const z of rails) {
    m.box(-2.91, railY, z, 18.95, 0.29, 0.17, 'tealDark');
    for (const y of [railY - 0.16, railY + 0.16]) {
      m.box(-2.91, y, z, 18.95, 0.073, 0.37, 'teal');
    }
    m.box(-2.91, railY + 0.216, z, 18.99, 0.055, 0.19, 'silver');
    for (const x of [-12.03, -7.59, -3.01, 1.59, 6.18]) {
      m.box(x, 2.64, z, 0.22, 5.28, 0.25, 'tealDark');
      m.box(x, 0.035, z, 0.53, 0.07, 0.52, 'steel');
      m.box(x, 5.22, z, 0.42, 0.075, 0.38, 'tealLight');
      for (const dx of [-0.15, 0.15]) {
        for (const dz of [-0.15, 0.15]) m.cylinder(x + dx, 0.086, z + dz, 0.034, 0.033, 'rim', 'y', 'bolt');
      }
      m.beam([x, 4.65, z], [x + 0.65, 5.29, z], 0.11, 0.14, 'teal');
      m.beam([x, 4.65, z], [x - 0.65, 5.29, z], 0.11, 0.14, 'teal');
    }
    for (const x of [-12.36, 6.54]) {
      m.box(x, 5.63, z, 0.14, 0.2, 0.43, 'steel');
      m.box(x, 5.72, z + 0.06, 0.16, 0.11, 0.11, 'red');
    }
  }

  for (const x of [trolleyX - 0.68, trolleyX + 0.68]) {
    m.box(x, 5.88, -3.14, 0.27, 0.35, 5.39, 'teal');
    m.box(x, 6.063, -3.14, 0.32, 0.052, 5.39, 'tealLight');
    for (const z of rails) {
      m.box(x, 5.69, z, 0.83, 0.17, 0.48, 'tealDark');
      for (const dx of [-0.27, 0.27]) m.cylinder(x + dx, 5.68, z + 0.23, 0.105, 0.1, 'steel', 'z');
    }
    m.box(x, 6.12, -3.14, 0.09, 0.038, 5.32, 'zinc');
  }
  m.box(trolleyX, 6.09, trolleyZ, 1.8, 0.19, 1.16, 'tealDark');
  m.box(trolleyX, 6.25, trolleyZ - 0.37, 1.55, 0.22, 0.42, 'tealLight');
  for (const dx of [-0.21, 0.21]) {
    m.box(trolleyX + dx, 7.66, trolleyZ, 0.125, 2.94, 0.18, 'tealDark');
    m.box(trolleyX + dx + 0.075, 7.66, trolleyZ, 0.045, 2.9, 0.16, 'tealLight');
  }
  for (const y of [6.47, 7.21, 7.95, 9.1]) m.box(trolleyX, y, trolleyZ, 0.63, 0.1, 0.27, 'teal');
  m.box(trolleyX, 8.96, trolleyZ + 0.2, 0.69, 0.12, 0.18, 'tealLight');
  m.box(trolleyX, (6.1 + headY) / 2, trolleyZ, 0.34, 6.1 - headY, 0.34, 'steel');
  m.box(trolleyX, headY, trolleyZ, 1.83, 0.19, 1.2, 'tealDark');
  const transverseGrips = gripCount === 2;
  m.box(trolleyX, headY - 0.17, trolleyZ, 1.43, 0.15, transverseGrips ? 1.1 : 0.82, 'tealLight');
  for (let grip = 0; grip < gripCount; grip++) {
    const offset = (grip - (gripCount - 1) / 2) * 0.52;
    const x = trolleyX + (transverseGrips ? 0 : offset);
    const z = trolleyZ + (transverseGrips ? offset : 0.16);
    const radius = transverseGrips ? 0.221 : 0.19;
    m.cylinder(x, headY - 0.24 - gripLength / 2, z, radius, gripLength, 'teal');
    m.cylinder(x, headY - 0.23 - gripLength, z, radius - 0.01, 0.064, 'tealDark');
  }
  m.box(5.57, 6.26, -0.79, 0.065, 1.2, 0.065, 'tealDark');
  m.cylinder(5.57, 6.89, -0.79, 0.094, 0.09, 'amber');
}

function conveyor(m, { x, z, length, width = 1.32, y = 0.97, direction = 'x', rollerPitch = 0.18, rollerPositions, skidBase = false }) {
  const alongX = direction === 'x';
  const point = (distance, height, across) => alongX
    ? [x + distance, height, z + across]
    : [x + across, height, z + distance];
  const frame = (distance, height, across, span, thickness, depth, material) => {
    m.box(...point(distance, height, across), alongX ? span : depth, thickness, alongX ? depth : span, material);
  };

  for (const edge of [-1, 1]) {
    frame(0, y - 0.03, edge * width / 2, length, 0.155, 0.075, 'zinc');
    frame(0, y + 0.053, edge * width / 2, length, 0.035, 0.101, 'silver');
    frame(0, y - 0.127, edge * width / 2, length, 0.041, 0.103, 'steel');
    frame(0, y - 0.17, edge * width * 0.19, length, 0.057, 0.052, 'steel');
    if (skidBase) frame(0, 0.055, edge * (width / 2 - 0.064), length, 0.085, 0.2, 'zinc');
  }
  const rollers = rollerPositions?.length ?? Math.max(1, Math.floor(length / rollerPitch));
  for (let index = 0; index < rollers; index++) {
    const fraction = rollerPositions?.[index] ?? (index + 0.5) / rollers;
    const at = (fraction - 0.5) * (length - 0.09);
    m.cylinder(...point(at, y, 0), 0.055, width - 0.067, 'rollerSteel', alongX ? 'z' : 'x');
  }
  const frames = Math.max(2, Math.ceil(length / 1.67) + 1);
  for (let index = 0; index < frames; index++) {
    const at = (index / (frames - 1) - 0.5) * (length - 0.26);
    for (const side of [-1, 1]) {
      const across = side * (width / 2 - 0.072);
      frame(at, (y - 0.13) / 2, across, 0.078, y - 0.13, 0.078, 'steel');
      frame(at, 0.032, across, 0.19, 0.062, 0.16, 'zinc');
      if (index < frames - 1) {
        m.beam(point(at, y - 0.15, across), point(at + 0.34, 0.34, across), 0.042, 0.047, 'zinc');
      }
    }
    frame(at, 0.32, 0, 0.055, 0.065, width - 0.1, 'steel');
  }
}

function cabinet(m, x, z, w, h, d) {
  m.box(x, 0.076, z, w * 0.94, 0.15, d * 0.94, 'black');
  m.rounded(x, h / 2 + 0.15, z, w, h, d, 0.034, 'cabinet');
  m.box(x, h / 2 + 0.15, z + d / 2, w * 0.89, h * 0.88, 0.033, 'zinc');
  m.box(x - w * 0.16, h * 0.77 + 0.15, z + d / 2 + 0.022, w * 0.3, 0.14, 0.036, 'cabinetDark');
  m.box(x + w * 0.32, h * 0.58 + 0.15, z + d / 2 + 0.041, 0.055, 0.18, 0.052, 'black');
  for (let index = 0; index < 4; index++) {
    m.box(x, h * 0.32 + 0.15 - index * 0.039, z + d / 2 + 0.019, w * 0.46, 0.012, 0.009, 'cabinetDark');
  }
  m.box(x, h + 0.16, z, w * 1.05, 0.06, d * 1.05, 'zinc');
}

function addInboundConveyors(m) {
  const { rollerY: y, bedStart } = endTransfer;
  const liftX = 9.82;
  const liftZ = 2.14;
  const feedStart = bedStart + warehouse.areaOffset;
  conveyor(m, { x: -4.28, z: 0.02, length: 14.8, width: 0.91, y });
  conveyor(m, { x: -1.31, z: 2.295, length: 3.49, width: 0.94, y: 0.73, direction: 'z' });
  conveyor(m, { x: -2.03, z: 4.61, length: 2.35, width: 1.05, y: 0.64 });

  for (const x of [3.78, 7.92]) {
    conveyor(m, { x, z: 2.4, length: 5.42, width: 1.22, y, direction: 'z' });
  }
  for (const z of [0.48, 1.71, 2.94, 4.17]) {
    conveyor(m, { x: 5.85, z, length: 2.83, width: 0.88, y });
  }
  conveyor(m, { x: 8.83, z: 4.17, length: 0.52, width: 0.88, y });

  for (const [x, start, end, width, rollerPitch] of [
    [liftX, feedStart, liftZ - 0.94, 1.38, 0.36],
    [liftX, liftZ - 0.91, liftZ + 0.91, 1.38, 0.18],
    [liftX, liftZ + 0.94, 5.61, 1.38, 0.18],
    [11.59, feedStart, 1.08, 1.08, 0.38],
  ]) {
    conveyor(m, { x, z: (start + end) / 2, length: end - start, width, y, direction: 'z', rollerPitch });
  }
  cabinet(m, 2.31, -0.92, 0.81, 1.49, 0.62);
  cabinet(m, 2.56, 1.83, 0.46, 1.11, 0.57);
  cabinet(m, 11.04, 2.21, 0.54, 1.22, 0.58);
  cabinet(m, 11.72, 2.21, 0.48, 1.04, 0.57);
  cabinet(m, 12.19, 3.63, 0.37, 0.9, 0.43);
  addInboundLift(m, liftX, liftZ, y);
}

function addInboundLift(m, x, z, deckY) {
  const postHeight = 2.72;
  for (const side of [-1, 1]) {
    const sideX = x + side * 0.84;
    for (const end of [-0.96, 0.96]) {
      m.box(sideX, postHeight / 2, z + end, 0.105, postHeight, 0.105, 'blue');
      m.box(sideX, 0.065, z + end, 0.2, 0.13, 0.21, 'steel');
    }
    for (const height of [0.21, 0.61, 1.94, 2.68]) {
      m.box(sideX, height, z, 0.095, 0.095, 1.94, height > 2 ? 'blueLight' : 'blue');
    }
    m.box(sideX - side * 0.105, 1.44, z, 0.06, 2.32, 0.17, 'zinc');
    m.box(sideX - side * 0.13, deckY - 0.1, z, 0.12, 0.17, 1.83, 'blueLight');
    for (let at = -0.78; at < 0.85; at += 0.14) {
      m.box(sideX, 1.28, z + at, 0.012, 1.29, 0.012, 'mesh', false);
    }
    for (let height = 0.74; height < 1.92; height += 0.13) {
      m.box(sideX, height, z, 0.012, 0.012, 1.79, 'mesh', false);
    }
    m.box(x, 2.68, z + side * 0.96, 1.68, 0.095, 0.095, 'blueLight');
  }
  m.box(x, 0.29, z, 1.47, 0.13, 1.78, 'blue');
  m.box(x, 2.27, z, 1.57, 0.11, 1.25, 'zinc');
  m.box(x + 0.62, 2.39, z, 0.39, 0.19, 0.52, 'blue');
}

function addManualIntake(m) {
  const z = manualIntake.z + warehouse.areaOffset;
  const y = 0.77;
  for (const offset of [-0.455, 0.455]) {
    for (const [start, end] of [[7.58, 10.93], [10.97, 14.76]]) {
      conveyor(m, { x: (start + end) / 2, z: z + offset, length: end - start, width: 0.79, y, rollerPitch: 0.15 });
    }
  }

  const portalX = 11.32;
  const portalY = 2.51;
  for (const side of [-1, 1]) {
    const edgeZ = z + side * 0.88;
    const postZ = z + side * 0.98;
    m.part(geometries.box, 'zinc', [9.32, y + 0.19, edgeZ], [3.05, 0.041, 0.29], [side * 0.62, 0, 0]);
    m.box(9.33, 0.3, edgeZ - side * 0.05, 3.27, 0.09, 0.08, 'zinc');
    m.box(portalX, portalY / 2, postZ, 0.08, portalY, 0.083, 'silver');
    m.box(portalX, 0.032, postZ, 0.25, 0.064, 0.2, 'steel');
    m.beam([portalX - 0.71, 0.06, postZ], [portalX, 1.08, postZ], 0.075, 0.073, 'zinc');
    m.box(portalX + 0.03, 1.14, postZ - side * 0.066, 0.09, 0.26, 0.061, 'cabinetDark');
    m.box(portalX + 0.025, 1.18, postZ - side * 0.1, 0.044, 0.035, 0.01, 'blueLight');
  }
  m.box(portalX, portalY, z, 0.094, 0.093, 2.04, 'silver');

  const controlZ = z - 1.17;
  m.box(8.41, 0.033, controlZ, 0.24, 0.066, 0.24, 'steel');
  m.box(8.41, 0.56, controlZ, 0.09, 1.1, 0.1, 'zinc');
  m.part(geometries.box, 'cabinet', [8.4, 1.135, controlZ], [0.29, 0.15, 0.37], [0, 0, 0.22]);
  m.cylinder(8.37, 1.242, controlZ - 0.09, 0.045, 0.061, 'red');
  for (const dz of [0.021, 0.112]) m.cylinder(8.42, 1.235, controlZ + dz, 0.026, 0.035, 'blueLight');

  const panelZ = z + 1.4;
  m.box(11.55, 1.66, panelZ, 0.26, 0.62, 0.41, 'cabinet');
  m.box(11.38, 1.8, panelZ, 0.041, 0.12, 0.27, 'cabinetDark');
  m.cylinder(11.365, 1.57, panelZ - 0.085, 0.051, 0.068, 'red', 'x');
  m.cylinder(11.365, 1.57, panelZ + 0.085, 0.049, 0.068, 'blue', 'x');
  m.beam([11.56, 1.38, panelZ], [11.62, 0.65, panelZ], 0.04, 0.043, 'black');
}

function railPair(m, { start, end, center, gauge, direction = 'x' }) {
  const span = end - start;
  const middle = (start + end) / 2;
  const alongX = direction === 'x';
  const beam = (at, across, y, length, height, width, material) => m.box(
    alongX ? at : across, y, alongX ? across : at,
    alongX ? length : width, height, alongX ? width : length, material,
  );
  for (const side of [-1, 1]) {
    const across = center + side * gauge / 2;
    beam(middle, across, 0.049, span, 0.045, 0.13, 'steel');
    beam(middle, across, 0.082, span, 0.026, 0.062, 'silver');
  }
  for (let at = start + 0.15; at < end - 0.1; at += 0.96) {
    beam(at, center, 0.023, 0.105, 0.037, gauge + 0.23, 'blue');
  }
}

function addRackTransfer(m, outbound) {
  const { railStart, railEnd, railZ, gauge, bedStart } = endTransfer;
  const { areaOffset, rack } = warehouse;
  const rollerY = outbound ? 0.82 : endTransfer.rollerY;
  const railCenter = railZ + areaOffset;
  railPair(m, { start: railStart, end: railEnd, center: railCenter, gauge });
  for (const x of [railStart + 0.13, railEnd - 0.13]) {
    for (const side of [-1, 1]) {
      m.box(x, 0.14, railCenter + side * gauge / 2, 0.16, 0.24, 0.17, 'yellow');
    }
  }

  const start = bedStart + areaOffset;
  const end = (outbound ? -rack.farEnd : rackStart) + areaOffset - 0.08;
  const width = 0.81;
  const stations = [];
  for (let row = 0; row < rack.rows; row++) {
    const face = rack.face + row * rack.rowPitch;
    for (let station = 0; station < stationsPerRow; station++) {
      stations.push(face + station * stationPitch + stationDepth / 2);
    }
  }
  for (const x of stations) {
    conveyor(m, {
      x, z: (start + end) / 2, length: end - start, width, y: rollerY, direction: 'z',
      rollerPositions: [0.06, 0.34, 0.42, 0.5, 0.58, 0.79, 0.94], skidBase: true,
    });
    for (const edge of [-1, 1]) {
      const guideX = x + edge * (width / 2 - 0.02);
      m.box(guideX, rollerY + 0.175, (start + end) / 2, 0.052, 0.057, end - start - 0.35, 'zinc');
      for (const z of [start + 0.35, end - 0.36]) {
        m.box(guideX, rollerY + 0.075, z, 0.073, 0.27, 0.073, 'steel');
      }
    }
    m.box(x + 0.21, rollerY - 0.27, start + 0.59, 0.22, 0.17, 0.33, 'blue');
    m.cylinder(x + 0.21, rollerY - 0.27, start + 0.4, 0.073, 0.16, 'blue', 'z');
  }

  const cartX = stations.at(-1);
  m.box(cartX, 0.25, railCenter, 1.52, 0.26, 1.81, 'blue');
  m.box(cartX, rollerY - 0.18, railCenter, 1.43, 0.32, 1.72, 'blueLight');
  for (const dz of [-gauge / 2, gauge / 2]) {
    for (const dx of [-0.51, 0.51]) {
      m.cylinder(cartX + dx, 0.17, railCenter + dz, 0.1, 0.12, 'steel', 'z');
    }
  }
  if (outbound) {
    m.box(cartX, rollerY + 0.01, railCenter, 1.14, 0.09, 1.69, 'silver');
    for (const dx of [-0.69, 0.69]) {
      m.box(cartX + dx, rollerY, railCenter, 0.25, 0.28, 1.82, 'blue');
      m.box(cartX + dx, rollerY + 0.15, railCenter, 0.24, 0.055, 1.73, 'blueLight');
    }
    m.cylinder(cartX + 0.68, rollerY + 0.205, railCenter - 0.64, 0.047, 0.06, 'amber');
    const loadZ = end - 0.62;
    m.box(cartX, rollerY + 0.08, loadZ, 0.79, 0.095, 0.96, 'zinc');
    for (const dx of [-0.19, 0.19]) {
      for (const dz of [-0.29, 0, 0.29]) {
        m.cylinder(cartX + dx, rollerY + 0.29, loadZ + dz, 0.135, 0.33, 'rackWhite');
        m.cylinder(cartX + dx, rollerY + 0.46, loadZ + dz, 0.14, 0.028, 'silver');
      }
    }
    return;
  }
  for (let dz = -0.78; dz <= 0.8; dz += 0.17) {
    m.cylinder(cartX, rollerY, railCenter + dz, 0.049, 1.22, 'silver', 'x');
  }
  for (const dx of [-0.71, 0.71]) m.box(cartX + dx, rollerY, railCenter, 0.09, 0.14, 1.85, 'blue');
  m.box(cartX + 0.64, rollerY + 0.19, railCenter - 0.52, 0.31, 0.4, 0.48, 'blue');
  m.cylinder(cartX + 0.64, rollerY + 0.42, railCenter - 0.52, 0.059, 0.077, 'amber');
}

function addOutboundConveyors(m) {
  const y = 0.82;
  const liftX = 10.29;
  const liftZ = 1.56;
  const feedStart = endTransfer.bedStart + warehouse.areaOffset;
  conveyor(m, { x: -3.7, z: 0.11, length: 13.55, width: 0.96, y });
  conveyor(m, { x: 3.43, z: -2.23, length: 3.32, width: 1.44, y, direction: 'z' });
  conveyor(m, { x: 5.7, z: 0.11, length: 5.2, width: 1.18, y });
  conveyor(m, { x: 6.11, z: 3.28, length: 4.38, width: 1.18, y });
  conveyor(m, { x: 4.4, z: 1.7, length: 1.92, width: 0.98, y, direction: 'z', rollerPitch: 0.31 });
  conveyor(m, { x: liftX, z: liftZ, length: 1.6, width: 1.22, y });
  for (const [x, start, end, width, rollerPitch] of [
    [8.91, feedStart, -2.52, 1.12, 0.38],
    [8.91, -2.49, 0.71, 1.12, 0.35],
    [8.91, 0.74, 2.19, 1.12, 0.18],
    [8.91, 2.22, 4.55, 1.12, 0.33],
    [11.67, feedStart, 4.38, 1.05, 0.4],
  ]) {
    conveyor(m, { x, z: (start + end) / 2, length: end - start, width, y, direction: 'z', rollerPitch });
  }
  m.box(8.91, y + 0.075, 4.22, 1.01, 0.056, 0.59, 'zinc');
  m.box(5.76, y + 0.075, 3.28, 1.17, 0.05, 1.06, 'zinc');
  for (const [x, z] of [[4.96, 3.28], [7.29, 0.11]]) {
    for (const edge of [-1, 1]) {
      m.box(x, 1.13, z + edge * 0.69, 0.055, 2.26, 0.052, 'silver');
      m.box(x, 1.09, z + edge * 0.651, 0.088, 0.15, 0.053, 'cabinetDark');
    }
    m.box(x, 2.25, z, 0.055, 0.058, 1.42, 'silver');
  }
  cabinet(m, 2.52, -1.31, 0.47, 1.05, 0.54);
  cabinet(m, 4.46, 4.31, 0.5, 1.18, 0.54);
  cabinet(m, 10.32, 3.58, 0.56, 1.11, 0.51);
  cabinet(m, 12.36, 2.76, 0.41, 0.9, 0.52);
  addOutboundLift(m, liftX, liftZ, y);
}

function addOutboundLift(m, cx, cz, rollerY) {
  const xs = [cx - 0.78, cx + 0.78];
  const zs = [cz - 0.84, cz + 0.84];
  for (const x of xs) {
    for (const z of zs) {
      m.box(x, 1.32, z, 0.11, 2.64, 0.11, 'blue');
      m.box(x, 0.07, z, 0.22, 0.14, 0.22, 'steel');
    }
    m.box(x, 2.63, cz, 0.11, 0.13, 1.73, 'blueLight');
    m.box(x, 1.51, cz, 0.085, 0.085, 1.67, 'blue');
  }
  for (const z of zs) {
    m.box(cx, 2.63, z, 1.62, 0.13, 0.11, 'blueLight');
    m.box(cx, 1.5, z, 1.62, 0.085, 0.08, 'blue');
    m.box(cx, 0.62, z, 1.62, 0.085, 0.08, 'blue');
    m.beam([xs[0], 0.64, z], [xs[1], 1.51, z], 0.054, 0.056, 'blue');
    for (const x of [cx - 0.54, cx + 0.54]) m.box(x, 1.55, z, 0.053, 2.05, 0.059, 'zinc');
    for (let x = xs[0] + 0.14; x < xs[1]; x += 0.17) m.box(x, 1.99, z, 0.014, 0.9, 0.014, 'blueLight', false);
    for (let y = 1.67; y < 2.57; y += 0.16) m.box(cx, y, z, 1.49, 0.014, 0.014, 'blueLight', false);
  }
  m.box(cx, 0.26, cz, 1.52, 0.15, 1.58, 'blue');
  m.box(cx, rollerY - 0.18, cz, 1.51, 0.18, 1.32, 'blueLight');
  m.box(cx, 2.32, cz, 1.49, 0.105, 1.43, 'zinc');
  m.box(cx + 0.4, 2.7, cz, 0.36, 0.14, 1.7, 'blue');
  m.cylinder(cx + 0.4, 2.9, cz + 0.63, 0.075, 0.13, 'amber');
}

function addRackColumn(m, face, { frontFace, manualOpening, innerSide }) {
  const back = face + columnDepth;
  const { bays, levels, bayWidth: width, levelPitch: spacing } = warehouse.rack;
  const startZ = rackStart;
  const height = levels * spacing + 0.66;
  for (let upright = 0; upright <= bays; upright++) {
    const z = startZ + upright * width;
    for (const x of [face, back]) {
      m.box(x, height / 2, z, 0.086, height, 0.104, 'rackWhite');
      m.box(x, 0.027, z, 0.106, 0.054, 0.22, 'steel');
      if (upright < 3 || upright > bays - 3) {
        for (const side of [-1, 1]) {
          m.box(x + side * 0.034, height / 2, z + 0.056, 0.015, height - 0.13, 0.016, 'silver');
        }
        for (let y = 0.22; y < height - 0.1; y += 0.2) {
          m.box(x, y, z + 0.054, 0.018, 0.019, 0.007, 'cabinetDark', false);
        }
      }
      if (frontFace && x === face) {
        for (let level = 0; level < levels; level++) {
          const y = 0.63 + level * spacing;
          m.box(x - 0.067, y, z, 0.041, 0.244, 0.181, 'rackWhite');
          for (const dy of [-0.07, 0.07]) m.cylinder(x - 0.092, y + dy, z, 0.026, 0.023, 'steel', 'x', 'bolt');
        }
      }
    }
    for (let level = 0; level <= levels; level++) {
      const y = 0.27 + level * spacing;
      m.box((face + back) / 2, y, z, columnDepth, 0.055, 0.053, 'rackWhite');
      if (level === levels) continue;
      const rising = (level % 2 === 0) === (innerSide === 'back');
      const [left, right] = rising ? [face, back] : [back, face];
      m.beam([left, y, z], [right, y + spacing, z], 0.039, 0.042, 'rackWhite');
    }
  }
  for (let bay = 0; bay < bays; bay++) {
    const z = startZ + (bay + 0.5) * width;
    const firstLevel = manualOpening && bay === manualIntake.bay ? 1 : 0;
    for (let level = firstLevel; level < levels; level++) {
      const y = 0.63 + level * spacing;
      for (const x of [face, back]) {
        m.box(x, y, z, 0.071, 0.105, width - 0.088, 'rackWhite');
      }
      for (const fraction of [-0.38, 0.38]) {
        m.box((face + back) / 2, y + 0.061, z + fraction * width, columnDepth, 0.053, 0.055, 'rackWhite');
      }
      for (const x of [face + columnDepth * 0.21, back - columnDepth * 0.21]) {
        m.box(x, y + 0.087, z, 0.066, 0.033, width - 0.14, 'rackWhite');
      }
      if (bay % 4 === 0) {
        const innerX = innerSide === 'back' ? back : face;
        const edges = [z - width * 0.47, z + width * 0.47];
        m.beam([innerX, y + 0.09, edges[level % 2]], [innerX, y + spacing - 0.06, edges[(level + 1) % 2]], 0.036, 0.038, 'rackWhite');
      }
    }
    m.box(face, height - 0.27, z, 0.089, 0.116, width, 'rackWhite');
    m.box(back, height - 0.27, z, 0.089, 0.116, width, 'rackWhite');
  }
}

function addStackerGuideway(m, x) {
  const start = rackStart - 1.76;
  const end = warehouse.rack.farEnd + 1.76;
  const z = (start + end) / 2;
  const length = end - start;
  m.box(x, 0.032, z, 0.17, 0.049, length, 'steel');
  m.box(x, 0.079, z, 0.049, 0.059, length, 'drumSteel');
  m.box(x, 0.116, z, 0.081, 0.023, length, 'silver');
  for (let at = start + 0.32; at < end - 0.24; at += 0.87) {
    m.box(x, 0.019, at, 0.265, 0.032, 0.115, 'steel');
    for (const dx of [-0.101, 0.101]) m.cylinder(x + dx, 0.044, at, 0.019, 0.025, 'silver', 'y', 'bolt');
  }
  for (const endZ of [start + 0.15, end - 0.15]) {
    m.box(x, 0.14, endZ, 0.285, 0.28, 0.275, 'coping');
    m.box(x, 0.198, endZ + (endZ < 0 ? 0.151 : -0.151), 0.134, 0.092, 0.045, 'black');
  }
  m.box(x, upperGuideY, z, 0.065, 0.13, length, 'steel');
  m.box(x, upperGuideY + 0.077, z, 0.14, 0.032, length, 'rackWhite');
}

function addRack(m) {
  const { face, bays, bayWidth, rows, rowPitch, farEnd } = warehouse.rack;
  for (let row = 0; row < rows; row++) {
    const x = face + row * rowPitch;
    for (let station = 0; station < stationsPerRow; station++) {
      const stationFace = x + station * stationPitch;
      for (let column = 0; column < columnsPerStation; column++) {
        addRackColumn(m, stationFace + column * columnPitch, {
          frontFace: row === 0 && station === 0 && column === 0,
          manualOpening: row === 0,
          innerSide: column === 0 ? 'back' : 'face',
        });
      }
      const spacerX = stationFace + stationDepth / 2;
      for (let upright = 0; upright <= bays; upright += 4) {
        const z = rackStart + upright * bayWidth;
        for (const y of [1.45, 5.42, 9.38]) m.box(spacerX, y, z, columnGap + 0.04, 0.05, 0.07, 'steel');
      }
    }
    const spacerX = x + stationDepth + stationGap / 2;
    for (let upright = 0; upright <= bays; upright += 4) {
      const z = rackStart + upright * bayWidth;
      for (const y of [1.45, 5.42, 9.38]) m.box(spacerX, y, z, stationGap + 0.04, 0.05, 0.07, 'steel');
    }
    for (const z of [rackStart, farEnd]) {
      m.box(x - 0.25, 0.36, z, 0.13, 0.67, 0.27, 'rackWhite');
      m.box(x - 0.25, 0.1, z, 0.16, 0.15, 0.3, 'steel');
    }
    if (row === 0) continue;
    const aisleCenter = x - aisleWidth / 2;
    addStackerGuideway(m, aisleCenter);
    for (let index = 0; index < bays; index += 4) {
      const z = rackStart + index * bayWidth;
      m.box(aisleCenter, upperGuideY + 0.12, z, aisleWidth + 0.14, 0.088, 0.116, 'rackWhite');
    }
    m.box(aisleCenter, upperGuideY + 0.12, farEnd, aisleWidth + 0.14, 0.088, 0.116, 'rackWhite');
  }
}

function addCraneRunways(m, wallTrackX, roofTrackX, railY) {
  const wallX = -12.9;
  const roofY = 15.52;
  const startZ = -29.55;
  const endZ = 19.2;
  const centerZ = (startZ + endZ) / 2;
  const length = endZ - startZ;

  for (const x of [wallTrackX, roofTrackX]) {
    m.box(x, railY - 0.22, centerZ, 0.16, 0.37, length, 'cabinetDark');
    for (const y of [railY - 0.43, railY - 0.015]) m.box(x, y, centerZ, 0.35, 0.07, length, 'steel');
    m.box(x, railY + 0.045, centerZ, 0.11, 0.055, length, 'silver');
    for (const z of [startZ + 0.18, endZ - 0.18]) {
      m.box(x, railY + 0.15, z, 0.33, 0.19, 0.15, 'crane');
    }
  }

  m.box(wallX, railY - 0.64, centerZ, 0.28, 0.86, length, 'concrete');
  m.box(roofTrackX, roofY, centerZ, 0.39, 0.35, length, 'cabinetDark');
  for (const y of [roofY - 0.19, roofY + 0.19]) m.box(roofTrackX, y, centerZ, 0.52, 0.065, length, 'steel');

  for (let z = startZ + 0.65; z < endZ; z += 5.9) {
    m.box(wallX + 0.15, railY - 0.69, z, 0.1, 0.84, 0.44, 'steel');
    m.box((wallX + wallTrackX) / 2, railY - 0.52, z, wallTrackX - wallX + 0.27, 0.16, 0.28, 'steel');
    m.beam([wallX + 0.16, railY - 1.03, z], [wallTrackX - 0.11, railY - 0.51, z], 0.15, 0.14, 'cabinetDark');

    m.box(roofTrackX + 0.72, roofY + 0.27, z, 2.04, 0.16, 0.34, 'steel');
    const hangerBottom = railY - 0.36;
    m.box(roofTrackX + 0.43, (hangerBottom + roofY) / 2, z, 0.13, roofY - hangerBottom, 0.14, 'cabinetDark');
    m.box(roofTrackX + 0.12, railY - 0.32, z, 0.78, 0.19, 0.34, 'steel');
  }
}

function addCranes(m) {
  const startX = -11.32;
  const endX = 11.5;
  const railY = 13.02;
  addCraneRunways(m, startX, endX, railY);

  const hook = new THREE.TorusGeometry(0.144, 0.032, 8, 20, Math.PI * 1.54);
  const length = endX - startX + 0.58;
  const centerX = (startX + endX) / 2;
  const beamY = railY + 0.53;
  for (const { z, trolleyX, blockY } of [
    { z: -23.05, trolleyX: -5.42, blockY: 9.88 },
    { z: -5.15, trolleyX: 0.46, blockY: 9.06 },
    { z: 13.4, trolleyX: 6.8, blockY: 9.6 },
  ]) {
    for (const dz of [-0.48, 0.48]) {
      m.box(centerX, beamY, z + dz, length, 0.52, 0.34, 'crane');
      m.box(centerX, beamY - 0.273, z + dz, length, 0.09, 0.44, 'craneDark');
      m.box(centerX, beamY + 0.277, z + dz, length, 0.084, 0.43, 'craneRail');
      m.box(centerX, beamY + 0.334, z + dz, length - 0.5, 0.036, 0.058, 'steel');
      for (let x = startX + 0.7; x < endX; x += 2.55) {
        m.box(x, beamY - 0.02, z + dz, 0.067, 0.46, 0.37, 'craneDark');
      }
    }
    for (const x of [startX, endX]) {
      m.box(x, railY + 0.22, z, 0.41, 0.24, 2.04, 'craneDark');
      for (const dz of [-0.76, 0.76]) m.cylinder(x, railY + 0.14, z + dz, 0.12, 0.3, 'steel', 'x');
    }
    m.box(centerX, beamY - 0.14, z + 0.78, length - 0.4, 0.09, 0.52, 'crane');
    for (const y of [beamY + 0.39, beamY + 0.86]) m.box(centerX, y, z + 1.015, length - 0.42, 0.043, 0.044, 'craneRail');
    for (let x = startX; x <= endX; x += 1.6) {
      m.box(x, beamY + 0.38, z + 1.015, 0.053, 0.99, 0.053, 'craneRail');
    }
    m.box(trolleyX, beamY + 0.46, z, 1.2, 0.23, 1.34, 'craneDark');
    m.box(trolleyX, beamY + 0.69, z, 0.62, 0.28, 0.8, 'crane');
    m.cylinder(trolleyX, beamY + 0.71, z - 0.28, 0.17, 0.46, 'steel', 'z');
    const ropeTop = beamY + 0.4;
    for (const dx of [-0.105, 0.105]) {
      m.cylinder(trolleyX + dx, (ropeTop + blockY) / 2, z, 0.013, ropeTop - blockY, 'black');
    }
    m.box(trolleyX, blockY, z, 0.41, 0.24, 0.22, 'crane');
    for (const dx of [-0.115, 0.115]) m.cylinder(trolleyX + dx, blockY, z, 0.079, 0.24, 'craneDark', 'z');
    m.part(hook, 'craneDark', [trolleyX, blockY - 0.25, z], [1, 1, 1], [0, 0, 0.48]);
  }
}

function fence(m, x1, z1, x2, z2, maxPanel = 1.55) {
  const length = Math.hypot(x2 - x1, z2 - z1);
  const panels = Math.ceil(length / maxPanel);
  const at = (t, y) => [THREE.MathUtils.lerp(x1, x2, t), y, THREE.MathUtils.lerp(z1, z2, t)];
  for (let index = 0; index <= panels; index++) {
    const [x, , z] = at(index / panels, 0);
    m.box(x, 0.65, z, 0.062, 1.3, 0.062, 'yellow');
    m.box(x, 0.029, z, 0.145, 0.058, 0.145, 'black');
  }
  for (let index = 0; index < panels; index++) {
    const start = index / panels;
    const end = (index + 1) / panels;
    for (const y of [0.17, 1.26]) m.beam(at(start, y), at(end, y), 0.042, 0.046, 'yellow');
    const wires = Math.ceil(length / panels / 0.139);
    for (let i = 1; i < wires; i++) {
      const [x, , z] = at((index + i / wires) / panels, 0);
      m.box(x, 0.715, z, 0.011, 1.09, 0.011, 'mesh', false);
    }
    for (let y = 0.27; y < 1.24; y += 0.13) m.beam(at(start, y), at(end, y), 0.01, 0.01, 'mesh', false);
  }
}

function addFences(m) {
  fence(m, -10.93, 0.68, -2.01, 0.68);
  fence(m, -0.67, 0.68, 2.89, 0.68);
  fence(m, 2.89, 0.68, 2.89, 5.32);
  fence(m, 2.89, 5.32, 8.76, 5.32);
  fence(m, 8.76, 4.74, 8.76, 5.32);
  fence(m, 8.76, 1.65, 8.76, 3.59);
  fence(m, 5.15, -5.34, 5.15, -3.61);
  fence(m, 5.15, -3.26, 5.15, -1.62);
  fence(m, 5.15, -1.62, 5.15, -0.56);
  m.box(2.89, 0.88, 1.93, 0.08, 0.071, 0.19, 'black');
  for (let panel = 0; panel < 4; panel++) {
    m.box(2.89 + (panel + 0.5) * 1.4675, 0.29, 5.29, 1.39, 0.25, 0.035, 'zinc');
  }
}

function addRackGuard(m) {
  const { face, bays, bayWidth, levels, levelPitch } = warehouse.rack;
  const x = face - 0.17;
  const height = levels * levelPitch + 0.66;
  for (let upright = 0; upright <= bays; upright++) {
    const z = rackStart + upright * bayWidth;
    m.box(x, height / 2, z, 0.064, height, 0.066, 'yellow');
    m.box(x, 0.041, z, 0.19, 0.082, 0.18, 'yellow');
  }
  for (let bay = 0; bay < bays; bay++) {
    const start = rackStart + bay * bayWidth;
    const center = start + bayWidth / 2;
    const bottom = bay === manualIntake.bay ? manualIntake.openingHeight : 0.22;
    m.box(x, bottom, center, 0.054, 0.05, bayWidth, 'yellow');
    m.box(x, height - 0.02, center, 0.05, 0.045, bayWidth, 'yellow');
    for (let y = 0.22 + levelPitch; y < height - 0.08; y += levelPitch) {
      if (y > bottom + 0.1) m.box(x, y, center, 0.05, 0.045, bayWidth, 'yellow');
    }
    for (let offset = 0.153; offset < bayWidth - 0.08; offset += 0.153) {
      m.box(x, (height + bottom) / 2, start + offset, 0.008, height - bottom - 0.04, 0.008, 'guardMesh', false);
    }
    for (let y = bottom + 0.16; y < height - 0.04; y += 0.16) {
      m.box(x, y, center, 0.008, 0.008, bayWidth, 'guardMesh', false);
    }
  }
}

function addOutboundFences(m) {
  fence(m, -12.1, -0.54, 2.62, -0.54);
  fence(m, 4.95, -5.71, 4.95, -1.23);
  fence(m, 4.95, -5.71, 6.06, -5.71);
  fence(m, 4.83, 4.81, 9.93, 4.81);
  fence(m, 9.93, 4.81, 12.45, 4.81);
  fence(m, 12.45, 4.81, 12.45, 3.6);
  m.box(2.54, 0.96, -0.54, 0.088, 0.091, 0.071, 'black');
  m.cylinder(2.54, 1.019, -0.54, 0.039, 0.038, 'red');
}

export function createLoadingStation() {
  const materials = Object.fromEntries(Object.entries(palette).map(([name, [color, roughness, metalness = 0]]) => [
    name, new THREE.MeshStandardMaterial({ name, color, roughness, metalness }),
  ]));
  applySurfaceMaps(materials, warehouse.floor);
  const model = new THREE.Group();
  model.name = '立体仓库';
  model.userData = { unit: 'm', scaleEstimatedFromReference: true };
  const groups = new Map();
  const builders = {
    truck: addTruck,
    gantry: addGantry,
    conveyors: addInboundConveyors,
    'inbound-transfer': (m) => addRackTransfer(m, false),
    'manual-intake': addManualIntake,
    fences: addFences,
    'outbound-gantry': (m) => addGantry(m, { trolleyX: 3.43, trolleyZ: -2.91, headY: 2.68, gripCount: 2, gripLength: 1.31 }),
    'outbound-conveyors': addOutboundConveyors,
    'outbound-transfer': (m) => addRackTransfer(m, true),
    'outbound-fences': addOutboundFences,
    rack: addRack,
    stacker: (m) => addAisleStacker(m, stackerPosition),
    'rack-guard': addRackGuard,
    cranes: addCranes,
    site: addSite,
    walls: (m) => addWarehouseWalls(m, building),
  };

  function addComponent({ id, name, children }, parent) {
    const group = new THREE.Group();
    group.name = name;
    group.userData.component = id;
    parent.add(group);
    groups.set(id, group);
    if (children) {
      const outbound = id === 'outbound';
      group.position.z = outbound ? warehouse.areaOffset : -warehouse.areaOffset;
      if (outbound) group.scale.z = -1;
      for (const child of children) addComponent(child, group);
    } else {
      const builder = new ModelBuilder(group, materials);
      builders[id](builder);
      builder.finish();
    }
  }
  for (const component of components) addComponent(component, model);
  return { model, groups };
}
