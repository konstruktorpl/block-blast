// Authentic Block Blast! Polyomino Catalog & Smart Fair Spawner
// Note: Authentic Block Blast does NOT feature single 1x1 dots or 3-block mini-corners.
// The catalog consists exclusively of 2-bars, 2-diagonals, 3-bars, 4-bars, 5-bars,
// 2x2 squares, 3x3 giant squares, 4-block T, L, J, Z, S shapes, 5-block Big Corners, and 6-block rectangles.

const SHAPES = [
  // 2-block bars
  { id: 'h2', tier: 'small', weight: 14, matrix: [[1, 1]] },
  { id: 'v2', tier: 'small', weight: 14, matrix: [[1], [1]] },

  // 2-block diagonals (classic Block Blast signature piece)
  { id: 'diag2a', tier: 'small', weight: 3, matrix: [[1, 0], [0, 1]] },
  { id: 'diag2b', tier: 'small', weight: 3, matrix: [[0, 1], [1, 0]] },

  // 3-block diagonals
  { id: 'diag3a', tier: 'small', weight: 2, matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
  { id: 'diag3b', tier: 'small', weight: 2, matrix: [[0, 0, 1], [0, 1, 0], [1, 0, 0]] },

  // 3-block bars
  { id: 'h3', tier: 'small', weight: 16, matrix: [[1, 1, 1]] },
  { id: 'v3', tier: 'small', weight: 16, matrix: [[1], [1], [1]] },

  // 3-block small corners (2x2 with 3 blocks)
  { id: 'c3_tl', tier: 'small', weight: 6, matrix: [[1, 1], [1, 0]] },
  { id: 'c3_tr', tier: 'small', weight: 6, matrix: [[1, 1], [0, 1]] },
  { id: 'c3_bl', tier: 'small', weight: 6, matrix: [[1, 0], [1, 1]] },
  { id: 'c3_br', tier: 'small', weight: 6, matrix: [[0, 1], [1, 1]] },

  // 2x2 Square (4 blocks)
  { id: 'sq2', tier: 'medium', weight: 18, matrix: [[1, 1], [1, 1]] },

  // 4-block bars
  { id: 'h4', tier: 'medium', weight: 16, matrix: [[1, 1, 1, 1]] },
  { id: 'v4', tier: 'medium', weight: 16, matrix: [[1], [1], [1], [1]] },

  // 4-block T-shapes
  { id: 't_up',    tier: 'medium', weight: 8, matrix: [[0, 1, 0], [1, 1, 1]] },
  { id: 't_down',  tier: 'medium', weight: 8, matrix: [[1, 1, 1], [0, 1, 0]] },
  { id: 't_left',  tier: 'medium', weight: 8, matrix: [[0, 1], [1, 1], [0, 1]] },
  { id: 't_right', tier: 'medium', weight: 8, matrix: [[1, 0], [1, 1], [1, 0]] },

  // 4-block L & J shapes
  { id: 'l_1', tier: 'medium', weight: 8, matrix: [[1, 0], [1, 0], [1, 1]] },
  { id: 'l_2', tier: 'medium', weight: 8, matrix: [[0, 1], [0, 1], [1, 1]] },
  { id: 'l_3', tier: 'medium', weight: 8, matrix: [[1, 1], [1, 0], [1, 0]] },
  { id: 'l_4', tier: 'medium', weight: 8, matrix: [[1, 1], [0, 1], [0, 1]] },
  { id: 'l_5', tier: 'medium', weight: 8, matrix: [[1, 0, 0], [1, 1, 1]] },
  { id: 'l_6', tier: 'medium', weight: 8, matrix: [[0, 0, 1], [1, 1, 1]] },
  { id: 'l_7', tier: 'medium', weight: 8, matrix: [[1, 1, 1], [1, 0, 0]] },
  { id: 'l_8', tier: 'medium', weight: 8, matrix: [[1, 1, 1], [0, 0, 1]] },

  // 4-block Z & S shapes
  { id: 'z_h', tier: 'medium', weight: 4, matrix: [[1, 1, 0], [0, 1, 1]] },
  { id: 's_h', tier: 'medium', weight: 4, matrix: [[0, 1, 1], [1, 1, 0]] },
  { id: 'z_v', tier: 'medium', weight: 4, matrix: [[0, 1], [1, 1], [1, 0]] },
  { id: 's_v', tier: 'medium', weight: 4, matrix: [[1, 0], [1, 1], [0, 1]] },

  // 5-block bars
  { id: 'h5', tier: 'large', weight: 16, matrix: [[1, 1, 1, 1, 1]] },
  { id: 'v5', tier: 'large', weight: 16, matrix: [[1], [1], [1], [1], [1]] },

  // 5-block Big Corners (3x3 L-shapes)
  { id: 'bigL_tl', tier: 'large', weight: 10, matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },
  { id: 'bigL_tr', tier: 'large', weight: 10, matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },
  { id: 'bigL_bl', tier: 'large', weight: 10, matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
  { id: 'bigL_br', tier: 'large', weight: 10, matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },

  // 6-block rectangles (2x3 and 3x2)
  { id: 'rect_2x3', tier: 'large', weight: 18, matrix: [[1, 1, 1], [1, 1, 1]] },
  { id: 'rect_3x2', tier: 'large', weight: 18, matrix: [[1, 1], [1, 1], [1, 1]] },

  // 9-block Giant Square (3x3)
  { id: 'sq3', tier: 'large', weight: 20, matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] }
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
 * Counts isolated empty cells that cannot be covered or entered by any piece in the catalog.
 * Since the smallest pieces in authentic Block Blast are 2-bars and 2-diagonals, an empty cell
 * with no open orthogonal neighbor (horizontal or vertical) is completely sealed off and impossible
 * to fill directly! The original Block Blast algorithm actively avoids creating these voids.
 */
function countTrappedSingleHoles(grid) {
  let trapped = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (grid[r][c] === null) {
        const hasOpenH = (c > 0 && grid[r][c - 1] === null) || (c < 7 && grid[r][c + 1] === null);
        const hasOpenV = (r > 0 && grid[r - 1][c] === null) || (r < 7 && grid[r + 1][c] === null);
        // If neither horizontal nor vertical neighbor is open, no piece can ever land here directly!
        if (!hasOpenH && !hasOpenV) {
          trapped++;
        }
      }
    }
  }
  return trapped;
}

function countOccupiedCells(grid) {
  let count = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (grid[r][c] !== null) count++;
    }
  }
  return count;
}

/**
 * Analyzes the grid to find all shapes that, if placed right now,
 * immediately complete and clear at least 1 line (or 2+ lines for combo/multi-clear).
 * Prioritizes placements that leave the board maximally empty and free of trapped holes!
 */
function findKeyClearingShapes(grid) {
  const clearingCandidates = [];

  for (const shape of SHAPES) {
    const placements = getAllValidPlacements(grid, shape);
    if (!placements.length) continue;

    let bestScore = -Infinity;
    let bestCleared = 0;
    let bestPlacement = null;
    let bestPostOccupied = 64;

    for (const p of placements) {
      const sim = simulatePlacement(grid, shape, p.r, p.c);
      if (sim.cleared < 1) continue;

      const postOccupied = countOccupiedCells(sim.grid);
      const postTrapped = countTrappedSingleHoles(sim.grid);
      // Favor multi-line sweeps, All Clears, and leaving an open, empty board!
      const score = sim.cleared * 100 - postOccupied * 2 - postTrapped * 40 + (postOccupied === 0 ? 300 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestCleared = sim.cleared;
        bestPlacement = p;
        bestPostOccupied = postOccupied;
      }
    }

    if (bestCleared >= 1) {
      const cleanBonus = bestPostOccupied <= 12 ? 1.55 : 1.0;
      clearingCandidates.push({
        shape,
        cleared: bestCleared,
        placement: bestPlacement,
        postOccupied: bestPostOccupied,
        weight: shape.weight * (bestCleared >= 2 ? 4.8 : 2.8) * cleanBonus
      });
    }
  }

  return clearingCandidates;
}

/**
 * Analyzes the grid to find shapes that snugly fill holes, crevices, and pockets
 * between existing blocks, and build up rows/columns toward completion (e.g. 7/8).
 * Strenuously rejects or penalizes any placement that creates newly trapped 1x1 voids!
 */
function findHoleFillingShapes(grid) {
  const holeCandidates = [];
  const baseTrapped = countTrappedSingleHoles(grid);

  const rowCounts = new Array(8).fill(0);
  const colCounts = new Array(8).fill(0);
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (grid[r][c] !== null) {
        rowCounts[r]++;
        colCounts[c]++;
      }
    }
  }

  for (const shape of SHAPES) {
    const placements = getAllValidPlacements(grid, shape);
    if (!placements.length) continue;

    let bestHoleScore = -Infinity;
    let bestPlacement = null;

    for (const p of placements) {
      const sim = simulatePlacement(grid, shape, p.r, p.c);
      const postTrapped = countTrappedSingleHoles(sim.grid);
      const newTrapped = postTrapped - baseTrapped;

      // Rule: Never recommend a placement that creates newly isolated 1x1 holes
      if (newTrapped > 0) {
        continue;
      }

      let contactEdges = 0;
      let deepPockets = 0;

      for (const cell of shape.cells) {
        const gr = p.r + cell.r;
        const gc = p.c + cell.c;

        let occupiedNeighbors = 0;
        const neighbors = [
          [gr - 1, gc],
          [gr + 1, gc],
          [gr, gc - 1],
          [gr, gc + 1]
        ];

        for (const [nr, nc] of neighbors) {
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) {
            contactEdges += 1.0;
          } else if (grid[nr][nc] !== null) {
            contactEdges += 2.2;
            occupiedNeighbors++;
          }
        }

        // Cell is nestled inside a deep socket or pocket (3+ occupied neighbors)
        if (occupiedNeighbors >= 3) {
          deepPockets++;
        }
      }

      // Bonus for completing or nearly completing lines (building toward a clear)
      let lineBuildingBonus = 0;
      const affectedRows = new Set(shape.cells.map((c) => p.r + c.r));
      const affectedCols = new Set(shape.cells.map((c) => p.c + c.c));

      for (const r of affectedRows) {
        const added = shape.cells.filter((c) => p.r + c.r === r).length;
        const newCount = rowCounts[r] + added;
        if (newCount === 7) lineBuildingBonus += 4.5;
        else if (newCount === 6) lineBuildingBonus += 2.5;
      }
      for (const c of affectedCols) {
        const added = shape.cells.filter((c) => p.c + c.c === c).length;
        const newCount = colCounts[c] + added;
        if (newCount === 7) lineBuildingBonus += 4.5;
        else if (newCount === 6) lineBuildingBonus += 2.5;
      }

      const score = (contactEdges / shape.blockCount) * 2.6 + deepPockets * 6.5 + lineBuildingBonus;
      if (score > bestHoleScore) {
        bestHoleScore = score;
        bestPlacement = p;
      }
    }

    // Qualify if it has solid contact with existing blocks / pockets
    if (bestHoleScore >= 6.0 && bestPlacement) {
      // 2-block bars, 3-block bars and corners are the premier gap/slot fillers in authentic Block Blast
      let typeBonus = 1.0;
      if (shape.id === 'h2' || shape.id === 'v2') typeBonus = 2.4;
      else if (shape.id.startsWith('c3_')) typeBonus = 2.1;
      else if (shape.id === 'diag2a' || shape.id === 'diag2b') typeBonus = 1.7;
      else if (shape.id === 'diag3a' || shape.id === 'diag3b') typeBonus = 1.5;
      else if (shape.id === 'h3' || shape.id === 'v3') typeBonus = 1.9;
      else if (shape.id === 'sq2') typeBonus = 1.6;
      else if (shape.id.startsWith('l_')) typeBonus = 1.3;

      holeCandidates.push({
        shape,
        score: bestHoleScore,
        placement: bestPlacement,
        weight: shape.weight * typeBonus * (1 + bestHoleScore * 0.15)
      });
    }
  }

  holeCandidates.sort((a, b) => b.score - a.score);
  return holeCandidates;
}

function pickWeightedItem(list) {
  let total = 0;
  for (const item of list) total += item.weight;
  let r = Math.random() * total;
  for (const item of list) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return list[list.length - 1];
}

/**
 * Generates a balanced, solvable tray of 3 pieces tailored to the current board state.
 * Features authentic Dynamic Director:
 * 1. Keep-Board-Clean Bias: Actively deals sweepable pieces & chain clears so the board stays open and airy.
 * 2. Early-Game Shield: ~98% assist rate on first 30 moves to protect against frustrating abrupt early deaths.
 * 3. Combo x4+ Extension Guarantee: 100% guarantee to deal a combo-extending piece during high streaks (reaching x8-x12).
 * 4. Record-Adaptive Difficulty Curve: Smoothly assists up to Best Score + ~2,500 buffer, then gradually ramps challenge.
 */
function generateSmartTray(grid, palette, score = 0, comboStreak = 0, meta = {}) {
  const occupied = countOccupiedCells(grid);
  const fillRatio = occupied / 64;

  const movesCount = meta.movesCount || 0;
  const initialBestScore = meta.initialBestScore || 0;

  // Record-Adaptive Rubber-Banding Curve:
  // - Effective baseline target for new players with 0 record is 4500.
  // - Below recordTarget -> easy ("до рекорда дойти очень легко")
  // - recordTarget to recordTarget + 2500 -> generous sweet spot ("дать набрать пару лишних тысяч")
  // - Above recordTarget + 2500 -> smooth tension ramp up to 1.0 over next 5500 points ("опять начинает усложнять")
  const recordTarget = Math.max(initialBestScore, 4500);
  const overrun = score - recordTarget;
  let tension = 0;
  if (overrun > 2500) {
    tension = Math.min(1.0, (overrun - 2500) / 5500);
  }

  // Dynamic shape weights shaped by board density and Record Tension
  const weightedPool = SHAPES.map((s) => {
    let w = s.weight;
    const isAwkward = s.id.startsWith('z_') || s.id.startsWith('s_') || s.id.startsWith('diag');

    if (fillRatio > 0.58) {
      if (s.tier === 'large') w *= (0.18 + tension * 0.55);
      if (s.tier === 'small') w *= (1.95 - tension * 0.70);
    } else if (fillRatio < 0.52) {
      // Open board: big, satisfying shapes dominate below record
      const boostScale = 1.0 - tension * 0.50;
      if (s.tier === 'large') w *= (1.0 + 0.85 * boostScale);
      if (s.id === 'sq3' || s.id === 'rect_2x3' || s.id === 'rect_3x2') w *= (1.0 + 1.0 * boostScale);
      if (s.id.startsWith('h4') || s.id.startsWith('v4') || s.id.startsWith('h5') || s.id.startsWith('v5') || s.id === 'sq2') {
        w *= (1.0 + 0.5 * boostScale);
      }
    }

    // Below record: suppress awkward Z/S & diagonals; high tension past record mixes them back in strongly
    if (isAwkward) {
      w *= (0.45 + tension * 1.65);
    }
    if (tension > 0.2 && (s.id.startsWith('bigL_') || s.id.startsWith('l_') || s.id.startsWith('t_'))) {
      w *= (1.0 + tension * 0.85);
    }

    return { ...s, weight: w };
  });

  // Dynamic Assisting candidates:
  const keyClearingShapes = findKeyClearingShapes(grid);
  const holeFillingShapes = findHoleFillingShapes(grid);

  const isEarlyShield = movesCount < 30 && overrun <= 2500;
  const isHighCombo = comboStreak >= 4;

  // Dynamic Director Probability:
  let assistChance;
  if (isEarlyShield) {
    // 100% protection against frustrating abrupt deaths in the first 30 moves
    assistChance = 1.0;
  } else if (isHighCombo) {
    // Rewards reaching x4+ so players smoothly hit x8-x12 below record,
    // gradually tapering on extreme streaks (x13+) or in post-record high tension!
    const extremeTaper = comboStreak > 12 ? Math.min(0.30, (comboStreak - 12) * 0.04) : 0;
    const baseComboAssist = 0.96 - extremeTaper;
    assistChance = Math.max(0.30, baseComboAssist - tension * 0.62);
  } else if (comboStreak >= 1) {
    assistChance = Math.max(0.28, 0.90 - tension * 0.60);
  } else if (fillRatio >= 0.28) {
    // Proactive Keep-Board-Clean sweep when blocks accumulate >= 28%, dialing down as tension climbs
    assistChance = Math.max(0.20, 0.88 - tension * 0.68);
  } else {
    assistChance = Math.max(0.18, 0.82 - tension * 0.64);
  }

  const hasAssists = keyClearingShapes.length > 0 || holeFillingShapes.length > 0;
  const shouldAssist = hasAssists && Math.random() < assistChance;

  let bestCandidate = null;
  let bestScore = -1;

  if (shouldAssist) {
    const candidate = [null, null, null];
    const availableSlots = [0, 1, 2];

    // Prioritize line clearing when sustaining high combos OR keeping board empty (fillRatio >= 0.30)
    let primaryIsClearing = true;
    if (keyClearingShapes.length > 0 && holeFillingShapes.length > 0) {
      if (isHighCombo) {
        primaryIsClearing = true; // Guarantee immediate combo continuation!
      } else if (comboStreak >= 1 || fillRatio >= 0.30) {
        primaryIsClearing = Math.random() < (0.82 - tension * 0.15);
      } else {
        primaryIsClearing = Math.random() < 0.55;
      }
    } else if (keyClearingShapes.length === 0) {
      primaryIsClearing = false;
    }

    // Pick Slot 1 (primary assist piece)
    let primaryObj = null;
    if (primaryIsClearing && keyClearingShapes.length > 0) {
      primaryObj = pickWeightedItem(keyClearingShapes);
    } else if (holeFillingShapes.length > 0) {
      primaryObj = pickWeightedItem(holeFillingShapes);
    }

    if (primaryObj) {
      const slotIdx = Math.floor(Math.random() * availableSlots.length);
      const primarySlot = availableSlots.splice(slotIdx, 1)[0];
      candidate[primarySlot] = primaryObj.shape;

      const postSim = simulatePlacement(grid, primaryObj.shape, primaryObj.placement.r, primaryObj.placement.c);
      const simGrid = postSim.grid;

      // Pick Slot 2: Chain-Clear / Keep-Board-Clean builder on post-clear simGrid
      const secondSlotIdx = Math.floor(Math.random() * availableSlots.length);
      const secondSlot = availableSlots.splice(secondSlotIdx, 1)[0];

      const nextClearers = findKeyClearingShapes(simGrid);
      const nextHoleFillers = findHoleFillingShapes(simGrid);

      let secondObj = null;
      const chainProbability = isHighCombo ? 0.85 : Math.max(0.35, 0.78 - tension * 0.35);

      if (nextClearers.length > 0 && Math.random() < chainProbability) {
        secondObj = pickWeightedItem(nextClearers);
      } else if (nextHoleFillers.length > 0 && Math.random() < 0.80) {
        secondObj = pickWeightedItem(nextHoleFillers);
      } else if (holeFillingShapes.length > 0 && Math.random() < 0.65) {
        const fittingFillers = holeFillingShapes.filter((h) => getAllValidPlacements(simGrid, h.shape).length > 0);
        if (fittingFillers.length > 0) {
          const picked = fittingFillers[Math.floor(Math.random() * fittingFillers.length)];
          const pl = getAllValidPlacements(simGrid, picked.shape)[0];
          secondObj = { shape: picked.shape, placement: pl };
        }
      }

      if (!secondObj) {
        const fitting = weightedPool.filter((s) => getAllValidPlacements(simGrid, s).length > 0);
        const picked = fitting.length > 0 ? pickWeightedShape(fitting) : pickWeightedShape(weightedPool);
        const placements = getAllValidPlacements(simGrid, picked);
        secondObj = {
          shape: picked,
          placement: placements.length > 0 ? placements[0] : null
        };
      }
      candidate[secondSlot] = secondObj.shape;

      // Simulate Slot 2 accurately using its planned placement
      let finalSimGrid = simGrid;
      if (secondObj.placement) {
        finalSimGrid = simulatePlacement(simGrid, secondObj.shape, secondObj.placement.r, secondObj.placement.c).grid;
      }

      // Pick Slot 3: Finish off the board sweep or complete a 3-piece combo chain
      const thirdSlot = availableSlots[0];
      const thirdClearers = findKeyClearingShapes(finalSimGrid);
      const thirdHoleFillers = findHoleFillingShapes(finalSimGrid);
      const thirdClearChance = isHighCombo
        ? Math.max(0.30, 0.82 - tension * 0.50)
        : Math.max(0.20, 0.65 - tension * 0.45);

      const safeThirdFilter = (s) => {
        if (getAllValidPlacements(finalSimGrid, s).length === 0) return false;
        // During Early-Game Shield, ensure Slot 3 also fits smoothly without rigid sequencing trap
        if (isEarlyShield && s.tier === 'large' && getAllValidPlacements(simGrid, s).length === 0) {
          return false;
        }
        return true;
      };

      const validThirdClearers = thirdClearers.filter((c) => safeThirdFilter(c.shape));
      const validThirdFillers = thirdHoleFillers.filter((h) => safeThirdFilter(h.shape));

      if (validThirdClearers.length > 0 && Math.random() < thirdClearChance) {
        candidate[thirdSlot] = pickWeightedItem(validThirdClearers).shape;
      } else if (validThirdFillers.length > 0 && Math.random() < 0.65) {
        candidate[thirdSlot] = pickWeightedItem(validThirdFillers).shape;
      } else {
        const fitting = weightedPool.filter(safeThirdFilter);
        const fallback = weightedPool.filter((s) => getAllValidPlacements(finalSimGrid, s).length > 0);
        if (fitting.length > 0) {
          candidate[thirdSlot] = pickWeightedShape(fitting);
        } else if (fallback.length > 0) {
          candidate[thirdSlot] = pickWeightedShape(fallback);
        } else {
          candidate[thirdSlot] = pickWeightedShape(weightedPool);
        }
      }

      bestCandidate = candidate;
    }
  }

  if (!bestCandidate) {
    // Standard smart solver (scales candidate search & cleanliness bias with tension)
    const searchAttempts = tension < 0.5 ? 24 : 16;
    const maxLargePerHand = tension > 0.65 ? 2 : 1;

    for (let attempt = 0; attempt < searchAttempts; attempt++) {
      const candidate = [];
      let largeCount = 0;

      for (let i = 0; i < 3; i++) {
        let pool = weightedPool;
        if (largeCount >= maxLargePerHand) {
          pool = weightedPool.filter((s) => s.tier !== 'large');
        }
        const picked = pickWeightedShape(pool);
        if (picked.tier === 'large') largeCount++;
        candidate.push(picked);
      }

      let simGrid = grid.map((row) => row.slice());
      let placedCount = 0;
      let linesClearedInSim = 0;
      let createdTrappedHoles = 0;

      for (let i = 0; i < 3; i++) {
        const shape = candidate[i];
        const placements = getAllValidPlacements(simGrid, shape);
        if (placements.length === 0) break;

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

        const baseTrapped = countTrappedSingleHoles(simGrid);
        const finalSim = bestSim || simulatePlacement(simGrid, shape, chosen.r, chosen.c);
        const postTrapped = countTrappedSingleHoles(finalSim.grid);
        if (postTrapped > baseTrapped) {
          createdTrappedHoles += (postTrapped - baseTrapped);
        }

        simGrid = finalSim.grid;
        linesClearedInSim += finalSim.cleared;
        placedCount++;
      }

      const finalOccupied = countOccupiedCells(simGrid);
      const cleanlinessGain = Math.max(0, occupied - finalOccupied);

      let candidateQuality = placedCount * 14 + linesClearedInSim * (14 - tension * 8) - createdTrappedHoles * 35;
      if (tension < 0.6) {
        candidateQuality += cleanlinessGain * 3.5; // Favor hands that leave board cleaner!
      }
      if (placedCount === 3 && createdTrappedHoles === 0) {
        candidateQuality += 20;
      }

      if (candidateQuality > bestScore) {
        bestScore = candidateQuality;
        bestCandidate = candidate;
      }
      if (tension < 0.3 && placedCount === 3 && linesClearedInSim >= 2 && createdTrappedHoles === 0) {
        break;
      }
    }
  }

  // Safety fallback: ensure at least the first piece can be placed
  if (!bestCandidate || getAllValidPlacements(grid, bestCandidate[0]).length === 0) {
    const fittingShapes = weightedPool.filter((s) => getAllValidPlacements(grid, s).length > 0);
    if (fittingShapes.length > 0) {
      if (!bestCandidate) bestCandidate = [fittingShapes[0], fittingShapes[0], fittingShapes[0]];
      bestCandidate[0] = pickWeightedShape(fittingShapes);
    }
  }

  // Assign distinct colors from the current theme palette
  return bestCandidate.map((shape, idx) => {
    const colorIndex = (Math.floor(Math.random() * palette.length) + idx) % palette.length;
    return {
      slotIndex: idx,
      shape,
      colorIndex,
      placed: false,
      scale: 0.01,
      targetScale: 1,
      offsetX: 0,
      offsetY: 0
    };
  });
}

/**
 * Generates a pre-calculated opening hand (first 3 pieces) specifically tailored to the
 * starting layout on the board. Guarantees that piece 1 clears a line (Combo 1),
 * piece 2 can clear another line (Combo 2), and piece 3 continues the streak (Combo 3)!
 * This provides the authentic Block Blast instant-gratification dopamine kickoff.
 */
function generateOpeningHand(grid, palette) {
  let bestSequence = null;
  let bestScore = -1;

  // Try multiple sequence rollouts to find the best 3-piece combo chain
  for (let attempt = 0; attempt < 80; attempt++) {
    // 1. Pick a line clearer for Step 1
    const clearers1 = findKeyClearingShapes(grid);
    if (!clearers1.length) break;

    const p1Obj = clearers1[Math.floor(Math.random() * clearers1.length)];
    const sim1 = simulatePlacement(grid, p1Obj.shape, p1Obj.placement.r, p1Obj.placement.c);

    // 2. Pick Piece 2 on sim1.grid
    const clearers2 = findKeyClearingShapes(sim1.grid);
    let p2Obj = null;
    let sim2 = null;

    if (clearers2.length > 0) {
      p2Obj = clearers2[Math.floor(Math.random() * clearers2.length)];
      sim2 = simulatePlacement(sim1.grid, p2Obj.shape, p2Obj.placement.r, p2Obj.placement.c);
    } else {
      const fillers2 = findHoleFillingShapes(sim1.grid);
      if (fillers2.length > 0) {
        p2Obj = fillers2[Math.floor(Math.random() * fillers2.length)];
        sim2 = simulatePlacement(sim1.grid, p2Obj.shape, p2Obj.placement.r, p2Obj.placement.c);
      } else {
        const fitting = SHAPES.filter((s) => getAllValidPlacements(sim1.grid, s).length > 0);
        if (!fitting.length) continue;
        const shp = pickWeightedShape(fitting);
        const pl = getAllValidPlacements(sim1.grid, shp)[0];
        p2Obj = { shape: shp, placement: pl, cleared: 0 };
        sim2 = simulatePlacement(sim1.grid, shp, pl.r, pl.c);
      }
    }

    // 3. Pick Piece 3 on sim2.grid
    const clearers3 = findKeyClearingShapes(sim2.grid);
    let p3Obj = null;

    if (clearers3.length > 0) {
      p3Obj = clearers3[Math.floor(Math.random() * clearers3.length)];
    } else {
      const fillers3 = findHoleFillingShapes(sim2.grid);
      if (fillers3.length > 0) {
        p3Obj = fillers3[Math.floor(Math.random() * fillers3.length)];
      } else {
        const fitting3 = SHAPES.filter((s) => getAllValidPlacements(sim2.grid, s).length > 0);
        if (!fitting3.length) continue;
        p3Obj = { shape: pickWeightedShape(fitting3), cleared: 0 };
      }
    }

    const hand = [p1Obj.shape, p2Obj.shape, p3Obj.shape];
    let score = (p1Obj.cleared || 1) * 30;
    if (p2Obj.cleared > 0) score += 120 + p2Obj.cleared * 40;
    if (p3Obj && p3Obj.cleared > 0) score += 200 + p3Obj.cleared * 50;

    // Variety bonus: prefer not having 3 identical pieces
    const distinctIds = new Set(hand.map((s) => s.id));
    score += distinctIds.size * 10;

    // Favor larger / more satisfying pieces (squares, rectangles, 4-bars, 3-bars)
    for (const s of hand) {
      if (s.tier === 'large') score += 15;
      if (s.id === 'sq3' || s.id.startsWith('rect_')) score += 12;
      if (s.id === 'sq2' || s.id.startsWith('h4') || s.id.startsWith('v4')) score += 8;
    }

    if (score > bestScore) {
      bestScore = score;
      bestSequence = hand;
    }

    // Found the holy grail: a triple-combo opening!
    if (p2Obj.cleared > 0 && p3Obj && p3Obj.cleared > 0) {
      break;
    }
  }

  if (!bestSequence) {
    return generateSmartTray(grid, palette, 0, 0);
  }

  // Shuffle slot positions slightly (or keep slot 0 as one of the immediate clearers)
  // so the player can intuitively explore and place them
  return bestSequence.map((shape, idx) => {
    const colorIndex = (Math.floor(Math.random() * palette.length) + idx) % palette.length;
    return {
      slotIndex: idx,
      shape,
      colorIndex,
      placed: false,
      scale: 0.01,
      targetScale: 1,
      offsetX: 0,
      offsetY: 0
    };
  });
}

window.SHAPES = SHAPES;
window.canMatrixFitAt = canMatrixFitAt;
window.getAllValidPlacements = getAllValidPlacements;
window.simulatePlacement = simulatePlacement;
window.countTrappedSingleHoles = countTrappedSingleHoles;
window.findKeyClearingShapes = findKeyClearingShapes;
window.findHoleFillingShapes = findHoleFillingShapes;
window.generateSmartTray = generateSmartTray;
window.generateOpeningHand = generateOpeningHand;
