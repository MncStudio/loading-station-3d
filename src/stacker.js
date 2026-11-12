function addTravelBase(m, x, z) {
  m.box(x, 0.43, z, 0.5, 0.24, 1.89, 'stackerBlue');
  for (const side of [-1, 1]) {
    const wheelZ = z + side * 0.7;
    m.cylinder(x, 0.28, wheelZ, 0.153, 0.113, 'steel', 'x');
    m.cylinder(x, 0.28, wheelZ, 0.162, 0.082, 'black', 'x');
    m.box(x, 0.32, z + side * 0.94, 0.46, 0.19, 0.13, 'stackerDark');
    m.box(x, 0.32, z + side * 1.028, 0.19, 0.11, 0.058, 'black');
    for (const dx of [-0.18, 0.18]) {
      m.beam([x + dx, 0.45, z + side * 0.79], [x + dx, 1.07, z + side * 0.18], 0.077, 0.093, 'stackerBlue');
    }
  }
  const driveZ = z + 0.67;
  m.box(x, 0.43, driveZ, 0.43, 0.37, 0.44, 'stackerBlue');
  m.box(x, 0.46, driveZ + 0.24, 0.35, 0.32, 0.07, 'blueLight');
  m.cylinder(x, 0.46, driveZ + 0.294, 0.114, 0.08, 'stackerDark', 'z');
  m.cylinder(x, 0.46, driveZ + 0.353, 0.098, 0.057, 'red', 'z');
  for (const dx of [-0.14, 0.14]) {
    for (const y of [0.34, 0.58]) m.cylinder(x + dx, y, driveZ + 0.289, 0.018, 0.028, 'silver', 'z', 'bolt');
  }
  m.box(x + 0.245, 0.46, z + 0.48, 0.165, 0.19, 0.19, 'stackerBlue');
  m.box(x + 0.38, 0.46, z + 0.48, 0.22, 0.27, 0.3, 'stackerDark');
  m.cylinder(x + 0.38, 0.81, z + 0.48, 0.105, 0.51, 'stackerBlue');
  for (let y = 0.61; y < 0.98; y += 0.063) m.cylinder(x + 0.38, y, z + 0.48, 0.108, 0.019, 'stackerDark');
  m.box(x + 0.38, 0.935, z + 0.589, 0.119, 0.07, 0.007, 'rackWhite');
  m.box(x - 0.37, 0.72, z - 0.37, 0.23, 0.61, 0.31, 'stackerDark');
  m.box(x - 0.37, 0.73, z - 0.209, 0.19, 0.49, 0.031, 'cabinet');
}

function addHoist(m, x, z) {
  const y = 1.79;
  const drumZ = z + 0.48;
  m.box(x, y - 0.27, drumZ, 1.12, 0.095, 0.47, 'stackerBlue');
  m.box(x, y - 0.27, z + 0.216, 0.26, 0.093, 0.166, 'stackerBlue');
  m.box(x, y, drumZ, 0.23, 0.37, 0.34, 'stackerDark');
  m.box(x, y + 0.27, drumZ, 0.27, 0.26, 0.25, 'stackerBlue');
  m.cylinder(x, y + 0.52, drumZ, 0.111, 0.31, 'stackerBlue');
  m.cylinder(x, y + 0.69, drumZ, 0.101, 0.057, 'stackerDark');
  for (const side of [-1, 1]) {
    const drumX = x + side * 0.337;
    m.cylinder(drumX, y, drumZ, 0.193, 0.308, 'drumSteel', 'x');
    for (const offset of [-0.151, 0.151]) m.cylinder(drumX + offset, y, drumZ, 0.208, 0.028, 'drumRim', 'x');
    for (let offset = -0.116; offset <= 0.12; offset += 0.025) {
      m.cylinder(drumX + offset, y, drumZ, 0.196, 0.008, 'drumRim', 'x');
    }
    m.cylinder(drumX + side * 0.177, y, drumZ, 0.076, 0.045, 'stackerDark', 'x');
    m.beam([drumX, y + 0.14, drumZ - 0.14], [x + side * 0.235, 10.5, z + 0.05], 0.012, 0.012, 'drumSteel');
  }
}

function addLoadCarriage(m, x, z) {
  const y = 3.48;
  const carriageZ = z - 0.57;
  m.box(x, y + 0.42, carriageZ, 0.65, 1.04, 0.27, 'stackerBlue');
  m.box(x, y - 0.067, carriageZ - 0.15, 1.12, 0.128, 0.66, 'stackerBlue');
  m.box(x, y - 0.148, carriageZ - 0.22, 0.91, 0.07, 0.58, 'stackerDark');
  for (const side of [-1, 1]) {
    m.box(x + side * 0.265, y + 0.42, carriageZ + 0.143, 0.11, 1.02, 0.09, 'blueLight');
    for (const height of [y + 0.12, y + 0.8]) {
      m.cylinder(x + side * 0.214, height, carriageZ + 0.211, 0.061, 0.059, 'steel', 'x');
      m.box(x + side * 0.176, height, z - 0.27, 0.079, 0.11, 0.34, 'stackerDark');
    }
    const forkZ = carriageZ - 0.15 + side * 0.21;
    m.box(x, y + 0.026, forkZ, 0.99, 0.066, 0.108, 'steel');
    m.box(x, y + 0.073, forkZ, 0.91, 0.037, 0.082, 'silver');
  }
  m.box(x + 0.398, y + 0.42, carriageZ, 0.16, 0.36, 0.22, 'stackerDark');
  m.cylinder(x + 0.402, y + 0.64, carriageZ, 0.048, 0.093, 'amber');
}

export function addAisleStacker(m, { x, z, guideY }) {
  addTravelBase(m, x, z);
  const mastBase = 0.49;
  const mastTop = guideY - 0.21;
  const mastHeight = mastTop - mastBase;
  const mastCenter = (mastTop + mastBase) / 2;
  m.box(x, mastCenter, z, 0.307, mastHeight, 0.383, 'stackerBlue');
  for (const side of [-1, 1]) {
    m.box(x + side * 0.144, mastCenter, z - 0.193, 0.041, mastHeight, 0.048, 'silver');
    m.box(x + side * 0.168, mastCenter, z + 0.072, 0.042, mastHeight, 0.097, 'stackerDark');
  }
  m.box(x, mastTop - 0.144, z + 0.199, 0.293, 0.217, 0.025, 'red');
  m.box(x, mastTop - 0.283, z + 0.199, 0.293, 0.057, 0.025, 'rackWhite');
  m.box(x, 0.66, z + 0.198, 0.142, 0.068, 0.015, 'rackWhite');

  const chainX = x - 0.284;
  const chainZ = z - 0.1;
  m.box(chainX, mastCenter, chainZ, 0.099, mastHeight - 0.3, 0.083, 'black');
  for (let y = 0.71; y < mastTop - 0.16; y += 0.118) {
    m.box(chainX, y, chainZ + 0.04, 0.104, 0.037, 0.032, 'stackerDark');
    m.box(chainX - 0.046, y, chainZ + 0.048, 0.012, 0.022, 0.011, 'steel', false);
  }
  m.box(x, guideY - 0.153, z, 0.54, 0.11, 0.54, 'stackerDark');
  for (const side of [-1, 1]) {
    m.cylinder(x + side * 0.1, guideY - 0.056, z + side * 0.105, 0.065, 0.067, 'steel');
    m.cylinder(x + side * 0.1, guideY - 0.014, z + side * 0.105, 0.026, 0.023, 'silver', 'y', 'bolt');
  }
  addLoadCarriage(m, x, z);
  addHoist(m, x, z);
}
