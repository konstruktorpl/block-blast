// Core 8x8 Game Engine, Touch Controller & Renderer for Block Blast!

class BlockBlastGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.wrapper = document.getElementById('canvasWrapper');

    // UI Elements
    this.scoreEl = document.getElementById('currentScore');
    this.bestScoreEl = document.getElementById('bestScoreValue');

    this.fx = new window.FXManager();

    // Persistent Preferences
    this.themeId = localStorage.getItem('bb_theme') || 'classic';
    if (!window.THEMES[this.themeId]) this.themeId = 'classic';

    this.bestScore = parseInt(localStorage.getItem('bb_best_score') || '0', 10) || 0;

    // Game State
    this.grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.tray = [];
    this.score = 0;
    this.displayedScore = 0;
    this.comboStreak = 0;
    this.maxCombo = 1;
    this.movesSinceLastClear = 0; // In Block Blast, combo stays alive for up to 3 placements
    this.isGameOver = false;

    // Drag State
    this.drag = {
      active: false,
      pointerId: null,
      slotIndex: -1,
      piece: null,
      x: 0,
      y: 0,
      visualX: 0,
      visualY: 0,
      visualScale: 0.56,
      isTouch: false,
      snapR: -1,
      snapC: -1,
      validSnap: false,
      previewRows: [],
      previewCols: []
    };

    // Layout metrics (computed in resize)
    this.metrics = {
      width: 360,
      height: 540,
      boardSize: 320,
      boardX: 20,
      boardY: 10,
      boardPad: 8,
      cellSize: 38,
      dockY: 360,
      dockHeight: 130,
      dockSlotCenters: []
    };

    this.lastTime = performance.now();

    this.applyTheme(this.themeId);
    this.bindEvents();
    this.resize();

    if (!this.loadSavedGame()) {
      this.startNewGame();
    } else {
      this.updateHUD(true);
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  get theme() {
    return window.THEMES[this.themeId] || window.THEMES.classic;
  }

  applyTheme(themeId) {
    if (!window.THEMES[themeId]) return;
    this.themeId = themeId;
    localStorage.setItem('bb_theme', themeId);
    const t = this.theme;
    document.documentElement.style.setProperty('--bg-gradient', t.bgGradient);
    document.documentElement.style.background = t.themeColor;
    document.body.style.background = t.bgGradient;
    document.documentElement.style.setProperty('--text-primary', t.textPrimary);
    document.documentElement.style.setProperty('--text-accent', t.textAccent);
    document.documentElement.style.setProperty('--board-bg', t.boardBg);
    document.documentElement.style.setProperty('--board-border', t.boardBorder);
    const metaTheme = document.getElementById('metaThemeColor');
    if (metaTheme) metaTheme.setAttribute('content', t.themeColor);
    this.renderThemeModalList();
  }

  startNewGame() {
    this.grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.score = 0;
    this.displayedScore = 0;
    this.comboStreak = 0;
    this.maxCombo = 1;
    this.movesSinceLastClear = 0;
    this.isGameOver = false;
    this.drag.active = false;

    this.spawnNewTray();
    this.saveGameState();
    this.updateHUD(true);
    document.getElementById('gameOverModal').classList.add('hidden');
  }

  spawnNewTray() {
    this.tray = window.generateSmartTray(this.grid, this.theme.palette, this.score);
    this.checkPieceFitStates();
  }

  checkPieceFitStates() {
    let anyFits = false;
    for (const item of this.tray) {
      if (!item || item.placed) continue;
      const fits = window.getAllValidPlacements(this.grid, item.shape).length > 0;
      item.canFit = fits;
      if (fits) anyFits = true;
    }
    return anyFits;
  }

  saveGameState() {
    if (this.isGameOver) {
      localStorage.removeItem('bb_saved_state');
      return;
    }
    try {
      const state = {
        grid: this.grid,
        score: this.score,
        comboStreak: this.comboStreak,
        maxCombo: this.maxCombo,
        movesSinceLastClear: this.movesSinceLastClear,
        tray: this.tray.map((t) => ({
          slotIndex: t.slotIndex,
          shapeId: t.shape.id,
          colorIndex: t.colorIndex,
          placed: t.placed
        }))
      };
      localStorage.setItem('bb_saved_state', JSON.stringify(state));
    } catch (e) {}
  }

  loadSavedGame() {
    try {
      const raw = localStorage.getItem('bb_saved_state');
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.grid) || data.grid.length !== 8) return false;

      this.grid = data.grid;
      this.score = data.score || 0;
      this.displayedScore = this.score;
      this.comboStreak = data.comboStreak || 0;
      this.maxCombo = data.maxCombo || 1;
      this.movesSinceLastClear = data.movesSinceLastClear || 0;

      this.tray = (data.tray || []).map((t, idx) => {
        const shape = window.SHAPES.find((s) => s.id === t.shapeId) || window.SHAPES[0];
        return {
          slotIndex: idx,
          shape,
          colorIndex: t.colorIndex % this.theme.palette.length,
          placed: Boolean(t.placed),
          scale: 1,
          targetScale: 1,
          offsetX: 0,
          offsetY: 0,
          canFit: true
        };
      });

      if (this.tray.length !== 3 || this.tray.every((t) => t.placed)) {
        this.spawnNewTray();
      } else {
        const anyFits = this.checkPieceFitStates();
        if (!anyFits) return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  updateHUD(instant = false) {
    if (instant) {
      this.displayedScore = this.score;
      this.scoreEl.textContent = this.score.toLocaleString('ru-RU');
    }
    this.bestScoreEl.textContent = this.bestScore.toLocaleString('ru-RU');

    const soundLabel = document.getElementById('soundLabel');
    if (soundLabel) {
      soundLabel.textContent = window.soundEngine.enabled ? 'Вкл' : 'Выкл';
    }
  }

  resize() {
    const rect = this.wrapper.getBoundingClientRect();
    const w = Math.max(280, rect.width);
    const h = Math.max(360, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Reserve ~27% of height (at least 115px, at most 165px) for the 3-piece dock at bottom
    const minDockH = Math.min(155, Math.max(112, h * 0.26));
    const topMargin = 6;
    const gapBetweenBoardAndDock = Math.max(12, h * 0.025);
    const maxBoardSpaceH = h - minDockH - topMargin - gapBetweenBoardAndDock;
    const maxBoardSpaceW = w - 8;

    const boardSize = Math.floor(Math.min(maxBoardSpaceW, maxBoardSpaceH));
    const boardPad = Math.max(3, Math.round(boardSize * 0.01));
    const cellSize = (boardSize - boardPad * 2) / 8;

    const boardX = Math.round((w - boardSize) / 2);
    const boardY = topMargin;
    const dockY = boardY + boardSize + gapBetweenBoardAndDock;
    const dockHeight = Math.max(96, h - dockY - 4);

    const slotW = boardSize / 3;
    const dockSlotCenters = [
      { x: boardX + slotW * 0.5, y: dockY + dockHeight * 0.48 },
      { x: boardX + slotW * 1.5, y: dockY + dockHeight * 0.48 },
      { x: boardX + slotW * 2.5, y: dockY + dockHeight * 0.48 }
    ];

    this.metrics = {
      width: w,
      height: h,
      boardSize,
      boardX,
      boardY,
      boardPad,
      cellSize,
      dockY,
      dockHeight,
      dockSlotCenters
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 100));

    // Global unlock for WebAudio on iOS Safari
    const unlockAudio = () => {
      window.soundEngine.init();
      if (window.soundEngine.ctx && window.soundEngine.ctx.state === 'suspended') {
        window.soundEngine.ctx.resume();
      }
    };
    ['touchstart', 'touchend', 'pointerdown', 'click'].forEach(evt => {
      document.addEventListener(evt, unlockAudio, { passive: true, once: false });
    });

    // Pointer / Touch Unified Handling on Canvas
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
    window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.onPointerUp(e), { passive: false });
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e), { passive: false });

    // Prevent iOS Safari bounce/scroll gestures
    document.addEventListener('touchmove', (e) => {
      if (!e.target.closest('.modal-card')) {
        e.preventDefault();
      }
    }, { passive: false });

    const hide = (id) => document.getElementById(id).classList.add('hidden');
    const show = (id) => document.getElementById(id).classList.remove('hidden');

    // Start screen
    document.getElementById('btnStartClassic').addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.playPickup();
      hide('startScreen');
    });

    // Settings (gear)
    document.getElementById('btnSettings').addEventListener('click', () => {
      window.soundEngine.playPickup();
      this.updateHUD();
      show('settingsModal');
    });

    document.getElementById('btnSound').addEventListener('click', () => {
      window.soundEngine.toggle();
      this.updateHUD();
    });

    document.getElementById('btnRestart').addEventListener('click', () => {
      window.soundEngine.playPickup();
      hide('settingsModal');
      this.startNewGame();
    });

    document.getElementById('btnHome').addEventListener('click', () => {
      window.soundEngine.playPickup();
      hide('settingsModal');
      show('startScreen');
    });

    document.getElementById('btnPlayAgain').addEventListener('click', () => {
      window.soundEngine.playPickup();
      this.startNewGame();
    });

    document.getElementById('btnTheme').addEventListener('click', () => {
      window.soundEngine.playPickup();
      hide('settingsModal');
      this.renderThemeModalList();
      show('themeModal');
    });

    const btnIphone = document.getElementById('btnIphone');
    if (btnIphone) {
      btnIphone.addEventListener('click', () => {
        window.soundEngine.playPickup();
        hide('settingsModal');
        this.openIphoneModal();
      });
    }

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-close');
        document.getElementById(target).classList.add('hidden');
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop && backdrop.id !== 'gameOverModal') {
          backdrop.classList.add('hidden');
        }
      });
    });
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  onPointerDown(e) {
    e.preventDefault();
    window.soundEngine.init();
    if (this.isGameOver || this.drag.active) return;

    const pt = this.getCanvasCoords(e);
    const { dockY, dockHeight, boardX, boardSize, dockSlotCenters } = this.metrics;

    // Check if touch is in or near the bottom dock area
    if (pt.y >= dockY - 28 && pt.y <= dockY + dockHeight + 25) {
      // Determine which of the 3 slots was touched
      let bestSlot = -1;
      let minDist = Infinity;
      for (let i = 0; i < 3; i++) {
        const item = this.tray[i];
        if (!item || item.placed) continue;
        const center = dockSlotCenters[i];
        const dist = Math.hypot(pt.x - center.x, pt.y - center.y);
        if (dist < minDist && dist < boardSize * 0.26) {
          minDist = dist;
          bestSlot = i;
        }
      }

      if (bestSlot !== -1) {
        const piece = this.tray[bestSlot];
        const center = dockSlotCenters[bestSlot];
        const isTouch = e.pointerType === 'touch' || e.pointerType === 'pen' || ('ontouchstart' in window);

        this.drag.active = true;
        this.drag.pointerId = e.pointerId;
        this.drag.slotIndex = bestSlot;
        this.drag.piece = piece;
        this.drag.isTouch = isTouch;
        this.drag.x = pt.x;
        this.drag.y = pt.y;
        this.drag.visualX = center.x;
        this.drag.visualY = center.y;
        this.drag.visualScale = 0.56;
        this.drag.snapR = -1;
        this.drag.snapC = -1;
        this.drag.validSnap = false;
        this.drag.previewRows = [];
        this.drag.previewCols = [];

        window.soundEngine.playPickup();
        this.updateDragTarget(pt.x, pt.y);
      }
    }
  }

  onPointerMove(e) {
    if (!this.drag.active || e.pointerId !== this.drag.pointerId) return;
    e.preventDefault();
    const pt = this.getCanvasCoords(e);
    this.updateDragTarget(pt.x, pt.y);
  }

  updateDragTarget(px, py) {
    this.drag.x = px;
    this.drag.y = py;

    const { cellSize, boardX, boardY, boardPad } = this.metrics;
    const shape = this.drag.piece.shape;

    // Lift the piece comfortably above the finger on iPhone so the thumb never blocks the view
    const liftY = this.drag.isTouch ? cellSize * 2.45 : cellSize * 0.65;
    const centerX = px;
    const centerY = py - liftY;

    const pieceW = shape.cols * cellSize;
    const pieceH = shape.rows * cellSize;
    const topLeftX = centerX - pieceW / 2;
    const topLeftY = centerY - pieceH / 2;

    const gridOriginX = boardX + boardPad;
    const gridOriginY = boardY + boardPad;

    const exactC = (topLeftX - gridOriginX) / cellSize;
    const exactR = (topLeftY - gridOriginY) / cellSize;

    const baseR = Math.round(exactR);
    const baseC = Math.round(exactC);

    // Magnetic snapping: check primary rounded cell first, then very close neighbors if blocked
    let chosenR = -1;
    let chosenC = -1;
    let found = false;

    // Only snap if piece is reasonably over the 8x8 board
    if (
      exactR > -1.35 &&
      exactR < 8 - shape.rows + 1.35 &&
      exactC > -1.35 &&
      exactC < 8 - shape.cols + 1.35
    ) {
      if (window.canMatrixFitAt(this.grid, shape, baseR, baseC)) {
        chosenR = baseR;
        chosenC = baseC;
        found = true;
      } else {
        // Check slight magnetic assist offsets if finger is slightly off-center
        const candidates = [
          { r: Math.floor(exactR), c: baseC },
          { r: Math.ceil(exactR), c: baseC },
          { r: baseR, c: Math.floor(exactC) },
          { r: baseR, c: Math.ceil(exactC) }
        ];
        let bestDist = 0.68;
        for (const cand of candidates) {
          const dist = Math.hypot(cand.r - exactR, cand.c - exactC);
          if (dist < bestDist && window.canMatrixFitAt(this.grid, shape, cand.r, cand.c)) {
            bestDist = dist;
            chosenR = cand.r;
            chosenC = cand.c;
            found = true;
          }
        }
      }
    }

    if (found) {
      if (this.drag.snapR !== chosenR || this.drag.snapC !== chosenC) {
        window.soundEngine.playHoverTick();
      }
      this.drag.snapR = chosenR;
      this.drag.snapC = chosenC;
      this.drag.validSnap = true;
      this.computeLineClearPreview(shape, chosenR, chosenC);
    } else {
      this.drag.snapR = -1;
      this.drag.snapC = -1;
      this.drag.validSnap = false;
      this.drag.previewRows = [];
      this.drag.previewCols = [];
    }
  }

  computeLineClearPreview(shape, startR, startC) {
    const temp = this.grid.map((row) => row.slice());
    for (const cell of shape.cells) {
      temp[startR + cell.r][startC + cell.c] = 1;
    }

    const rows = [];
    const cols = [];
    for (let r = 0; r < 8; r++) {
      if (temp[r].every((v) => v !== null)) rows.push(r);
    }
    for (let c = 0; c < 8; c++) {
      let full = true;
      for (let r = 0; r < 8; r++) {
        if (temp[r][c] === null) {
          full = false;
          break;
        }
      }
      if (full) cols.push(c);
    }
    this.drag.previewRows = rows;
    this.drag.previewCols = cols;
  }

  onPointerUp(e) {
    if (!this.drag.active || e.pointerId !== this.drag.pointerId) return;
    e.preventDefault();

    const { validSnap, snapR, snapC, piece } = this.drag;
    this.drag.active = false;
    this.drag.pointerId = null;

    if (validSnap && piece) {
      this.placePieceOnBoard(piece, snapR, snapC);
    } else {
      window.soundEngine.playReturn();
    }

    this.drag.previewRows = [];
    this.drag.previewCols = [];
  }

  placePieceOnBoard(piece, startR, startC) {
    const { shape, colorIndex } = piece;
    const { boardX, boardY, boardPad, cellSize } = this.metrics;
    const gridOriginX = boardX + boardPad;
    const gridOriginY = boardY + boardPad;

    // Lock cells into the 8x8 board
    for (const cell of shape.cells) {
      this.grid[startR + cell.r][startC + cell.c] = colorIndex;
    }
    piece.placed = true;

    // Base placement points (= number of blocks in the piece)
    const placementPoints = shape.blockCount;
    let movePoints = placementPoints;

    // Check full rows and columns
    const fullRows = [];
    const fullCols = [];
    for (let r = 0; r < 8; r++) {
      if (this.grid[r].every((v) => v !== null)) fullRows.push(r);
    }
    for (let c = 0; c < 8; c++) {
      let full = true;
      for (let r = 0; r < 8; r++) {
        if (this.grid[r][c] === null) {
          full = false;
          break;
        }
      }
      if (full) fullCols.push(c);
    }

    const totalLines = fullRows.length + fullCols.length;
    const pieceColorObj = this.theme.palette[colorIndex % this.theme.palette.length];

    if (totalLines > 0) {
      this.comboStreak += 1;
      if (this.comboStreak > this.maxCombo) {
        this.maxCombo = this.comboStreak;
      }
      this.movesSinceLastClear = 0;

      // Clear cells & spawn staggered shatter FX
      const clearedSet = new Set();

      for (const r of fullRows) {
        this.fx.spawnLineBeam(
          gridOriginX,
          gridOriginY + r * cellSize,
          cellSize * 8,
          cellSize,
          pieceColorObj.glow || pieceColorObj.base
        );
        for (let c = 0; c < 8; c++) {
          const key = `${r},${c}`;
          if (!clearedSet.has(key)) {
            clearedSet.add(key);
            const cIdx = this.grid[r][c] ?? colorIndex;
            const cObj = this.theme.palette[cIdx % this.theme.palette.length];
            const cx = gridOriginX + (c + 0.5) * cellSize;
            const cy = gridOriginY + (r + 0.5) * cellSize;
            this.fx.spawnCellShatter(cx, cy, cellSize, cObj, c * 0.016);
            this.grid[r][c] = null;
          }
        }
      }

      for (const c of fullCols) {
        this.fx.spawnLineBeam(
          gridOriginX + c * cellSize,
          gridOriginY,
          cellSize,
          cellSize * 8,
          pieceColorObj.glow || pieceColorObj.base
        );
        for (let r = 0; r < 8; r++) {
          const key = `${r},${c}`;
          if (!clearedSet.has(key)) {
            clearedSet.add(key);
            const cIdx = this.grid[r][c] ?? colorIndex;
            const cObj = this.theme.palette[cIdx % this.theme.palette.length];
            const cx = gridOriginX + (c + 0.5) * cellSize;
            const cy = gridOriginY + (r + 0.5) * cellSize;
            this.fx.spawnCellShatter(cx, cy, cellSize, cObj, r * 0.016);
            this.grid[r][c] = null;
          }
        }
      }

      // Check if the entire 8x8 board is now completely empty ("ALL CLEAR!")
      const isAllClear = this.grid.every((row) => row.every((cell) => cell === null));

      // Authentic Block Blast Line Clear & Combo Multiplier Scoring
      const baseLineScore = 10 * ((totalLines * (totalLines + 1)) / 2);
      const comboBonus = baseLineScore * this.comboStreak;
      const allClearBonus = isAllClear ? 300 : 0;
      movePoints += comboBonus + allClearBonus;

      // Audio & Haptics
      window.soundEngine.playLineClear(totalLines, this.comboStreak, isAllClear);
      if (navigator.vibrate) {
        navigator.vibrate(totalLines >= 2 || this.comboStreak >= 2 ? [25, 35, 45] : 22);
      }

      this.fx.triggerShake(Math.min(14, 4 + totalLines * 2.5 + this.comboStreak * 1.2), 0.26);

      // Floating score popup at placed piece center
      const pieceCenterX = gridOriginX + (startC + shape.cols / 2) * cellSize;
      const pieceCenterY = gridOriginY + (startR + shape.rows / 2) * cellSize;
      this.fx.spawnFloatingScore(
        pieceCenterX,
        pieceCenterY,
        `+${movePoints}`,
        '#ffd43b',
        totalLines >= 2 || this.comboStreak >= 2 ? 1.25 : 1.05
      );

      // Juicy Banner Callout
      if (isAllClear) {
        this.fx.spawnBanner('ЧИСТОЕ ПОЛЕ!', `БОНУС +300 • КОМБО x${this.comboStreak}`, '#51cf66');
      } else if (this.comboStreak >= 2 && totalLines >= 2) {
        const praise = this.getPraiseWord(totalLines + this.comboStreak - 1);
        this.fx.spawnBanner(`КОМБО x${this.comboStreak}!`, `${praise} (${totalLines} ЛИНИИ)`, '#ffd43b');
      } else if (this.comboStreak >= 2) {
        this.fx.spawnBanner(`КОМБО x${this.comboStreak}!`, this.getPraiseWord(this.comboStreak), '#ffd43b');
      } else if (totalLines >= 2) {
        this.fx.spawnBanner(this.getPraiseWord(totalLines), `${totalLines} ЛИНИИ СРАЗУ!`, '#66d9e8');
      }
    } else {
      // No lines cleared on this placement
      window.soundEngine.playPlace(shape.blockCount);
      if (navigator.vibrate) {
        navigator.vibrate(8);
      }

      if (this.comboStreak > 0) {
        this.movesSinceLastClear += 1;
        if (this.movesSinceLastClear >= 3) {
          this.comboStreak = 0;
          this.movesSinceLastClear = 0;
        }
      }
    }

    // Add score & check high score
    this.score += movePoints;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bb_best_score', String(this.bestScore));
    }

    // Bump score animation
    this.scoreEl.classList.remove('bump');
    void this.scoreEl.offsetWidth;
    this.scoreEl.classList.add('bump');
    setTimeout(() => this.scoreEl.classList.remove('bump'), 150);

    // If all 3 pieces in dock are placed, spawn 3 new pieces!
    if (this.tray.every((item) => item.placed)) {
      this.spawnNewTray();
    }

    const anyFits = this.checkPieceFitStates();
    this.updateHUD();
    this.saveGameState();

    if (!anyFits) {
      this.triggerGameOver();
    }
  }

  getPraiseWord(level) {
    if (level <= 1) return 'ХОРОШО!';
    if (level === 2) return 'ОТЛИЧНО!';
    if (level === 3) return 'СУПЕР!';
    if (level === 4) return 'НЕВЕРОЯТНО!';
    return 'ЛЕГЕНДАРНО!';
  }

  triggerGameOver() {
    this.isGameOver = true;
    localStorage.removeItem('bb_saved_state');
    this.fx.triggerShake(8, 0.35);
    window.soundEngine.playGameOver();

    setTimeout(() => {
      document.getElementById('finalScoreValue').textContent = this.score.toLocaleString('ru-RU');
      document.getElementById('finalBestValue').textContent = this.bestScore.toLocaleString('ru-RU');
      document.getElementById('finalComboValue').textContent = `x${this.maxCombo}`;

      const badge = document.getElementById('newRecordBadge');
      if (this.score > 0 && this.score >= this.bestScore) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }

      document.getElementById('gameOverModal').classList.remove('hidden');
    }, 620);
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    try {
      this.update(dt, now);
      this.draw(now);
    } catch (err) {
      console.error(err);
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Smoothly animate displayed score rollup
    if (this.displayedScore < this.score) {
      const diff = this.score - this.displayedScore;
      const step = Math.max(1, Math.ceil(diff * Math.min(1, dt * 14)));
      this.displayedScore = Math.min(this.score, this.displayedScore + step);
      this.scoreEl.textContent = this.displayedScore.toLocaleString('ru-RU');
    }

    // Smooth spawn scale animation for tray pieces
    for (const item of this.tray) {
      if (!item || item.placed) continue;
      if (item.scale < item.targetScale) {
        item.scale = Math.min(item.targetScale, item.scale + dt * 5.5);
      }
    }

    // Smooth drag interpolation
    if (this.drag.active) {
      const { cellSize } = this.metrics;
      const liftY = this.drag.isTouch ? cellSize * 2.45 : cellSize * 0.65;
      const targetX = this.drag.x;
      const targetY = this.drag.y - liftY;
      const lerp = Math.min(1, dt * 26);
      this.drag.visualX += (targetX - this.drag.visualX) * lerp;
      this.drag.visualY += (targetY - this.drag.visualY) * lerp;
      this.drag.visualScale += (1.0 - this.drag.visualScale) * Math.min(1, dt * 18);
    }

    this.fx.update(dt);
  }

  draw(now) {
    const ctx = this.ctx;
    const {
      width,
      height,
      boardSize,
      boardX,
      boardY,
      boardPad,
      cellSize,
      dockY,
      dockHeight,
      dockSlotCenters
    } = this.metrics;

    const theme = this.theme;
    ctx.clearRect(0, 0, width, height);

    ctx.save();

    // Screen Shake offset
    if (this.fx.shakeTime > 0) {
      const sx = (Math.random() - 0.5) * 2 * this.fx.shakeMagnitude;
      const sy = (Math.random() - 0.5) * 2 * this.fx.shakeMagnitude;
      ctx.translate(sx, sy);
    }

    // 1. Board: flat dark panel with thin grid lines (original Block Blast look)
    ctx.save();
    window.roundRectPath(ctx, boardX, boardY, boardSize, boardSize, 4);
    ctx.fillStyle = theme.boardBg;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.boardBorder;
    ctx.stroke();
    ctx.restore();

    const gridOriginX = boardX + boardPad;
    const gridOriginY = boardY + boardPad;

    // 2. Grid lines
    ctx.save();
    ctx.strokeStyle = theme.cellEmptyBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 8; i++) {
      const gx = Math.round(gridOriginX + i * cellSize) + 0.5;
      const gy = Math.round(gridOriginY + i * cellSize) + 0.5;
      ctx.moveTo(gx, gridOriginY);
      ctx.lineTo(gx, gridOriginY + cellSize * 8);
      ctx.moveTo(gridOriginX, gy);
      ctx.lineTo(gridOriginX + cellSize * 8, gy);
    }
    ctx.stroke();
    ctx.restore();

    // Pulse factor for lines that are about to clear while holding a piece
    const previewPulse = 0.5 + 0.5 * Math.sin(now * 0.014);
    const previewRowSet = new Set(this.drag.previewRows);
    const previewColSet = new Set(this.drag.previewCols);

    // 3. Draw Ghost Preview of Dragged Piece on the Grid
    if (this.drag.active && this.drag.validSnap && this.drag.piece) {
      const { shape, colorIndex } = this.drag.piece;
      const colorObj = theme.palette[colorIndex % theme.palette.length];
      for (const cell of shape.cells) {
        const gr = this.drag.snapR + cell.r;
        const gc = this.drag.snapC + cell.c;
        const cx = gridOriginX + gc * cellSize;
        const cy = gridOriginY + gr * cellSize;
        const willClear = previewRowSet.has(gr) || previewColSet.has(gc);
        window.drawStyledBlock(ctx, cx, cy, cellSize, colorObj, this.themeId, {
          alpha: willClear ? 0.85 : 0.45,
          pulse: willClear ? previewPulse : 0,
          isGhost: true
        });
      }
    }

    // 4. Draw Placed Blocks on the 8x8 Grid
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const colorIndex = this.grid[r][c];
        if (colorIndex === null) continue;

        const cx = gridOriginX + c * cellSize;
        const cy = gridOriginY + r * cellSize;
        const willClear = previewRowSet.has(r) || previewColSet.has(c);

        // When hovering a piece that will clear this line, tint the line in the dragged piece's color just like Block Blast!
        const activeColorIdx =
          willClear && this.drag.piece ? this.drag.piece.colorIndex : colorIndex;
        const colorObj = theme.palette[activeColorIdx % theme.palette.length];

        window.drawStyledBlock(ctx, cx, cy, cellSize, colorObj, this.themeId, {
          alpha: this.isGameOver ? 0.55 : 1,
          pulse: willClear ? previewPulse : 0
        });
      }
    }

    // 5. Dock has no container in the original — pieces sit on the background

    // 6. Draw Dock Pieces
    for (let i = 0; i < 3; i++) {
      const item = this.tray[i];
      if (!item || item.placed) continue;
      if (this.drag.active && this.drag.slotIndex === i) continue;

      const center = dockSlotCenters[i];
      const shape = item.shape;
      const colorObj = theme.palette[item.colorIndex % theme.palette.length];

      // Scale piece so even 5-long bars and 3x3 squares fit neatly inside their dock slot
      const maxDim = Math.max(shape.rows, shape.cols);
      const baseDockScale = maxDim >= 5 ? 0.5 : maxDim === 4 ? 0.56 : 0.6;
      const dCellSize = cellSize * baseDockScale * item.scale;

      const pW = shape.cols * dCellSize;
      const pH = shape.rows * dCellSize;
      const startX = center.x - pW / 2;
      const startY = center.y - pH / 2;

      const alpha = item.canFit === false ? 0.36 : 1;

      for (const cell of shape.cells) {
        window.drawStyledBlock(
          ctx,
          startX + cell.c * dCellSize,
          startY + cell.r * dCellSize,
          dCellSize,
          colorObj,
          this.themeId,
          { alpha }
        );
      }
    }

    // 7. Draw Currently Dragged Piece (Floating Under Finger with Drop Shadow)
    if (this.drag.active && this.drag.piece) {
      const { shape, colorIndex } = this.drag.piece;
      const colorObj = theme.palette[colorIndex % theme.palette.length];
      const dSize = cellSize * this.drag.visualScale;
      const pW = shape.cols * dSize;
      const pH = shape.rows * dSize;
      const startX = this.drag.visualX - pW / 2;
      const startY = this.drag.visualY - pH / 2;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 10;

      for (const cell of shape.cells) {
        window.drawStyledBlock(
          ctx,
          startX + cell.c * dSize,
          startY + cell.r * dSize,
          dSize,
          colorObj,
          this.themeId,
          { alpha: 0.96 }
        );
      }
      ctx.restore();
    }

    // 8. Draw Particle Explosions, Shattering Cubes & Combo Banners
    this.fx.draw(ctx, width, boardY + boardSize * 0.46, this.themeId);

    ctx.restore();
  }

  renderThemeModalList() {
    const listEl = document.getElementById('themeList');
    if (!listEl) return;
    listEl.innerHTML = '';

    Object.values(window.THEMES).forEach((t) => {
      const card = document.createElement('div');
      card.className = `theme-item ${t.id === this.themeId ? 'active' : ''}`;

      const swatchesHtml = t.palette
        .slice(0, 5)
        .map((c) => `<span class="theme-swatch" style="background:${c.base}"></span>`)
        .join('');

      card.innerHTML = `
        <div class="theme-info">
          <div class="theme-title">${t.name}</div>
          <div class="theme-sub">${t.subtitle}</div>
        </div>
        <div class="theme-swatches">${swatchesHtml}</div>
      `;

      card.addEventListener('click', () => {
        window.soundEngine.playPickup();
        this.applyTheme(t.id);
      });

      listEl.appendChild(card);
    });
  }

  generateClientQrSvg(text) {
    try {
      const bytes = Array.from(new TextEncoder().encode(text));
      const VERSIONS = [
        null,
        { v: 1, size: 21, dataBytes: 19, ecBytes: 7, align: [] },
        { v: 2, size: 25, dataBytes: 34, ecBytes: 10, align: [6, 18] },
        { v: 3, size: 29, dataBytes: 55, ecBytes: 15, align: [6, 22] },
        { v: 4, size: 33, dataBytes: 80, ecBytes: 20, align: [6, 26] }
      ];
      let ver = VERSIONS[4];
      for (let v = 1; v <= 4; v++) {
        if (bytes.length + 2 <= VERSIONS[v].dataBytes) {
          ver = VERSIONS[v];
          break;
        }
      }
      if (bytes.length + 2 > ver.dataBytes) return null;

      const bits = [];
      const pushBits = (val, len) => {
        for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
      };
      pushBits(0b0100, 4);
      pushBits(bytes.length, 8);
      for (const b of bytes) pushBits(b, 8);
      const maxBits = ver.dataBytes * 8;
      for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
      while (bits.length % 8 !== 0) bits.push(0);

      const data = [];
      for (let i = 0; i < bits.length; i += 8) {
        let b = 0;
        for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
        data.push(b);
      }
      const pads = [0xec, 0x11];
      let padIdx = 0;
      while (data.length < ver.dataBytes) {
        data.push(pads[padIdx % 2]);
        padIdx++;
      }

      const exp = new Uint8Array(512);
      const log = new Uint8Array(256);
      let x = 1;
      for (let i = 0; i < 255; i++) {
        exp[i] = x;
        log[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
      }
      for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
      const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : exp[log[a] + log[b]]);

      let gen = [1];
      for (let i = 0; i < ver.ecBytes; i++) {
        const next = new Array(gen.length + 1).fill(0);
        for (let j = 0; j < gen.length; j++) {
          next[j] ^= gen[j];
          next[j + 1] ^= gfMul(gen[j], exp[i]);
        }
        gen = next;
      }

      const msg = new Uint8Array(ver.dataBytes + ver.ecBytes);
      msg.set(data, 0);
      for (let i = 0; i < ver.dataBytes; i++) {
        const coef = msg[i];
        if (coef !== 0) {
          for (let j = 0; j < gen.length; j++) {
            msg[i + j] ^= gfMul(gen[j], coef);
          }
        }
      }
      const codewords = [...data, ...msg.slice(ver.dataBytes)];
      const N = ver.size;
      const grid = Array.from({ length: N }, () => Array(N).fill(null));
      const reserved = Array.from({ length: N }, () => Array(N).fill(false));

      const placeFinder = (r0, c0) => {
        for (let r = -1; r <= 7; r++) {
          for (let c = -1; c <= 7; c++) {
            const rr = r0 + r;
            const cc = c0 + c;
            if (rr < 0 || rr >= N || cc < 0 || cc >= N) continue;
            const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6);
            const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            grid[rr][cc] = inOuter || inInner ? 1 : 0;
            reserved[rr][cc] = true;
          }
        }
      };
      placeFinder(0, 0);
      placeFinder(0, N - 7);
      placeFinder(N - 7, 0);

      if (ver.align.length > 0) {
        const c0 = ver.align[1];
        const r0 = ver.align[1];
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            grid[r0 + r][c0 + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1 ? 1 : 0;
            reserved[r0 + r][c0 + c] = true;
          }
        }
      }

      for (let i = 8; i < N - 8; i++) {
        grid[6][i] = i % 2 === 0 ? 1 : 0;
        reserved[6][i] = true;
        grid[i][6] = i % 2 === 0 ? 1 : 0;
        reserved[i][6] = true;
      }

      for (let i = 0; i < 9; i++) {
        if (i < N) {
          reserved[8][i] = true;
          reserved[i][8] = true;
        }
      }
      for (let i = 0; i < 8; i++) {
        reserved[8][N - 1 - i] = true;
        reserved[N - 1 - i][8] = true;
      }
      grid[N - 8][8] = 1;
      reserved[N - 8][8] = true;

      const allBits = [];
      for (const cw of codewords) {
        for (let b = 7; b >= 0; b--) allBits.push((cw >> b) & 1);
      }
      let bitIdx = 0;
      let upward = true;
      for (let col = N - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        for (let step = 0; step < N; step++) {
          const r = upward ? N - 1 - step : step;
          for (let dc = 0; dc < 2; dc++) {
            const c = col - dc;
            if (!reserved[r][c]) {
              const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
              grid[r][c] = bit ^ ((r + c) % 2 === 0 ? 1 : 0);
            }
          }
        }
        upward = !upward;
      }

      const fmt = 0x77c4;
      const fmtBits = [];
      for (let i = 0; i < 15; i++) fmtBits.push((fmt >> i) & 1);
      const fCoords1 = [
        [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
        [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
      ];
      fCoords1.forEach(([r, c], idx) => { grid[r][c] = fmtBits[14 - idx]; });
      for (let i = 0; i < 7; i++) grid[N - 1 - i][8] = fmtBits[14 - i];
      for (let i = 7; i < 15; i++) grid[8][N - 15 + i] = fmtBits[14 - i];

      let rects = '';
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (grid[r][c]) {
            rects += `<rect x="${c + 2}" y="${r + 2}" width="1" height="1" fill="#141d4b"/>`;
          }
        }
      }
      const viewSize = N + 4;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges"><rect width="${viewSize}" height="${viewSize}" fill="#ffffff"/>${rects}</svg>`;
    } catch (e) {
      return null;
    }
  }

  async openIphoneModal() {
    const modal = document.getElementById('iphoneModal');
    const qrBox = document.getElementById('qrContainer');
    const urlBox = document.getElementById('lanUrlBox');
    modal.classList.remove('hidden');

    let targetUrl = window.location.href;
    let qrSvg = this.generateClientQrSvg(targetUrl);
    let endpoints = [];

    try {
      const res = await fetch('/api/lan-info');
      if (res.ok) {
        const info = await res.json();
        if (info.url) targetUrl = info.url;
        if (info.qrSvg) qrSvg = info.qrSvg;
        if (Array.isArray(info.endpoints)) endpoints = info.endpoints;
      }
    } catch (e) {}

    const renderEndpoint = (ep) => {
      urlBox.innerHTML = '';
      const mainLink = document.createElement('div');
      mainLink.textContent = ep.url;
      urlBox.appendChild(mainLink);

      if (endpoints.length > 1) {
        const switcher = document.createElement('div');
        switcher.style.marginTop = '6px';
        switcher.style.display = 'flex';
        switcher.style.gap = '6px';
        switcher.style.justifyContent = 'center';
        switcher.style.flexWrap = 'wrap';
        endpoints.forEach((cand) => {
          const btn = document.createElement('button');
          btn.textContent = cand.ip;
          btn.style.padding = '3px 8px';
          btn.style.fontSize = '0.75rem';
          btn.style.borderRadius = '6px';
          btn.style.border = cand.url === ep.url ? '1px solid #ffd43b' : '1px solid rgba(255,255,255,0.25)';
          btn.style.background = cand.url === ep.url ? 'rgba(255,212,59,0.2)' : 'rgba(255,255,255,0.08)';
          btn.style.color = '#fff';
          btn.style.cursor = 'pointer';
          btn.addEventListener('click', () => renderEndpoint(cand));
          switcher.appendChild(btn);
        });
        urlBox.appendChild(switcher);
      }

      if (ep.qrSvg) {
        qrBox.innerHTML = ep.qrSvg;
      } else {
        qrBox.innerHTML = `<div class="qr-loading">Откройте <strong>${ep.url}</strong> в Safari на вашем iPhone</div>`;
      }
    };

    if (endpoints.length > 0) {
      renderEndpoint(endpoints[0]);
    } else {
      renderEndpoint({ url: targetUrl, qrSvg });
    }
  }
}

// Register Service Worker for offline iPhone Home Screen play
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (/[?&]play\b/.test(window.location.search)) {
    document.getElementById('startScreen').classList.add('hidden');
  }
  window.game = new BlockBlastGame();
});
