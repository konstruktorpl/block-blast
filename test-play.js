// Autonomous AI Playtester for Block Blast!
global.window = global;

// Mock localStorage for Node.js
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
};

// Mock document for QuestManager UI calls
global.document = {
  getElementById: () => null
};

require('./shapes.js');
require('./quests.js');

function renderGridAscii(grid) {
  const chars = ['⬛', '🟦', '🟩', '🟨', '🟧', '🟪', '🟥'];
  let str = '   0 1 2 3 4 5 6 7\n';
  for (let r = 0; r < 8; r++) {
    str += `${r} `;
    for (let c = 0; c < 8; c++) {
      if (grid[r][c] === null) {
        str += ' ·';
      } else {
        const val = grid[r][c];
        str += ' ' + (typeof val === 'number' ? (val + 1) : '#');
      }
    }
    str += '\n';
  }
  return str;
}

class PlaytestGame {
  constructor(palette = [0, 1, 2, 3, 4, 5]) {
    this.palette = palette;
    this.grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.score = 0;
    this.comboStreak = 0;
    this.maxCombo = 0;
    this.totalLines = 0;
    this.totalBlocks = 0;
    this.traysPlayed = 0;
    this.movesCount = 0;
    this.isGameOver = false;

    // Stats on shapes received
    this.shapeStats = {
      sq3: 0,
      rectangles: 0,
      sq2: 0,
      bars5: 0,
      bars4: 0,
      bars3: 0,
      others: 0
    };
  }

  seedStartingBoard() {
    const candidateIds = [
      'rect_2x3', 'rect_3x2', 'sq2', 'h5', 'h4', 'v4', 'h3', 'v3',
      'c3_tl', 'c3_tr', 'c3_bl', 'c3_br', 'bigL_tl', 'bigL_tr', 'bigL_bl', 'bigL_br'
    ];
    const candidateShapes = window.SHAPES.filter((s) => candidateIds.includes(s.id));

    let seededSuccessfully = false;

    for (let trial = 0; trial < 80; trial++) {
      const trialGrid = Array.from({ length: 8 }, () => Array(8).fill(null));
      let placedBlocks = 0;
      let placedPieces = 0;
      const anchorMode = Math.floor(Math.random() * 3);
      const minR = 3;

      while (placedBlocks < 16 && placedPieces < 7) {
        const shape = candidateShapes[Math.floor(Math.random() * candidateShapes.length)];
        const validPlacements = [];

        for (let r = minR; r <= 8 - shape.rows; r++) {
          for (let c = 0; c <= 8 - shape.cols; c++) {
            if (anchorMode === 0 && c > 5) continue;
            if (anchorMode === 1 && c < 2) continue;
            if (!window.canMatrixFitAt(trialGrid, shape, r, c)) continue;

            if (placedPieces > 0) {
              let adjacent = false;
              for (const cell of shape.cells) {
                const gr = r + cell.r;
                const gc = c + cell.c;
                const nbrs = [[gr - 1, gc], [gr + 1, gc], [gr, gc - 1], [gr, gc + 1]];
                for (const [nr, nc] of nbrs) {
                  if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && trialGrid[nr][nc] !== null) {
                    adjacent = true;
                    break;
                  }
                }
                if (adjacent) break;
              }
              if (!adjacent) continue;
            }

            const rowCounts = Array(8).fill(0);
            const colCounts = Array(8).fill(0);
            for (let gr = 0; gr < 8; gr++) {
              for (let gc = 0; gc < 8; gc++) {
                if (trialGrid[gr][gc] !== null) { rowCounts[gr]++; colCounts[gc]++; }
              }
            }

            let causesClear = false;
            for (const cell of shape.cells) {
              const gr = r + cell.r;
              const gc = c + cell.c;
              rowCounts[gr]++;
              colCounts[gc]++;
              if (rowCounts[gr] >= 8 || colCounts[gc] >= 8) {
                causesClear = true;
                break;
              }
            }
            if (causesClear) continue;

            const testGrid = trialGrid.map((row) => row.slice());
            for (const cell of shape.cells) {
              testGrid[r + cell.r][c + cell.c] = 1;
            }
            if (window.countTrappedSingleHoles(testGrid) > 0) continue;

            let affinity = (r - 2) * 2;
            validPlacements.push({ r, c, affinity });
          }
        }

        if (!validPlacements.length) break;

        const chosen = validPlacements[Math.floor(Math.random() * validPlacements.length)];
        const colorIndex = (placedPieces) % this.palette.length;
        for (const cell of shape.cells) {
          trialGrid[chosen.r + cell.r][chosen.c + cell.c] = colorIndex;
          placedBlocks++;
        }
        placedPieces++;
      }

      if (placedBlocks >= 15 && placedBlocks <= 22) {
        const clearers = window.findKeyClearingShapes(trialGrid);
        if (clearers.length >= 3) {
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              this.grid[r][c] = trialGrid[r][c];
            }
          }
          seededSuccessfully = true;
          this.initialBlocksCount = placedBlocks;
          this.initialPiecesCount = placedPieces;
          this.initialClearersCount = clearers.length;
          break;
        }
      }
    }

    if (!seededSuccessfully) {
      // Fallback preset
      const preset = [
        { color: 0, cells: [[7, 0], [7, 1], [7, 2], [6, 0], [6, 1], [6, 2]] },
        { color: 1, cells: [[7, 3], [7, 4], [7, 5], [6, 3], [6, 4], [6, 5]] },
        { color: 2, cells: [[6, 6], [5, 6], [5, 5], [5, 4]] },
        { color: 3, cells: [[5, 1], [5, 2], [4, 1]] }
      ];
      preset.forEach(piece => {
        piece.cells.forEach(([r, c]) => { this.grid[r][c] = piece.color; });
      });
      this.initialBlocksCount = 19;
      this.initialPiecesCount = 4;
      this.initialClearersCount = window.findKeyClearingShapes(this.grid).length;
    }
  }

  evaluatePlacement(grid, shape, r, c) {
    const sim = window.simulatePlacement(grid, shape, r, c);
    const baseTrapped = window.countTrappedSingleHoles(grid);
    const postTrapped = window.countTrappedSingleHoles(sim.grid);
    const newTrapped = postTrapped - baseTrapped;

    // Heavy penalty for isolated unfillable 1x1 void
    if (newTrapped > 0) {
      return -9999;
    }

    let score = 0;

    // 1. Line clear is king! (combo sustain)
    if (sim.cleared > 0) {
      score += sim.cleared * 500;
    }

    // 2. High bonus for lines brought close to clear (6/8 or 7/8)
    for (let gr = 0; gr < 8; gr++) {
      const rc = sim.grid[gr].filter(v => v !== null).length;
      if (rc === 7) score += 40;
      else if (rc === 6) score += 20;
    }
    for (let gc = 0; gc < 8; gc++) {
      let cc = 0;
      for (let gr = 0; gr < 8; gr++) if (sim.grid[gr][gc] !== null) cc++;
      if (cc === 7) score += 40;
      else if (cc === 6) score += 20;
    }

    // 3. Contact with existing blocks
    let contact = 0;
    for (const cell of shape.cells) {
      const gr = r + cell.r;
      const gc = c + cell.c;
      const nbrs = [[gr-1, gc], [gr+1, gc], [gr, gc-1], [gr, gc+1]];
      for (const [nr, nc] of nbrs) {
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && grid[nr][nc] !== null) {
          contact += 15;
        } else if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) {
          contact += 5; // wall contact
        }
      }
    }
    score += contact;

    // 4. Slight bottom preference (r bias)
    score += r * 3;

    return score;
  }

  findBestMove(trayItems) {
    // Permutation search over remaining available tray items
    const available = trayItems.filter(item => !item.placed);
    if (!available.length) return null;

    let bestMove = null;
    let highestScore = -Infinity;

    for (const item of available) {
      const placements = window.getAllValidPlacements(this.grid, item.shape);
      for (const p of placements) {
        const evalScore = this.evaluatePlacement(this.grid, item.shape, p.r, p.c);
        if (evalScore > highestScore) {
          highestScore = evalScore;
          bestMove = { item, placement: p, score: evalScore };
        }
      }
    }

    return bestMove;
  }

  applyMove(move) {
    const { item, placement } = move;
    const shape = item.shape;
    const r = placement.r;
    const c = placement.c;

    // Track shape stats
    if (shape.id === 'sq3') this.shapeStats.sq3++;
    else if (shape.id.startsWith('rect_')) this.shapeStats.rectangles++;
    else if (shape.id === 'sq2') this.shapeStats.sq2++;
    else if (shape.id.startsWith('h5') || shape.id.startsWith('v5')) this.shapeStats.bars5++;
    else if (shape.id.startsWith('h4') || shape.id.startsWith('v4')) this.shapeStats.bars4++;
    else if (shape.id.startsWith('h3') || shape.id.startsWith('v3')) this.shapeStats.bars3++;
    else this.shapeStats.others++;

    // Place block on grid
    for (const cell of shape.cells) {
      this.grid[r + cell.r][c + cell.c] = item.colorIndex;
    }
    item.placed = true;
    this.movesCount++;
    this.totalBlocks += shape.blockCount;

    // Check full rows / cols
    const fullRows = [];
    const fullCols = [];
    for (let gr = 0; gr < 8; gr++) {
      if (this.grid[gr].every(v => v !== null)) fullRows.push(gr);
    }
    for (let gc = 0; gc < 8; gc++) {
      let full = true;
      for (let gr = 0; gr < 8; gr++) {
        if (this.grid[gr][gc] === null) { full = false; break; }
      }
      if (full) fullCols.push(gc);
    }

    const clearedCount = fullRows.length + fullCols.length;

    // Clear completed lines
    for (const fr of fullRows) {
      for (let gc = 0; gc < 8; gc++) this.grid[fr][gc] = null;
    }
    for (const fc of fullCols) {
      for (let gr = 0; gr < 8; gr++) this.grid[gr][fc] = null;
    }

    if (clearedCount > 0) {
      this.comboStreak++;
      if (this.comboStreak > this.maxCombo) {
        this.maxCombo = this.comboStreak;
      }
      this.totalLines += clearedCount;
      const pts = shape.blockCount * 10 + clearedCount * 100 * this.comboStreak;
      this.score += pts;
    } else {
      this.comboStreak = 0;
      this.score += shape.blockCount * 10;
    }

    // Quest notifications
    if (window.questManager) {
      window.questManager.onEvent('lines_cleared', clearedCount);
      window.questManager.onEvent('blocks_destroyed', shape.blockCount + clearedCount * 8);
      window.questManager.onEvent('max_combo', this.comboStreak);
      window.questManager.onEvent('single_score', this.score);
    }

    return { clearedCount, currentCombo: this.comboStreak };
  }

  playFullGame(maxTrays = 100, onStepCallback = null) {
    this.seedStartingBoard();
    if (window.questManager) {
      window.questManager.onEvent('games_played', 1);
    }

    let isFirstHand = true;

    while (this.traysPlayed < maxTrays && !this.isGameOver) {
      let tray = null;
      if (isFirstHand && window.generateOpeningHand) {
        tray = window.generateOpeningHand(this.grid, this.palette);
        isFirstHand = false;
      } else {
        tray = window.generateSmartTray(this.grid, this.palette, this.score, this.comboStreak);
      }

      this.traysPlayed++;

      // Place all 3 pieces in the tray if possible
      for (let pieceIdx = 0; pieceIdx < 3; pieceIdx++) {
        const bestMove = this.findBestMove(tray);
        if (!bestMove) {
          this.isGameOver = true;
          break;
        }

        const res = this.applyMove(bestMove);
        if (onStepCallback) {
          onStepCallback({
            trayNum: this.traysPlayed,
            pieceIdx: pieceIdx + 1,
            shapeId: bestMove.item.shape.id,
            placement: bestMove.placement,
            clearedCount: res.clearedCount,
            combo: res.currentCombo,
            score: this.score,
            grid: this.grid.map(r => r.slice())
          });
        }
      }
    }

    return {
      score: this.score,
      maxCombo: this.maxCombo,
      totalLines: this.totalLines,
      totalBlocks: this.totalBlocks,
      traysPlayed: this.traysPlayed,
      movesCount: this.movesCount,
      shapeStats: this.shapeStats
    };
  }
}

// --------------------------------------------------------------------------
// TEST EXECUTION
// --------------------------------------------------------------------------
console.log('================================================================');
console.log('       🎮 BLOCK BLAST AUTONOMOUS BOT PLAYTEST SESSION 🎮        ');
console.log('================================================================\n');

// 1. Detailed Inspection of Game 1's Opening Hand & Starting Layout
console.log('--- TEST 1: STARTING LAYOUT & GUARANTEED 3-COMBO OPENING ---');
const game1 = new PlaytestGame();
game1.seedStartingBoard();

console.log(`Pre-seeded Cluster: ${game1.initialBlocksCount} blocks from ${game1.initialPiecesCount} polyominoes.`);
console.log(`Immediate Key Clearer shapes available: ${game1.initialClearersCount}`);
console.log('\n[Initial Board with Architectural Cluster]:');
console.log(renderGridAscii(game1.grid));

const openingHand = window.generateOpeningHand(game1.grid, game1.palette);
console.log(`Opening 3-piece Tray dealt: [${openingHand.map(t => t.shape.id).join(', ')}]`);

let openingStep = 1;
const openingStepsHistory = [];

for (let i = 0; i < 3; i++) {
  const move = game1.findBestMove(openingHand);
  if (!move) {
    console.log('❌ Deadlock on opening hand!');
    break;
  }
  const res = game1.applyMove(move);
  openingStepsHistory.push({
    step: openingStep++,
    shape: move.item.shape.id,
    cleared: res.clearedCount,
    combo: res.currentCombo,
    score: game1.score
  });
  console.log(`\nMove ${i + 1}: Placed "${move.item.shape.id}" at (${move.placement.r}, ${move.placement.c}) -> Lines Cleared: ${res.clearedCount} | Combo: x${res.currentCombo} | Score: ${game1.score}`);
  console.log(renderGridAscii(game1.grid));
}

console.log('Opening Sequence Summary:');
openingStepsHistory.forEach(s => {
  console.log(`  Step ${s.step}: Shape ${s.shape.padEnd(8)} -> Cleared: ${s.cleared} lines | Combo: x${s.combo} | Score: ${s.score}`);
});

// Continue Game 1 to completion!
console.log('\n--- PLAYING OUT GAME 1 TO COMPLETION ---');
let comboMilestones = [];
const game1Full = game1.playFullGame(150, (step) => {
  if (step.combo >= 4 && !comboMilestones.includes(step.combo)) {
    comboMilestones.push(step.combo);
    console.log(`🔥 [HIGH COMBO REACHED]: Combo x${step.combo} at move ${game1.movesCount} (Score: ${step.score})!`);
  }
});

console.log('\nGame 1 Complete Results:');
console.log(`  Final Score:        ${game1Full.score.toLocaleString()}`);
console.log(`  Max Combo:          x${game1Full.maxCombo}`);
console.log(`  Total Lines Cleared: ${game1Full.totalLines}`);
console.log(`  Total Moves:        ${game1Full.movesCount}`);
console.log(`  Trays Played:       ${game1Full.traysPlayed}`);
console.log(`  Shape Distribution:`);
console.log(`    - 3x3 Giant Squares (sq3): ${game1Full.shapeStats.sq3}`);
console.log(`    - Rectangles (2x3, 3x2):   ${game1Full.shapeStats.rectangles}`);
console.log(`    - 2x2 Squares (sq2):       ${game1Full.shapeStats.sq2}`);
console.log(`    - 5-block Bars (h5, v5):   ${game1Full.shapeStats.bars5}`);
console.log(`    - 4-block Bars (h4, v4):   ${game1Full.shapeStats.bars4}`);
console.log(`    - 3-block Bars (h3, v3):   ${game1Full.shapeStats.bars3}`);
console.log(`    - Other Polyominoes:       ${game1Full.shapeStats.others}`);

// 2. Play 4 more full games to gather solid statistical benchmarks
console.log('\n--- SIMULATING 4 MORE COMPLETE GAMES (STATISTICAL BENCHMARK) ---');
const allGames = [game1Full];
for (let g = 2; g <= 5; g++) {
  const gTest = new PlaytestGame();
  const res = gTest.playFullGame(150);
  allGames.push(res);
  console.log(`Game ${g}: Score = ${res.score.toLocaleString().padStart(6)} | Max Combo = x${res.maxCombo} | Lines = ${String(res.totalLines).padStart(2)} | Moves = ${String(res.movesCount).padStart(2)}`);
}

const avgScore = Math.round(allGames.reduce((acc, g) => acc + g.score, 0) / allGames.length);
const maxScore = Math.max(...allGames.map(g => g.score));
const maxEverCombo = Math.max(...allGames.map(g => g.maxCombo));
const avgLines = Math.round(allGames.reduce((acc, g) => acc + g.totalLines, 0) / allGames.length);

console.log('\n5-Game Aggregated Statistics:');
console.log(`  Average Score: ${avgScore.toLocaleString()}`);
console.log(`  Highest Score: ${maxScore.toLocaleString()}`);
console.log(`  Highest Combo: x${maxEverCombo}`);
console.log(`  Average Lines: ${avgLines}`);

// 3. Quest Expiration & Reset Verification
console.log('\n--- TEST 3: QUESTS TRACKING & TIMEOUT RESET VERIFICATION ---');
const qm = window.questManager;
console.log('Current Quests state after games:');
console.log('Daily Quests:');
qm.dailyQuests.forEach(q => {
  console.log(`  - [${q.title}]: ${q.current}/${q.target} (Claimed: ${q.claimed})`);
});
console.log('Express Quests:');
qm.hourlyQuests.forEach(q => {
  console.log(`  - [${q.title}]: ${q.current}/${q.target} (Claimed: ${q.claimed})`);
});

// Artificially simulate 1 uncompleted quest with partial progress
if (qm.hourlyQuests.length > 0) {
  qm.hourlyQuests[0].current = Math.min(qm.hourlyQuests[0].target - 1, 15);
  qm.hourlyQuests[0].claimed = false;
  console.log(`\nSimulated partial uncompleted quest before expiry: "${qm.hourlyQuests[0].title}" -> progress = ${qm.hourlyQuests[0].current}/${qm.hourlyQuests[0].target}`);
  
  // Fast forward time past hourlyExpiresAt (simulate timer expiring at 00:00)
  qm.hourlyExpiresAt = Date.now() - 5000;
  console.log('Simulated timer expiration (now >= hourlyExpiresAt)... Triggering checkTimeExpiry()...');
  const expired = qm.checkTimeExpiry();
  console.log(`checkTimeExpiry() returned: ${expired}`);
  console.log(`Progress after expiration: "${qm.hourlyQuests[0].title}" -> progress = ${qm.hourlyQuests[0].current}/${qm.hourlyQuests[0].target}`);

  if (qm.hourlyQuests[0].current === 0) {
    console.log('✅ PASS: Uncompleted quest progress was strictly reset to 0!');
  } else {
    console.log('❌ FAIL: Progress was not reset to 0!');
  }
}

console.log('\n================================================================');
console.log('              ALL AUTONOMOUS PLAYTESTS FINISHED                ');
console.log('================================================================');
