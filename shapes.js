// Authentic Block Blast! Polyomino Catalog & Smart Fair Spawner
// Includes standard polyominoes (2-bars..5-bars, squares, rectangles, T/L/Z/S, small & big corners, diagonals)
// PLUS the special 1x1 Rescue Dot (`dot1`) which NEVER spawns in regular rolls and appears strictly as a rare clutch assist!

const SHAPES = [
  // Ultra-rare clutch rescue single 1x1 block (weight: 0 -> excluded from normal pools!)
  { id: 'dot1', tier: 'special', weight: 0, isRescueOnly: true, matrix: [[1]] },

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
    if (shape.isRescueOnly) continue;
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
    if (shape.isRescueOnly) continue;
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

/**
 * Finds rare emergency clutch opportunities for the special 1x1 Single Rescue Dot (`dot1`):
 * 1) Seals an isolated unfillable 1x1 hole on the board (especially if it also clears a 7/8 line!).
 * 2) Completes a 7/8 line when the board is getting crowded and no standard clearer exists.
 * 3) Last-resort survival save when zero >=2-cell pieces can fit anywhere on the board.
 */
function findClutchSingleDotRescue(grid) {
  const dotShape = SHAPES.find((s) => s.id === 'dot1');
  if (!dotShape) return null;

  let bestScore = -1;
  let bestPlacement = null;
  let bestCleared = 0;
  let bestFixesTrappedHole = false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (grid[r][c] !== null) continue;

      const hasOpenH = (c > 0 && grid[r][c - 1] === null) || (c < 7 && grid[r][c + 1] === null);
      const hasOpenV = (r > 0 && grid[r - 1][c] === null) || (r < 7 && grid[r + 1][c] === null);
      const isTrappedHole = !hasOpenH && !hasOpenV;

      const sim = simulatePlacement(grid, dotShape, r, c);
      let score = 0;
      if (isTrappedHole) score += 60;
      if (sim.cleared >= 2) score += 80;
      else if (sim.cleared === 1) score += 45;

      // Only qualify as a meaningful rescue if it fixes a trapped hole or completes a line
      if (score > bestScore) {
        bestScore = score;
        bestPlacement = { r, c };
        bestCleared = sim.cleared;
        bestFixesTrappedHole = isTrappedHole;
      }
    }
  }

  if (!bestPlacement) return null;
  return {
    shape: dotShape,
    placement: bestPlacement,
    cleared: bestCleared,
    fixesTrappedHole: bestFixesTrappedHole,
    score: bestScore
  };
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

// ============================================================================
// LOOKAHEAD ENGINE & DDA DIRECTOR (6-Permutation Search + Board Fitness)
// ============================================================================
const TRAY_PERMUTATIONS = [
  [0, 1, 2], [0, 2, 1],
  [1, 0, 2], [1, 2, 0],
  [2, 0, 1], [2, 1, 0]
];

/**
 * Counts how many clean 3x3 open zones remain on the board (measures spatial cohesion/connectedness).
 */
function countOpen3x3Regions(grid) {
  let openCount = 0;
  for (let r = 0; r <= 5; r++) {
    for (let c = 0; c <= 5; c++) {
      let ok = true;
      for (let dr = 0; dr < 3 && ok; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          if (grid[r + dr][c + dc] !== null) {
            ok = false;
            break;
          }
        }
      }
      if (ok) openCount++;
    }
  }
  return openCount;
}

/**
 * Scores a board state across:
 * 1) Empty cells (keep board open)
 * 2) Spatial cohesion (open 3x3 pockets vs isolated 1x1 voids)
 * 3) Line clears achieved during tray placement
 * 4) Combo buffer (rewarding at least 1 clear when sustaining a combo)
 */
function computeBoardFitness(grid, totalLinesCleared, comboStreak = 0) {
  const emptyCells = 64 - countOccupiedCells(grid);
  const open3x3 = countOpen3x3Regions(grid);
  const trapped = countTrappedSingleHoles(grid);
  const comboBuffer = totalLinesCleared >= 1 ? (comboStreak >= 1 ? 75 : 35) : 0;
  const allClearBonus = emptyCells === 64 ? 250 : 0;

  const raw = emptyCells * 4 + open3x3 * 14 - trapped * 65 + totalLinesCleared * 55 + comboBuffer + allClearBonus;
  // Clamp solvable fitness >= 1 so any solvable 3-piece path stays strictly positive vs -1 deadlock
  return Math.max(1, raw);
}

/**
 * Fast heuristic top-K placement picker for lookahead depth branching.
 */
function pickTopStepPlacements(grid, shape, maxSamples = 2) {
  const placements = getAllValidPlacements(grid, shape);
  if (!placements.length) return [];

  const scored = [];
  const step = placements.length > 12 ? placements.length / 12 : 1;
  for (let i = 0; i < placements.length; i += step) {
    const p = placements[Math.floor(i)];
    const sim = simulatePlacement(grid, shape, p.r, p.c);
    const score = sim.cleared * 400 + p.r * 2;
    scored.push({ grid: sim.grid, cleared: sim.cleared, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxSamples);
}

/**
 * Full 6-Permutation Lookahead Evaluator (checks A-B-C, A-C-B, B-A-C, B-C-A, C-A-B, C-B-A).
 * Returns { solvable: true, fitness >= 1 } if ANY order allows placing all 3 pieces cleanly,
 * or { solvable: false, fitness: -1 } if NO valid 3-move path exists (Deadlock!).
 */
function evaluateTrayAllPermutations(grid, tray, comboStreak = 0) {
  let bestFitness = -1;
  let bestLines = 0;

  for (let pIdx = 0; pIdx < TRAY_PERMUTATIONS.length; pIdx++) {
    const [i0, i1, i2] = TRAY_PERMUTATIONS[pIdx];
    const branches0 = pickTopStepPlacements(grid, tray[i0], 2);
    if (!branches0.length) continue;

    for (let b0 = 0; b0 < branches0.length; b0++) {
      const s0 = branches0[b0];
      const branches1 = pickTopStepPlacements(s0.grid, tray[i1], 2);
      if (!branches1.length) continue;

      for (let b1 = 0; b1 < branches1.length; b1++) {
        const s1 = branches1[b1];
        const branches2 = pickTopStepPlacements(s1.grid, tray[i2], 1);
        if (!branches2.length) continue;

        const s2 = branches2[0];
        const totalLines = s0.cleared + s1.cleared + s2.cleared;
        const fitness = computeBoardFitness(s2.grid, totalLines, comboStreak);
        if (fitness > bestFitness) {
          bestFitness = fitness;
          bestLines = totalLines;
        }
      }
    }
  }

  return {
    solvable: bestFitness !== -1,
    fitness: bestFitness,
    linesCleared: bestLines
  };
}

/**
 * Determines DDA Target Mode based on game phase, record progression & revive shield:
 * - 'EASY': Early-Game Shield (<30 moves), post-revive grace (<6 moves), or chasing Record + 2,500 runway.
 * - 'HARD': Past Record + 2,500 — tightens spaces while keeping solvable paths for skilled players.
 * - 'KILL_PLAYER': Deep post-record exhaustion (>= 65% tension on crowded boards) to trigger dramatic Revive.
 */
function determineDDAMode(grid, score, meta, tension, overrun) {
  const movesCount = meta.movesCount || 0;
  const postReviveMoves = meta.postReviveMoves ?? 99;

  if (movesCount < 30 || postReviveMoves < 6 || overrun <= 2500) {
    return 'EASY';
  }

  const occupied = countOccupiedCells(grid);
  if (tension >= 0.65 && occupied >= 24) {
    const killProb = 0.10 + (tension - 0.65) * 0.85;
    if (Math.random() < killProb) {
      return 'KILL_PLAYER';
    }
  }

  return 'HARD';
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
  // - Above recordTarget + 2500 -> smooth tension ramp up to 1.0 over next 3500 points ("опять начинает усложнять")
  const recordTarget = Math.max(initialBestScore, 4500);
  const overrun = score - recordTarget;
  let tension = 0;
  if (overrun > 2500) {
    tension = Math.min(1.0, (overrun - 2500) / 3500);
  }

  // Dynamic shape weights shaped by board density and Record Tension (excluding rescue-only 1x1 dot!)
  const weightedPool = SHAPES.filter((s) => !s.isRescueOnly).map((s) => {
    let w = s.weight;
    const isAwkward = s.id.startsWith('z_') || s.id.startsWith('s_') || s.id.startsWith('diag');

    if (fillRatio > 0.58) {
      if (s.tier === 'large') w *= (0.18 + tension * 0.55);
      if (s.tier === 'small') w *= (1.95 - tension * 0.70);
    } else if (fillRatio < 0.52) {
      // Open board: big, satisfying shapes dominate below record
      const boostScale = 1.0 - tension * 0.45;
      if (s.tier === 'large') w *= (1.0 + 0.90 * boostScale);
      if (s.id === 'sq3') w *= (1.0 + 1.45 * boostScale);
      else if (s.id === 'rect_2x3' || s.id === 'rect_3x2') w *= (1.0 + 1.15 * boostScale);
      if (s.id.startsWith('h4') || s.id.startsWith('v4') || s.id.startsWith('h5') || s.id.startsWith('v5') || s.id === 'sq2') {
        w *= (1.0 + 0.5 * boostScale);
      }
    }

    // Below record: suppress awkward Z/S & diagonals; high tension past record mixes them back in strongly
    if (isAwkward) {
      w *= (0.45 + tension * 1.75);
    }
    if (tension > 0.2 && (s.id.startsWith('bigL_') || s.id.startsWith('l_') || s.id.startsWith('t_'))) {
      w *= (1.0 + tension * 0.95);
    }

    return { ...s, weight: w };
  });

  // Dynamic Assisting candidates:
  const keyClearingShapes = findKeyClearingShapes(grid);
  const holeFillingShapes = findHoleFillingShapes(grid);

  const ddaMode = determineDDAMode(grid, score, meta, tension, overrun);
  const isEarlyShield = movesCount < 30 && overrun <= 2500;
  const isHighCombo = comboStreak >= 4;

  // Dynamic Director Probability:
  let assistChance;
  if (ddaMode === 'KILL_PLAYER') {
    assistChance = 0; // Lookahead Deadlock Hunter handles KILL_PLAYER cleanly
  } else if (isEarlyShield) {
    assistChance = 1.0;
  } else if (isHighCombo) {
    const superComboTaper = comboStreak >= 8 ? Math.min(0.55, (comboStreak - 7) * 0.08) : 0;
    const baseComboAssist = 0.90 - superComboTaper;
    assistChance = Math.max(0.20, baseComboAssist - tension * 0.58);
  } else if (comboStreak >= 1) {
    assistChance = Math.max(0.24, 0.88 - tension * 0.62);
  } else if (fillRatio >= 0.28) {
    assistChance = Math.max(0.18, 0.86 - tension * 0.68);
  } else {
    assistChance = Math.max(0.15, 0.78 - tension * 0.62);
  }

  const hasAssists = keyClearingShapes.length > 0 || holeFillingShapes.length > 0;
  const shouldAssist = ddaMode !== 'KILL_PLAYER' && hasAssists && Math.random() < assistChance;

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
      const superComboChainPenalty = comboStreak >= 7 ? Math.min(0.45, (comboStreak - 6) * 0.08) : 0;
      const chainProbability = isHighCombo
        ? Math.max(0.20, 0.72 - superComboChainPenalty - tension * 0.35)
        : Math.max(0.25, 0.72 - tension * 0.40);

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
        ? Math.max(0.15, 0.52 - (comboStreak >= 7 ? Math.min(0.30, (comboStreak - 6) * 0.06) : 0) - tension * 0.35)
        : Math.max(0.15, 0.55 - tension * 0.40);

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
    // 6-Permutation Lookahead Pool (checks ALL 6 move orderings A-B-C..C-B-A)
    const poolSize = ddaMode === 'EASY' ? 14 : 16;
    const maxLargePerHand = ddaMode === 'KILL_PLAYER' ? 3 : (tension > 0.55 ? 2 : 1);
    const evaluatedCandidates = [];
    let solvableCount = 0;

    for (let attempt = 0; attempt < poolSize; attempt++) {
      const cand = [];
      let largeCount = 0;

      for (let i = 0; i < 3; i++) {
        let pool = weightedPool;
        if (ddaMode === 'KILL_PLAYER') {
          const unplayable = weightedPool.filter((s) => getAllValidPlacements(grid, s).length === 0);
          if (unplayable.length > 0 && Math.random() < 0.65) {
            pool = unplayable;
          }
        } else if (largeCount >= maxLargePerHand) {
          pool = weightedPool.filter((s) => s.tier !== 'large');
        }
        const picked = pickWeightedShape(pool);
        if (picked.tier === 'large') largeCount++;
        cand.push(picked);
      }

      const evalRes = evaluateTrayAllPermutations(grid, cand, comboStreak);
      evaluatedCandidates.push({ tray: cand, fitness: evalRes.fitness, solvable: evalRes.solvable });
      if (evalRes.solvable) solvableCount++;

      // Fast-path exit in EASY if we found a healthy clean sequence
      if (ddaMode === 'EASY' && evalRes.solvable && (evalRes.linesCleared >= 1 || evalRes.fitness >= 260) && attempt >= 4) {
        break;
      }
      // Fast-path exit in HARD once we have enough diverse solvable puzzles
      if (ddaMode === 'HARD' && solvableCount >= 7) {
        break;
      }
      // Fast-path exit in KILL_PLAYER as soon as a verified deadlock across all 6 permutations is found
      if (ddaMode === 'KILL_PLAYER' && !evalRes.solvable) {
        break;
      }
    }

    if (ddaMode === 'KILL_PLAYER') {
      // Pick deadlocking tray (-1) if found; else sort ascending for maximum pressure
      evaluatedCandidates.sort((a, b) => {
        if (a.fitness === -1 && b.fitness !== -1) return -1;
        if (b.fitness === -1 && a.fitness !== -1) return 1;
        return a.fitness - b.fitness;
      });
      bestCandidate = evaluatedCandidates[0].tray;
    } else if (ddaMode === 'HARD') {
      // Always leave an escape path for skilled players if possible (`solvable === true`)!
      const solvablePool = evaluatedCandidates.filter((c) => c.solvable);
      if (solvablePool.length > 0) {
        solvablePool.sort((a, b) => a.fitness - b.fitness); // Tightest solvable puzzle
        const pickIdx = Math.floor(Math.random() * Math.min(3, solvablePool.length));
        bestCandidate = solvablePool[pickIdx].tray;
      } else {
        bestCandidate = evaluatedCandidates[0].tray;
      }
    } else {
      // EASY mode: Sort descending by Board Fitness Score (keep board clean, connected & combo-ready!)
      evaluatedCandidates.sort((a, b) => b.fitness - a.fitness);
      bestCandidate = evaluatedCandidates[0].tray;
    }
  }

  // Safety fallback (active for EASY and HARD; intentionally skipped in KILL_PLAYER)
  const normalFitting = weightedPool.filter((s) => getAllValidPlacements(grid, s).length > 0);
  const dotRescue = findClutchSingleDotRescue(grid);
  if (!bestCandidate) {
    if (normalFitting.length > 0) {
      bestCandidate = [pickWeightedShape(normalFitting), pickWeightedShape(weightedPool), pickWeightedShape(weightedPool)];
    } else if (dotRescue) {
      bestCandidate = [dotRescue.shape, pickWeightedShape(weightedPool), pickWeightedShape(weightedPool)];
    } else {
      bestCandidate = [pickWeightedShape(weightedPool), pickWeightedShape(weightedPool), pickWeightedShape(weightedPool)];
    }
  } else if (
    ddaMode !== 'KILL_PLAYER' &&
    !bestCandidate.some((s) => getAllValidPlacements(grid, s).length > 0)
  ) {
    if (normalFitting.length > 0) {
      bestCandidate[0] = pickWeightedShape(normalFitting);
    }
  }

  // Ultra-rare authentic 1x1 Rescue Dot (`dot1`) — NEVER spawns casually or during KILL_PLAYER!
  const movesSinceDot = meta.movesSinceDot ?? 99;
  if (ddaMode !== 'KILL_PLAYER' && !bestCandidate.some((s) => s.id === 'dot1') && dotRescue) {
    const noNormalFits = normalFitting.length === 0;
    const isEmergencyClear = fillRatio >= 0.54 && keyClearingShapes.length === 0 && dotRescue.cleared >= 1;
    let dotChance = 0;

    if (noNormalFits && tension < 0.85) {
      dotChance = 1.0; // Miracle survival when >=2-cell shapes can no longer fit!
    } else if (movesSinceDot >= 12 && tension < 0.75) {
      if (dotRescue.fixesTrappedHole && dotRescue.cleared >= 1) dotChance = 0.50;
      else if (dotRescue.fixesTrappedHole) dotChance = 0.28;
      else if (isEmergencyClear) dotChance = isEarlyShield ? 0.45 : 0.30;
    }

    if (dotChance > 0 && Math.random() < dotChance) {
      const nonLargeIndices = bestCandidate
        .map((s, idx) => (s.tier !== 'large' ? idx : -1))
        .filter((idx) => idx !== -1);
      const targetSlot = nonLargeIndices.length > 0
        ? nonLargeIndices[Math.floor(Math.random() * nonLargeIndices.length)]
        : Math.floor(Math.random() * 3);
      bestCandidate[targetSlot] = dotRescue.shape;
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
window.findClutchSingleDotRescue = findClutchSingleDotRescue;
window.computeBoardFitness = computeBoardFitness;
window.evaluateTrayAllPermutations = evaluateTrayAllPermutations;
window.determineDDAMode = determineDDAMode;
window.generateSmartTray = generateSmartTray;
window.generateOpeningHand = generateOpeningHand;
