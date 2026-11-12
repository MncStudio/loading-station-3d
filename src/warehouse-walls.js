const plinthHeight = 1.66;
const wallThickness = 0.34;

function windowOpenings(centers, width, bottom, top, columns = 2) {
  return centers.map((center) => ({ from: center - width / 2, to: center + width / 2, bottom, top, columns }));
}

function addCladWall(m, { alongZ, at, from, to, outside, height, windows, doors = [] }) {
  const place = (along, y, depth, width, tall, thickness, material, shadow = true) => {
    const normal = at + outside * depth;
    if (alongZ) m.box(normal, y, along, thickness, tall, width, material, shadow);
    else m.box(along, y, normal, width, tall, thickness, material, shadow);
  };
  const openings = [...windows, ...doors.map((door) => ({ ...door, bottom: 0 }))];
  const edges = [...new Set([from, to, ...openings.flatMap((opening) => [opening.from, opening.to])])].sort((a, b) => a - b);

  function panel(start, end, bottom, top) {
    const width = end - start;
    const center = (start + end) / 2;
    const baseTop = Math.min(plinthHeight, top);
    if (baseTop > bottom) {
      place(center, (bottom + baseTop) / 2, 0, width, baseTop - bottom, wallThickness, 'wallBase');
      if (top > plinthHeight) place(center, plinthHeight, 0.035, width, 0.075, 0.37, 'wallTrim');
    }
    const sheetBottom = Math.max(plinthHeight, bottom);
    if (top <= sheetBottom) return;
    const centerY = (sheetBottom + top) / 2;
    place(center, centerY, 0, width, top - sheetBottom, 0.31, 'cladding');
    const ribPitch = 0.22;
    const firstRib = from + Math.ceil((start - from + 0.046) / ribPitch) * ribPitch;
    for (let rib = firstRib; rib < end - 0.035; rib += ribPitch) {
      place(rib, centerY, 0.169, 0.037, top - sheetBottom, 0.035, 'claddingRib', false);
    }
  }

  for (let index = 0; index < edges.length - 1; index++) {
    const start = edges[index];
    const end = edges[index + 1];
    const center = (start + end) / 2;
    const holes = openings.filter((opening) => center > opening.from && center < opening.to);
    holes.sort((a, b) => a.bottom - b.bottom);
    let bottom = 0;
    for (const hole of holes) {
      if (hole.bottom > bottom) panel(start, end, bottom, hole.bottom);
      bottom = hole.top;
    }
    panel(start, end, bottom, height);
  }

  for (const { from: start, to: end, bottom, top, columns } of windows) {
    const width = end - start;
    const center = (start + end) / 2;
    const tall = top - bottom;
    const y = (top + bottom) / 2;
    const transom = bottom + tall * 0.42;
    place(center, (bottom + transom) / 2, 0.085, width, transom - bottom, 0.035, 'wallGlazing');
    place(center, (transom + top) / 2, 0.085, width, top - transom, 0.035, 'wallGlazingLight');
    for (const edge of [bottom, transom, top]) place(center, edge, 0.139, width + 0.06, 0.079, 0.11, 'wallTrim');
    for (let column = 0; column <= columns; column++) {
      place(start + width * column / columns, y, 0.14, 0.073, tall, 0.1, 'wallTrim');
    }
    place(center, bottom - 0.035, 0.16, width + 0.15, 0.045, 0.19, 'zinc');
  }

  for (const { from: start, to: end, top } of doors) {
    const width = end - start;
    const center = (start + end) / 2;
    for (const jamb of [start, end]) {
      place(jamb, top / 2, 0.067, 0.14, top, 0.36, 'wallTrim');
    }
    place(center, top, 0.087, width + 0.19, 0.21, 0.35, 'wallTrim');
    place(center, top + 0.34, 0.65, width + 0.55, 0.12, 1.25, 'cladding');
    place(center, top + 0.306, 1.25, width + 0.57, 0.17, 0.055, 'wallTrim');
    for (const support of [start - 0.14, end + 0.14]) {
      place(support, top + 0.23, 0.61, 0.095, 0.14, 1.17, 'wallTrim');
    }
    place(center, 0.023, 0.22, width - 0.15, 0.042, 0.52, 'wallBase');
    if (width < 3) {
      const leafWidth = width / 2 - 0.1;
      place(center, top + 0.11, 0.252, width + 2 * leafWidth + 0.21, 0.075, 0.095, 'wallTrim');
      for (const leaf of [start - leafWidth / 2 - 0.07, end + leafWidth / 2 + 0.07]) {
        place(leaf, (top + 0.06) / 2, 0.223, leafWidth, top - 0.06, 0.092, 'claddingRib');
        place(leaf, top * 0.53, 0.276, leafWidth - 0.09, 0.047, 0.035, 'zinc');
      }
    }
  }

  place((from + to) / 2, height, 0.04, to - from + 0.23, 0.17, 0.4, 'wallTrim');
  for (const end of [from, to]) place(end, height / 2, 0.08, 0.17, height, 0.31, 'wallTrim');
  for (let joint = from + 4.4; joint < to - 0.3; joint += 5.1) {
    if (openings.some((opening) => joint > opening.from - 0.28 && joint < opening.to + 0.28)) continue;
    place(joint, (plinthHeight + height) / 2, 0.19, 0.054, height - plinthHeight, 0.048, 'wallTrim', false);
    place(joint + 0.11, (plinthHeight + height) / 2, 0.235, 0.091, height - plinthHeight, 0.091, 'wallTrim');
    place(joint + 0.11, plinthHeight - 0.025, 0.273, 0.091, 0.095, 0.176, 'wallTrim');
  }
}

export function addWarehouseWalls(m, { frontX, rearX, endZ, height, doors }) {
  const frontWindows = [
    ...windowOpenings([-20.1, -16, -11.85, -7.8, -3.65, 3.65, 7.8, 11.85, 16, 20.1], 2.16, 1.83, 4.55),
    ...windowOpenings([-25.05, -18.8, -12.55, -6.3, 0, 6.3, 12.55, 18.8, 25.05], 4.75, 11.15, 12.36, 4),
  ];
  addCladWall(m, { alongZ: true, at: frontX, from: -endZ, to: endZ, outside: -1, height, windows: frontWindows, doors });
  const endWindows = [
    ...windowOpenings([-8, -1.65, 4.7, 11.05, 17.4, 23.25], 2.4, 1.83, 4.42),
    ...windowOpenings([-7.45, -1.15, 5.15, 11.45, 17.75, 23.45], 3.7, 11.15, 12.36, 3),
  ];
  for (const side of [-1, 1]) {
    addCladWall(m, { alongZ: false, at: side * endZ, from: frontX, to: rearX, outside: side, height, windows: endWindows });
  }
  const rearWindows = windowOpenings([-24.4, -18.3, -12.2, -6.1, 0, 6.1, 12.2, 18.3, 24.4], 4.4, 11.15, 12.36, 4);
  addCladWall(m, { alongZ: true, at: rearX, from: -endZ, to: endZ, outside: 1, height, windows: rearWindows });
}
