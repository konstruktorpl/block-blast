// Authentic Block Blast! Polyomino Catalog & Smart Fair Spawner

const SHAPES = [
  // 1-block
  { id: 'dot1', tier: 'small', weight: 5, matrix: [[1]] },

  // 2-block bars
  { id: 'h2', tier: 'small', weight: 8, matrix: [[1, 1]] },
  { id: 'v2', tier: 'small', weight: 8, matrix: [[1], [1]] },

  // 2-block diagonals (classic Block Blast signature piece)
  { id: 'diag2a', tier: 'small', weight: 4, matrix: [[1, 0], [0, 1]] },
  { id: 'diag2b', tier: 'small', weight: 4, matrix: [[0, 1], [1, 0]] },

  // 3-block bars
  { id: 'h3', tier: 'small', weight: 10, matrix: [[1, 1, 1]] },
  { id: 'v3', tier: 'small', weight: 10, matrix: [[1], [1], [1]] },

  // 3-block small corners (2x2 L-shapes)
  { id: 'c3_tl', tier: 'small', weight: 9, matrix: [[1, 1], [1, 0]] },
  { id: 'c3_tr', tier: 'small', weight: 9, matrix: [[1, 1], [0, 1]] },
  { id: 'c3_bl', tier: 'small', weight: 9, matrix: [[1, 0], [1, 1]] },
  { id: 'c3_br', tier: 'small', weight: 9, matrix: [[0, 1], [1, 1]] },

  // 2x2 Square (4 blocks)
  { id: 'sq2', tier: 'medium', weight: 12, matrix: [[1, 1], [1, 1]] },

  // 4-block bars
  { id: 'h4', tier: 'medium', weight: 9, matrix: [[1, 1, 1, 1]] },
  { id: 'v4', tier: 'medium', weight: 9, matrix: [[1], [1], [1], [1]] },

  // 4-block T-shapes
  { id: 't_up',    tier: 'medium', weight: 8, matrix: [[0, 1, 0], [1, 1, 1]] },
  { id: 't_down',  tier: 'medium', weight: 8, matrix: [[1, 1, 1], [0, 1, 0]] },
  { id: 't_left',  tier: 'medium', weight: 8, matrix: [[0, 1], [1, 1], [0, 1]] },
  { id: 't_right', tier: 'medium', weight: 8, matrix: [[1, 0], [1, 1], [1, 0]] },

  // 4-block L & J shapes
  { id: 'l_1', tier: 'medium', weight: 7, matrix: [[1, 0], [1, 0], [1, 1]] },
  { id: 'l_2', tier: 'medium', weight: 7, matrix: [[0, 1], [0, 1], [1, 1]] },
  { id: 'l_3', tier: 'medium', weight: 7, matrix: [[1, 1], [1, 0], [1, 0]] },
  { id: 'l_4', tier: 'medium', weight: 7, matrix: [[1, 1], [0, 1], [0, 1]] },
  { id: 'l_5', tier: 'medium', weight: 7, matrix: [[1, 0, 0], [1, 1, 1]] },
  { id: 'l_6', tier: 'medium', weight: 7, matrix: [[0, 0, 1], [1, 1, 1]] },
  { id: 'l_7', tier: 'medium', weight: 7, matrix: [[1, 1, 1], [1, 0, 0]] },
  { id: 'l_8', tier: 'medium', weight: 7, matrix: [[1, 1, 1], [0, 0, 1]] },

  // 4-block Z & S shapes
  { id: 'z_h', tier: 'medium', weight: 7, matrix: [[1, 1, 0], [0, 1, 1]] },
  { id: 's_h', tier: 'medium', weight: 7, matrix: [[0, 1, 1], [1, 1, 0]] },
  { id: 'z_v', tier: 'medium', weight: 7, matrix: [[0, 1], [1, 1], [1, 0]] },
  { id: 's_v', tier: 'medium', weight: 7, matrix: [[1, 0], [1, 1], [0, 1]] },

  // 5-block bars
  { id: 'h5', tier: 'large', weight: 6, matrix: [[1, 1, 1, 1, 1]] },
  { id: 'v5', tier: 'large', weight: 6, matrix: [[1], [1], [1], [1], [1]] },

  // 5-block Big Corners (3x3 L-shapes)
  { id: 'bigL_tl', tier: 'large', weight: 6, matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },
  { id: 'bigL_tr', tier: 'large', weight: 6, matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },
  { id: 'bigL_bl', tier: 'large', weight: 6, matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
  { id: 'bigL_br', tier: 'large', weight: 6, matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },

  // 6-block rectangles (2x3 and 3x2)
  { id: 'rect_2x3', tier: 'large', weight: 5, matrix: [[1, 1, 1], [1, 1, 1]] },
  { id: 'rect_3x2', tier: 'large', weight: 5, matrix: [[1, 1], [1, 1], [1, 1]] },

  // 9-block Giant Square (3x3)
  { id: 'sq3', tier: 'large', weight: 7, matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] }
];

// Precompute cell coordinates and block count for each shape
SHAPES.forEach((shape) => {
  const cells = [];
  const rows = shape.matrix.length;
  const cols = shape.matrix[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape.matrix[r][c]) {
        cells.push({ r, c });
      }
    }
  }
  shape.rows = rows;
  shape.cols = cols;
  shape.cells = cells;
  shape.blockCount = cells.length;
});

function canMatrixFitAt(grid, shape, startR, startC) {
  if (startR < 0 || startC < 0 || startR + shape.rows > 8 || startC + shape.cols > 8) {
    return false;
  }
  for (let i = 0; i < shape.cells.length; i++) {
    const cell = shape.cells[i];
    if (grid[startR + cell.r][startC + cell.c] !== null) {
      return false;
    }
  }
  return true;
}

function getAllValidPlacements(grid, shape) {
  const valid = [];
  for (let r = 0; r <= 8 - shape.rows; r++) {
    for (let c = 0; c <= 8 - shape.cols; c++) {
      if (canMatrixFitAt(grid, shape, r, c)) {
        valid.push({ r, c });
      }
    }
  }
  return valid;
}

function simulatePlacement(grid, shape, startR, startC) {
  const next = grid.map((row) => row.slice());
  for (const cell of shape.cells) {
    next[startR + cell.r][startC + cell.c] = 1;
  }
  const fullRows = [];
  const fullCols = [];
  for (let r = 0; r < 8; r++) {
    if (next[r].every((v) => v !== null)) fullRows.push(r);
  }
  for (let c = 0; c < 8; c++) {
    let full = true;
    for (let r = 0; r < 8; r++) {
      if (next[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) fullCols.push(c);
  }
  for (const r of fullRows) {
    for (let c = 0; c < 8; c++) next[r][c] = null;
  }
  for (const c of fullCols) {
    for (let r = 0; r < 8; r++) next[r][c] = null;
  }
  return {
    grid: next,
    cleared: fullRows.length + fullCols.length
  };
}

function pickWeightedShape(pool) {
  let total = 0;
  for (const s of pool) total += s.weight;
  let r = Math.random() * total;
  for (const s of pool) {
    r -= s.weight;
    if (r <= 0) return s;
  }
  return pool[pool.length - 1];
}

/**
 * Generates a balanced, solvable tray of 3 pieces tailored to the current board state.
 */
function generateSmartTray(grid, palette, score = 0) {
  let occupied = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (grid[r][c] !== null) occupied++;
    }
  }
  const fillRatio = occupied / 64;

  // Adjust pool weights dynamically based on board crowding & score
  const weightedPool = SHAPES.map((s) => {
    let w = s.weight;
    if (fillRatio > 0.62) {
      if (s.tier === 'large') w *= 0.35;
      if (s.tier === 'small') w *= 1.65;
    } else if (fillRatio < 0.25 && score > 300) {
      if (s.tier === 'large') w *= 1.25;
    }
    return { ...s, weight: w };
  });

  // Try up to 18 candidate sets of 3 pieces and pick one that has a valid sequential play path
  let bestCandidate = null;
  let bestScore = -1;

  for (let attempt = 0; attempt < 18; attempt++) {
    const candidate = [];
    let largeCount = 0;

    for (let i = 0; i < 3; i++) {
      let pool = weightedPool;
      // Avoid spawning more than 1 giant piece in the same hand of 3
      if (largeCount >= 1) {
        pool = weightedPool.filter((s) => s.tier !== 'large');
      }
      const picked = pickWeightedShape(pool);
      if (picked.tier === 'large') largeCount++;
      candidate.push(picked);
    }

    // Evaluate playability of this 3-piece hand on a simulated board
    let simGrid = grid.map((row) => row.slice());
    let placedCount = 0;
    let linesClearedInSim = 0;

    for (let i = 0; i < 3; i++) {
      const shape = candidate[i];
      const placements = getAllValidPlacements(simGrid, shape);
      if (placements.length === 0) break;

      // Pick a placement that maximizes line clears or keeps board compact
      let chosen = placements[Math.floor(Math.random() * placements.length)];
      let bestSim = null;

      const sampleCount = Math.min(placements.length, 10);
      for (let k = 0; k < sampleCount; k++) {
        const p = placements[Math.floor((k / sampleCount) * placements.length)];
        const res = simulatePlacement(simGrid, shape, p.r, p.c);
        if (!bestSim || res.cleared > bestSim.cleared) {
          bestSim = res;
          chosen = p;
        }
      }

      const finalSim = bestSim || simulatePlacement(simGrid, shape, chosen.r, chosen.c);
      simGrid = finalSim.grid;
      linesClearedInSim += finalSim.cleared;
      placedCount++;
    }

    const candidateQuality = placedCount * 10 + Math.min(linesClearedInSim, 2) * 3;
    if (candidateQuality > bestScore) {
      bestScore = candidateQuality;
      bestCandidate = candidate;
    }
    if (placedCount === 3 && linesClearedInSim >= 1) {
      break;
    }
  }

  // Fallback if board is super crowded: ensure at least the first piece fits if any shape fits at all
  if (bestScore < 10) {
    const fittingShapes = weightedPool.filter((s) => getAllValidPlacements(grid, s).length > 0);
    if (fittingShapes.length > 0) {
      bestCandidate[0] = pickWeightedShape(fittingShapes);
    }
  }

  // Assign random vibrant colors from the current theme palette
  return bestCandidate.map((shape, idx) => {
    const colorIndex = Math.floor(Math.random() * palette.length);
    return {
      slotIndex: idx,
      shape,
      colorIndex,
      placed: false,
      scale: 0.01,       // animates from 0.01 -> 1 on spawn
      targetScale: 1,
      offsetX: 0,
      offsetY: 0
    };
  });
}

window.SHAPES = SHAPES;
window.canMatrixFitAt = canMatrixFitAt;
window.getAllValidPlacements = getAllValidPlacements;
window.generateSmartTray = generateSmartTray;
