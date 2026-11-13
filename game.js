// Core 8x8 Game Engine, Touch Controller & Renderer for Block Blast!

const UI_ICONS = {
  trophy: '<svg class="inline-svg trophy-inline" viewBox="0 0 24 24" aria-hidden="true"><path fill="#ffd43b" stroke="rgba(0,0,0,0.22)" stroke-width="0.9" d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1c1.78-.37 3.22-1.63 3.61-3.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>',
  check: '<svg class="inline-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  medal(rank) {
    const palettes = {
      1: { outer: '#ffd43b', inner: '#f59f00', text: '#5c3b00', ribbonL: '#3b82f6', ribbonR: '#ef4444' },
      2: { outer: '#e2e8f0', inner: '#94a3b8', text: '#1e293b', ribbonL: '#3b82f6', ribbonR: '#ef4444' },
      3: { outer: '#f4a261', inner: '#c26d27', text: '#421e04', ribbonL: '#3b82f6', ribbonR: '#ef4444' }
    };
    const p = palettes[rank];
    if (!p) return '';
    return `<svg class="lb-medal-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="${p.ribbonL}" d="M7 2h4l1 6H8.5z"/><path fill="${p.ribbonR}" d="M13 2h4l-1.5 6H12z"/><circle cx="12" cy="14.5" r="7" fill="${p.outer}" stroke="${p.inner}" stroke-width="1.6"/><circle cx="12" cy="14.5" r="4.6" fill="${p.inner}" opacity="0.28"/><text x="12" y="17.3" text-anchor="middle" font-size="8.5" font-weight="900" font-family="Nunito, sans-serif" fill="${p.text}">${rank}</text></svg>`;
  }
};

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
    this.autoPalette = localStorage.getItem('bb_auto_palette') !== '0';
    this.activeThemeState = null;

    this.bestScore = parseInt(localStorage.getItem('bb_best_score') || '0', 10) || 0;
    this.initialBestScore = this.bestScore;

    // Game State
    this.grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.tray = [];
    this.score = 0;
    this.displayedScore = 0;
    this.comboStreak = 0;
    this.maxCombo = 1;
    this.movesCount = 0;
    this.revivesUsed = 0;
    this.movesSinceDot = 99;
    this.postReviveMoves = 99;
    this.movesSinceLastClear = 0; // In Block Blast, combo stays alive for up to 3 placements
    this.isGameOver = false;
    this.hasCountedGamePlayed = false;
    this.currentDynPalette = '';

    // Persistent circular palette progression (never resets on new game, cycles endlessly)
    this.paletteIndex = parseInt(localStorage.getItem('bb_palette_idx') || '0', 10) || 0;
    this.paletteProgress = parseInt(localStorage.getItem('bb_palette_pts') || '0', 10) || 0;

    // Intro Board Fill & Disassemble Animation State
    this.introAnim = {
      active: false,
      elapsed: 0,
      isHeart: false,
      cells: [],
      shattered: false,
      lastSoundTime: 0,
      onComplete: null
    };

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

    this.applyTheme(this.themeId, true);
    this.bindEvents();
    this.initStartPieceShowcase();
    this.resize();

    if (!this.loadSavedGame()) {
      this.startNewGame(true);
    } else {
      this.updateHUD(true);
    }

    if (window.leaderboardManager) {
      window.leaderboardManager.recordLocalProgress(this.bestScore, this.maxCombo || 1, 0);
      if (this.bestScore > 0) {
        window.leaderboardManager.syncScore({
          bestScore: this.bestScore,
          maxCombo: this.maxCombo || 1
        }).then(() => this.updateHUD());
      }
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  get theme() {
    return this.activeThemeState || window.THEMES[this.themeId] || window.THEMES.classic;
  }

  initStartPieceShowcase() {
    const stage = document.getElementById('startPieceStage');
    const pieceEl = document.getElementById('startPiece');
    const shadowEl = document.getElementById('startPieceShadow');
    const startScreen = document.getElementById('startScreen');
    if (!stage || !pieceEl) return;

    const showcase = [
      { cols: 3, rows: 2, cells: [1, 1, 0, 0, 1, 1] },
      { cols: 3, rows: 2, cells: [0, 1, 0, 1, 1, 1] },
      { cols: 2, rows: 2, cells: [1, 1, 1, 1] },
      { cols: 3, rows: 2, cells: [1, 0, 0, 1, 1, 1] },
      { cols: 4, rows: 1, cells: [1, 1, 1, 1] },
      { cols: 3, rows: 3, cells: [1, 0, 0, 1, 0, 0, 1, 1, 1] },
      { cols: 3, rows: 2, cells: [0, 1, 1, 1, 1, 0] }
    ];

    let idx = 0;
    let isTransitioning = false;
    let outTimer = null;
    let inTimer = null;
    let inRaf = null;

    const isStartVisible = () => Boolean(!document.hidden && startScreen && !startScreen.classList.contains('hidden'));
    const prefersReducedMotion = () =>
      Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const clearShowcaseTimers = () => {
      clearTimeout(outTimer);
      clearTimeout(inTimer);
      outTimer = null;
      inTimer = null;
      if (inRaf !== null) {
        cancelAnimationFrame(inRaf);
        inRaf = null;
      }
    };

    const applyShowcaseColor = (pieceIdx) => {
      const classicTheme = (window.THEMES && window.THEMES.classic) || {};
      const palette = (classicTheme.palette && classicTheme.palette.length > 0)
        ? classicTheme.palette
        : [];
      if (palette.length === 0) return;
      const color = palette[pieceIdx % palette.length];
      pieceEl.dataset.style = classicTheme.styleType || 'bevel3d';
      pieceEl.style.setProperty('--pc-base', color.base);
      pieceEl.style.setProperty('--pc-top', color.top);
      pieceEl.style.setProperty('--pc-left', color.left);
      pieceEl.style.setProperty('--pc-right', color.right);
      pieceEl.style.setProperty('--pc-bottom', color.bottom);
      pieceEl.style.setProperty('--pc-inner', color.inner || color.base);
      pieceEl.style.setProperty('--pc-glow', color.glow || color.top || color.base);
    };

    this.syncStartPieceTheme = () => {
      applyShowcaseColor(idx);
    };
    this.syncStartPieceTheme();

    const pauseShowcase = () => {
      clearShowcaseTimers();
      stage.classList.remove('is-swapping');
      pieceEl.classList.remove('is-swapping-out', 'is-swapping-prep', 'is-swapping-in');
      isTransitioning = false;
    };

    const swapToNext = () => {
      if (!isStartVisible()) {
        pauseShowcase();
        return;
      }
      if (isTransitioning) return;
      isTransitioning = true;
      clearShowcaseTimers();

      idx = (idx + 1) % showcase.length;
      const item = showcase[idx];

      stage.classList.add('is-swapping');
      pieceEl.classList.remove('is-swapping-in', 'is-swapping-prep');
      pieceEl.classList.add('is-swapping-out');

      outTimer = setTimeout(() => {
        outTimer = null;
        if (!isStartVisible()) {
          pauseShowcase();
          return;
        }

        pieceEl.classList.add('is-swapping-prep');
        pieceEl.classList.remove('is-swapping-out');

        pieceEl.style.gridTemplateColumns = `repeat(${item.cols}, 28px)`;
        pieceEl.style.gridTemplateRows = `repeat(${item.rows}, 28px)`;
        applyShowcaseColor(idx);

        const frag = document.createDocumentFragment();
        item.cells.forEach((filled) => {
          frag.appendChild(document.createElement(filled ? 'i' : 'b'));
        });
        pieceEl.textContent = '';
        pieceEl.appendChild(frag);

        if (shadowEl) {
          const shadowScale = ((item.cols * 28 + 4) / 112).toFixed(3);
          stage.style.setProperty('--shadow-scale', shadowScale);
        }

        inRaf = requestAnimationFrame(() => {
          inRaf = null;
          if (!isStartVisible()) {
            pauseShowcase();
            return;
          }
          pieceEl.classList.remove('is-swapping-prep');
          stage.classList.remove('is-swapping');
          pieceEl.classList.add('is-swapping-in');

          inTimer = setTimeout(() => {
            inTimer = null;
            pieceEl.classList.remove('is-swapping-in');
            isTransitioning = false;
          }, 430);
        });
      }, prefersReducedMotion() ? 20 : 230);
    };

    stage.addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.playHoverTick();
      swapToNext();
    });

    this.pauseStartShowcase = pauseShowcase;
    this.resumeStartShowcase = () => {};
  }

  /**
   * Extracts the bottom-most color stop from a CSS gradient string for seamless iOS root fill.
   */
  getSurfaceBottomColor(surface) {
    const grad = surface && surface.bgGradient ? surface.bgGradient : '';
    const matches = grad.match(/#[0-9a-fA-F]{3,8}/g);
    if (matches && matches.length > 0) return matches[matches.length - 1];
    return (surface && surface.themeColor) || '#3f5aa5';
  }

  isOnStartScreen() {
    const startScreen = document.getElementById('startScreen');
    return Boolean(startScreen && !startScreen.classList.contains('hidden'));
  }

  /**
   * Aligns document root background, body state, and meta theme-color with classic blue on the
   * Start Screen and with the active theme during gameplay so iOS PWA safe-area edges match seamlessly.
   */
  syncRootSurfaceColor(instant = true) {
    const onStartScreen = this.isOnStartScreen();
    document.body.classList.toggle('on-start-screen', onStartScreen);

    const classicSurface = window.THEMES && window.THEMES.classic;
    const surface = onStartScreen
      ? (classicSurface || this.theme)
      : (this.lastVisualSurface || this.theme);
    const rootBg = this.getSurfaceBottomColor(surface);
    const isStandalone =
      window.navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    const metaColor = isStandalone ? rootBg : ((surface && surface.themeColor) || rootBg);

    document.documentElement.style.transition = instant ? 'none' : 'background-color 0.85s ease-in-out';
    document.documentElement.style.backgroundColor = rootBg;
    const metaTheme = document.getElementById('metaThemeColor');
    if (metaTheme) metaTheme.setAttribute('content', metaColor);
  }

  /**
   * Applies background gradients, CSS modal/surface variables, and meta theme color smoothly or instantly.
   * Keeps the start menu locked to classic blue and smoothly transitions to the active theme on launch.
   */
  applyVisualSurface(surface, instant = false) {
    this.lastVisualSurface = surface;
    const onStartScreen = this.isOnStartScreen();
    const classicSurface = window.THEMES && window.THEMES.classic;
    const displaySurface = onStartScreen ? (classicSurface || surface) : surface;

    const crossfadeEl = document.getElementById('bgCrossfade');
    if (crossfadeEl && !instant && !onStartScreen) {
      clearTimeout(this._crossfadeTimeout);
      crossfadeEl.style.transition = 'none';
      crossfadeEl.style.opacity = '0';
      crossfadeEl.style.background = displaySurface.bgGradient;
      void crossfadeEl.offsetWidth;
      crossfadeEl.style.transition = '';
      crossfadeEl.style.opacity = '1';
      this._crossfadeTimeout = setTimeout(() => {
        document.documentElement.style.setProperty('--bg-gradient', displaySurface.bgGradient);
        crossfadeEl.style.opacity = '0';
      }, 860);
    } else {
      clearTimeout(this._crossfadeTimeout);
      if (crossfadeEl) crossfadeEl.style.opacity = '0';
      document.documentElement.style.setProperty('--bg-gradient', displaySurface.bgGradient);
    }

    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--board-bg', displaySurface.boardBg);
    rootStyle.setProperty('--board-border', displaySurface.boardBorder);
    rootStyle.setProperty('--text-accent', displaySurface.textAccent || '#ffc633');
    if (displaySurface.modalBg) rootStyle.setProperty('--modal-bg', displaySurface.modalBg);
    if (displaySurface.modalRow) rootStyle.setProperty('--modal-row', displaySurface.modalRow);
    if (displaySurface.modalShadow) rootStyle.setProperty('--modal-shadow', displaySurface.modalShadow);
    if (displaySurface.diamondBg) rootStyle.setProperty('--diamond-bg', displaySurface.diamondBg);
    if (displaySurface.diamondShadow) rootStyle.setProperty('--diamond-shadow', displaySurface.diamondShadow);
    rootStyle.setProperty('--start-block-bg', displaySurface.startBlockBg || 'rgba(255, 255, 255, 0.09)');
    rootStyle.setProperty('--start-block-border', displaySurface.startBlockBorder || 'rgba(255, 255, 255, 0.15)');
    rootStyle.setProperty('--start-block-highlight', displaySurface.startBlockHighlight || 'rgba(255, 255, 255, 0.2)');
    rootStyle.setProperty('--start-shadow-color', displaySurface.startShadowColor || 'rgba(7, 18, 56, 0.44)');
    rootStyle.setProperty('--start-shadow-mid', displaySurface.startShadowMid || 'rgba(7, 18, 56, 0.16)');

    if (this.syncStartPieceTheme) this.syncStartPieceTheme();
    this.syncRootSurfaceColor(instant || onStartScreen);
  }

  applyTheme(themeId, instant = false) {
    const base = window.THEMES[themeId];
    if (!base) return;

    this.themeId = themeId;
    localStorage.setItem('bb_theme', themeId);

    // Clone base theme so window.THEMES stays uncorrupted and spotless
    this.activeThemeState = {
      ...base,
      palette: base.palette.map((c) => ({ ...c }))
    };

    if (base.supportsAutoPalette && this.autoPalette) {
      this.applyPaletteIndex(this.paletteIndex, instant);
    } else {
      this.applyVisualSurface(this.activeThemeState, instant);
    }

    this.renderThemeModalList();
    this.updateHUD();
  }

  applyPaletteIndex(index, instant = false) {
    if (!window.DYNAMIC_PALETTES || window.DYNAMIC_PALETTES.length === 0) return;
    const len = window.DYNAMIC_PALETTES.length;
    this.paletteIndex = ((index % len) + len) % len;
    localStorage.setItem('bb_palette_idx', String(this.paletteIndex));

    const dyn = window.DYNAMIC_PALETTES[this.paletteIndex];
    if (!dyn) return;

    const base = window.THEMES[this.themeId] || window.THEMES.classic;
    if (!base.supportsAutoPalette || !this.autoPalette) return;

    this.currentDynPalette = dyn.name;

    if (!this.activeThemeState) {
      this.activeThemeState = { ...base, palette: base.palette.map((c) => ({ ...c })) };
    }

    this.activeThemeState.bgGradient = dyn.bgGradient;
    this.activeThemeState.themeColor = dyn.themeColor;
    this.activeThemeState.boardBg = dyn.boardBg;
    this.activeThemeState.boardBorder = dyn.boardBorder;
    this.activeThemeState.cellEmpty = dyn.cellEmpty;
    this.activeThemeState.cellEmptyBorder = dyn.cellEmptyBorder;
    this.activeThemeState.palette = dyn.palette;
    this.activeThemeState.modalBg = dyn.modalBg || dyn.boardBg;
    this.activeThemeState.modalRow = dyn.modalRow || dyn.cellEmpty;
    this.activeThemeState.modalShadow = dyn.modalShadow || dyn.boardBorder;
    this.activeThemeState.diamondBg = dyn.diamondBg || base.diamondBg;
    this.activeThemeState.diamondShadow = dyn.diamondShadow || base.diamondShadow;
    this.activeThemeState.startBlockBg = dyn.startBlockBg || base.startBlockBg;
    this.activeThemeState.startBlockBorder = dyn.startBlockBorder || base.startBlockBorder;
    this.activeThemeState.startBlockHighlight = dyn.startBlockHighlight || base.startBlockHighlight;
    this.activeThemeState.startShadowColor = dyn.startShadowColor || base.startShadowColor;
    this.activeThemeState.startShadowMid = dyn.startShadowMid || base.startShadowMid;

    this.applyVisualSurface(this.activeThemeState, instant);
  }

  startNewGame(runIntro = false, animateTheme = false) {
    this.grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.score = 0;
    this.displayedScore = 0;
    this.comboStreak = 0;
    this.maxCombo = 1;
    this.movesCount = 0;
    this.revivesUsed = 0;
    this.movesSinceDot = 99;
    this.postReviveMoves = 99;
    this.initialBestScore = this.bestScore;
    this.movesSinceLastClear = 0;
    this.isGameOver = false;
    this.drag.active = false;
    this.hasCountedGamePlayed = false;

    this.applyTheme(this.themeId, !animateTheme);

    this.updateHUD(true);
    document.getElementById('gameOverModal').classList.add('hidden');

    if (runIntro) {
      this.tray = []; // dock stays empty while intro fills and reveals board
      localStorage.removeItem('bb_saved_state');
      this.startIntroAnimation(() => {
        // Target grid is already populated cleanly at intro end; deal opening hand with spring reveal
        this.isStartingHand = true;
        this.spawnNewTray();
        this.saveGameState();
      });
    } else {
      // Direct start without intro
      this.seedRandomStartingBlocks();
      this.isStartingHand = true;
      this.spawnNewTray();
      this.saveGameState();
    }

    if (window.questManager) {
      window.questManager.updateUIBadge();
    }
  }

  startIntroAnimation(onComplete) {
    // Guarantees heart on first run, then 60% chance so players regularly see varied heart styles
    const sawHeart = localStorage.getItem('bb_saw_heart');
    const isHeart = !sawHeart || Math.random() < 0.60;
    localStorage.setItem('bb_saw_heart', '1');

    const palette = (this.theme && this.theme.palette) || window.THEMES.classic.palette;
    const targetGrid = typeof window.generateStartingBoard === 'function'
      ? window.generateStartingBoard(palette.length)
      : Array.from({ length: 8 }, () => Array(8).fill(null));

    const targetCells = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const val = targetGrid[r][c];
        if (val !== null) {
          const dist = Math.hypot(r - 3.5, c - 3.5);
          targetCells.push({
            r,
            c,
            colorObj: palette[val % palette.length],
            delay: dist * 0.042,
            scale: 0,
            soundPlayed: false
          });
        }
      }
    }

    const cells = [];

    if (isHeart) {
      // 8x8 Heart coordinates
      const heartCoords = [
        [1, 1], [1, 2], [1, 5], [1, 6],
        [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
        [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
        [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
        [5, 2], [5, 3], [5, 4], [5, 5],
        [6, 3], [6, 4]
      ];

      const heartThemes = [
        // 1. Classic Passion (Crimson, Ruby & Rose)
        [
          { id: 'rose',    base: '#ff6b8b', top: '#ffa3b5', left: '#ff859f', right: '#e0486a', bottom: '#bf284c', inner: '#ff6b8b', glow: '#ffb3c1' },
          { id: 'ruby',    base: '#e11d48', top: '#fb7185', left: '#f43f5e', right: '#be123c', bottom: '#9f1239', inner: '#e11d48', glow: '#ffe4e6' },
          { id: 'pink',    base: '#f43f5e', top: '#fda4af', left: '#fb7185', right: '#e11d48', bottom: '#be123c', inner: '#f43f5e', glow: '#fecdd3' },
          { id: 'magenta', base: '#d63384', top: '#f06595', left: '#e64980', right: '#a61e4d', bottom: '#86153d', inner: '#d63384', glow: '#fcc2d7' },
          { id: 'gold',    base: '#ffd43b', top: '#ffe066', left: '#fcc419', right: '#e67700', bottom: '#b85d00', inner: '#ffd43b', glow: '#fff3bf' }
        ],
        // 2. Rainbow Prism (Яркая радуга)
        [
          { id: 'r_red',    base: '#ef4444', top: '#fca5a5', left: '#f87171', right: '#dc2626', bottom: '#991b1b', inner: '#ef4444', glow: '#fecaca' },
          { id: 'r_orange', base: '#f97316', top: '#fdba74', left: '#fb923c', right: '#ea580c', bottom: '#9a3412', inner: '#f97316', glow: '#fed7aa' },
          { id: 'r_yellow', base: '#eab308', top: '#fef08a', left: '#facc15', right: '#ca8a04', bottom: '#854d0e', inner: '#eab308', glow: '#fef9c3' },
          { id: 'r_green',  base: '#22c55e', top: '#86efac', left: '#4ade80', right: '#16a34a', bottom: '#166534', inner: '#22c55e', glow: '#bbf7d0' },
          { id: 'r_sky',    base: '#06b6d4', top: '#a5f3fc', left: '#22d3ee', right: '#0891b2', bottom: '#155e75', inner: '#06b6d4', glow: '#cffafe' },
          { id: 'r_violet', base: '#8b5cf6', top: '#c4b5fd', left: '#a78bfa', right: '#7c3aed', bottom: '#5b21b6', inner: '#8b5cf6', glow: '#ddd6fe' }
        ],
        // 3. Icy Sapphire (Ледяной сапфир и бирюза)
        [
          { id: 'ice_deep', base: '#1d4ed8', top: '#60a5fa', left: '#3b82f6', right: '#1e40af', bottom: '#1e3a8a', inner: '#1d4ed8', glow: '#93c5fd' },
          { id: 'ice_blue', base: '#0284c7', top: '#7dd3fc', left: '#38bdf8', right: '#0369a1', bottom: '#0c4a6e', inner: '#0284c7', glow: '#bae6fd' },
          { id: 'ice_cyan', base: '#06b6d4', top: '#a5f3fc', left: '#22d3ee', right: '#0891b2', bottom: '#164e63', inner: '#06b6d4', glow: '#cffafe' },
          { id: 'ice_mint', base: '#2dd4bf', top: '#99f6e4', left: '#5eead4', right: '#0d9488', bottom: '#115e59', inner: '#2dd4bf', glow: '#ccfbf1' },
          { id: 'ice_glac', base: '#e0f2fe', top: '#ffffff', left: '#bae6fd', right: '#7dd3fc', bottom: '#38bdf8', inner: '#e0f2fe', glow: '#ffffff' }
        ],
        // 4. Neon Synthwave (Киберпанк неон)
        [
          { id: 'neo_vio',  base: '#7950f2', top: '#b197fc', left: '#845ef7', right: '#5f3dc4', bottom: '#3b2185', inner: '#7950f2', glow: '#d0bfff' },
          { id: 'neo_mag',  base: '#e64980', top: '#faa2c1', left: '#f06595', right: '#c2255c', bottom: '#86153d', inner: '#e64980', glow: '#ffdeeb' },
          { id: 'neo_pink', base: '#f03e3e', top: '#ffa8a8', left: '#ff6b6b', right: '#c92a2a', bottom: '#871616', inner: '#f03e3e', glow: '#ffc9c9' },
          { id: 'neo_cyan', base: '#15aabf', top: '#99e9f2', left: '#22b8cf', right: '#0c8599', bottom: '#0b5361', inner: '#15aabf', glow: '#c5f6fa' }
        ],
        // 5. Royal Emerald & Gold (Золото и Изумруд)
        [
          { id: 'em_dark', base: '#059669', top: '#6ee7b7', left: '#10b981', right: '#047857', bottom: '#064e3b', inner: '#059669', glow: '#a7f3d0' },
          { id: 'em_lime', base: '#65a30d', top: '#bef264', left: '#84cc16', right: '#4d7c0f', bottom: '#365314', inner: '#65a30d', glow: '#d9f99d' },
          { id: 'em_gold', base: '#f59f00', top: '#ffe066', left: '#fcc419', right: '#d97706', bottom: '#92400e', inner: '#f59f00', glow: '#fef08a' },
          { id: 'em_jade', base: '#14b8a6', top: '#99f6e4', left: '#2dd4bf', right: '#0f766e', bottom: '#134e4a', inner: '#14b8a6', glow: '#ccfbf1' }
        ],
        // 6. Sunset Citrus (Закатный градиент: алый -> оранж -> жёлтый -> пурпур)
        [
          { id: 'sun_purp', base: '#9333ea', top: '#d8b4fe', left: '#a855f7', right: '#7e22ce', bottom: '#581c87', inner: '#9333ea', glow: '#e9d5ff' },
          { id: 'sun_rose', base: '#e11d48', top: '#fda4af', left: '#f43f5e', right: '#be123c', bottom: '#881337', inner: '#e11d48', glow: '#fecdd3' },
          { id: 'sun_orng', base: '#ea580c', top: '#fdba74', left: '#fb923c', right: '#c2410c', bottom: '#7c2d12', inner: '#ea580c', glow: '#fed7aa' },
          { id: 'sun_gold', base: '#f59e0b', top: '#fde68a', left: '#fbbf24', right: '#d97706', bottom: '#92400e', inner: '#f59e0b', glow: '#fef3c7' }
        ]
      ];

      // Pick a theme different from the previous run
      let themeIdx = Math.floor(Math.random() * heartThemes.length);
      if (this.lastHeartThemeIdx !== undefined && themeIdx === this.lastHeartThemeIdx) {
        themeIdx = (themeIdx + 1 + Math.floor(Math.random() * (heartThemes.length - 1))) % heartThemes.length;
      }
      this.lastHeartThemeIdx = themeIdx;
      const heartColors = heartThemes[themeIdx];

      // Pick a geometric pattern style for coloring the heart pixels!
      // 0: horizontal rows | 1: diagonal stripe | 2: concentric rings | 3: split vertical + mosaic
      const patternMode = Math.floor(Math.random() * 4);

      for (const [r, c] of heartCoords) {
        // Expand outward and upward
        const delay = (6 - r) * 0.065 + Math.abs(c - 3.5) * 0.04;
        let colorIndex = 0;
        if (patternMode === 0) {
          colorIndex = r - 1;
        } else if (patternMode === 1) {
          colorIndex = r + c;
        } else if (patternMode === 2) {
          colorIndex = Math.floor(Math.hypot(r - 3.3, c - 3.5));
        } else {
          colorIndex = Math.floor(c / 2) + (r % 2);
        }
        const colorObj = heartColors[((colorIndex % heartColors.length) + heartColors.length) % heartColors.length];
        cells.push({
          r,
          c,
          colorObj,
          delay,
          scale: 0,
          soundPlayed: false
        });
      }
    } else {
      // Full grid diagonal wave fill; cells belonging to targetGrid survive the shatter
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const delay = (r + c) * 0.032;
          const targetVal = targetGrid[r][c];
          const isSurvivor = targetVal !== null;
          const colorObj = isSurvivor
            ? palette[targetVal % palette.length]
            : palette[(r * 2 + c) % palette.length];
          cells.push({
            r,
            c,
            colorObj,
            delay,
            scale: 0,
            isSurvivor,
            shattered: false,
            settleElapsed: 0,
            soundPlayed: false
          });
        }
      }
    }

    this.introAnim = {
      active: true,
      elapsed: 0,
      isHeart,
      cells,
      targetGrid,
      targetCells: isHeart ? targetCells : [],
      heartRevealStart: 1.28,
      shattered: false,
      dissolveStarted: false,
      lastSoundTime: 0,
      onComplete
    };
  }

  skipIntroAnimation() {
    if (!this.introAnim || !this.introAnim.active) return;
    this.introAnim.active = false;
    if (this.introAnim.targetGrid) {
      this.grid = this.introAnim.targetGrid;
    }
    if (typeof this.introAnim.onComplete === 'function') {
      const cb = this.introAnim.onComplete;
      this.introAnim.onComplete = null;
      cb();
    }
  }

  seedRandomStartingBlocks() {
    const paletteLen = (this.theme.palette && this.theme.palette.length) || 6;
    if (typeof window.generateStartingBoard === 'function') {
      this.grid = window.generateStartingBoard(paletteLen);
    }
  }

  spawnNewTray() {
    if (this.isStartingHand && window.generateOpeningHand) {
      this.tray = window.generateOpeningHand(this.grid, this.theme.palette);
      this.isStartingHand = false;
    } else {
      this.tray = window.generateSmartTray(this.grid, this.theme.palette, this.score, this.comboStreak, {
        movesCount: this.movesCount,
        initialBestScore: this.initialBestScore,
        movesSinceDot: this.movesSinceDot,
        postReviveMoves: this.postReviveMoves
      });
    }
    this.tray.forEach((item, idx) => {
      if (item && !item.placed) {
        item.scale = 0;
        item.targetScale = 1;
        item.appearElapsed = -idx * 0.06;
        item.appearDuration = 0.34;
      }
    });
    if (this.tray.some((t) => t && t.shape && t.shape.id === 'dot1')) {
      this.movesSinceDot = 0;
    }
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
        movesCount: this.movesCount,
        revivesUsed: this.revivesUsed,
        movesSinceDot: this.movesSinceDot,
        postReviveMoves: this.postReviveMoves,
        initialBestScore: this.initialBestScore,
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
      this.movesCount = data.movesCount || 0;
      this.revivesUsed = data.revivesUsed || 0;
      this.movesSinceDot = typeof data.movesSinceDot === 'number' ? data.movesSinceDot : 99;
      this.postReviveMoves = typeof data.postReviveMoves === 'number' ? data.postReviveMoves : 99;
      this.initialBestScore = typeof data.initialBestScore === 'number' ? data.initialBestScore : this.bestScore;
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
      this.hasCountedGamePlayed = true;
      this.applyTheme(this.themeId, true);
      if (window.questManager) {
        window.questManager.onEvent('single_score', this.score);
        window.questManager.onEvent('max_combo', this.maxCombo || 1);
        window.questManager.updateUIBadge();
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
    if (window.questManager) window.questManager.updateUIBadge();

    const diamond = document.getElementById('comboDiamond');
    if (diamond) {
      if (this.comboStreak >= 1) {
        if (!diamond.classList.contains('active')) {
          diamond.classList.add('active');
        }
      } else {
        diamond.classList.remove('active', 'pulse');
      }
    }

    const soundEnabled = Boolean(window.soundEngine && window.soundEngine.enabled);
    const soundLabel = document.getElementById('soundLabel');
    if (soundLabel) {
      soundLabel.textContent = soundEnabled ? 'Вкл' : 'Выкл';
    }
    const soundSwitch = document.getElementById('soundSwitch');
    if (soundSwitch) {
      soundSwitch.classList.toggle('on', soundEnabled);
    }
    const soundDesc = document.getElementById('soundDesc');
    if (soundDesc) {
      soundDesc.textContent = soundEnabled ? 'Приятные щелчки и комбо' : 'Звуковые эффекты выключены';
    }

    const baseTheme = (window.THEMES && (window.THEMES[this.themeId] || window.THEMES.classic)) || this.theme;
    const currentThemeLabel = document.getElementById('currentThemeLabel');
    if (currentThemeLabel && baseTheme) {
      currentThemeLabel.textContent = baseTheme.name;
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

    // Reserve space for dock at bottom (~22% of canvas height)
    const dockTargetH = Math.min(145, Math.max(105, Math.round(h * 0.22)));
    const gapBetweenBoardAndDock = Math.max(16, Math.min(30, Math.round(h * 0.035)));
    const maxBoardSpaceW = w - 12;
    const maxBoardSpaceH = h - dockTargetH - gapBetweenBoardAndDock - 24;

    const boardSize = Math.floor(Math.min(maxBoardSpaceW, maxBoardSpaceH));
    const boardPad = Math.max(3, Math.round(boardSize * 0.012));
    const cellSize = (boardSize - boardPad * 2) / 8;

    const boardX = Math.round((w - boardSize) / 2);

    // Position board closer to vertical center of screen
    const remainingH = Math.max(0, h - (boardSize + gapBetweenBoardAndDock + dockTargetH));
    const boardY = Math.max(10, Math.round(remainingH * 0.28));
    const dockY = boardY + boardSize + gapBetweenBoardAndDock;
    const dockHeight = Math.max(96, h - dockY - 6);

    const slotW = boardSize / 3;
    const dockSlotCenters = [
      { x: boardX + slotW * 0.5, y: dockY + dockHeight * 0.48 },
      { x: boardX + slotW * 1.5, y: dockY + dockHeight * 0.48 },
      { x: boardX + slotW * 2.5, y: dockY + dockHeight * 0.48 }
    ];

    this.metrics = {
      width: w,
      height: h,
      dpr,
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

    const hide = (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    };
    const show = (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    };

    // Open Quests helper
    let lastQuestOpen = 0;
    const openQuests = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const now = Date.now();
      if (now - lastQuestOpen < 300) return;
      lastQuestOpen = now;
      window.soundEngine.init();
      window.soundEngine.playPickup();
      this.renderQuestsModal();
      show('questsModal');
    };

    // Quests Button in HUD
    const btnQuests = document.getElementById('btnQuests');
    if (btnQuests) {
      btnQuests.addEventListener('pointerup', openQuests);
      btnQuests.addEventListener('click', openQuests);
    }

    // Quests Button on Start Screen
    const btnStartQuests = document.getElementById('btnStartQuests');
    if (btnStartQuests) {
      btnStartQuests.addEventListener('click', (e) => {
        openQuests(e);
      });
    }

    // Open Global Leaderboard helper
    let lastLbOpen = 0;
    const openLeaderboard = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const now = Date.now();
      if (now - lastLbOpen < 300) return;
      lastLbOpen = now;
      window.soundEngine.init();
      window.soundEngine.playPickup();
      show('leaderboardModal');
      this.renderLeaderboardModal(true);
    };

    const btnLeaderboard = document.getElementById('btnLeaderboard');
    if (btnLeaderboard) {
      btnLeaderboard.addEventListener('pointerup', openLeaderboard);
      btnLeaderboard.addEventListener('click', openLeaderboard);
    }

    const btnStartLeaderboard = document.getElementById('btnStartLeaderboard');
    if (btnStartLeaderboard) {
      btnStartLeaderboard.addEventListener('click', (e) => {
        openLeaderboard(e);
      });
    }

    const btnGameOverLeaderboard = document.getElementById('btnGameOverLeaderboard');
    if (btnGameOverLeaderboard) {
      btnGameOverLeaderboard.addEventListener('click', (e) => {
        openLeaderboard(e);
      });
    }

    const btnLbRefresh = document.getElementById('btnLbRefresh');
    if (btnLbRefresh) {
      btnLbRefresh.addEventListener('click', () => {
        window.soundEngine.playPickup();
        this.renderLeaderboardModal(true);
      });
    }

    const lbNameForm = document.getElementById('lbNameForm');
    if (lbNameForm) {
      lbNameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.leaderboardManager) return;
        const input = document.getElementById('lbNameInput');
        const cleaned = window.leaderboardManager.setPlayerName(input ? input.value : '');
        if (input) input.value = cleaned;
        window.soundEngine.playPickup();

        const statusEl = document.getElementById('lbStatus');
        if (statusEl) statusEl.textContent = 'Сохраняем имя и обновляем рейтинг...';

        await window.leaderboardManager.syncScore({
          bestScore: this.bestScore,
          maxCombo: this.maxCombo || 1,
          force: true
        });
        this.updateHUD();
        await this.renderLeaderboardModal(true);
      });
    }

    // Start screen
    document.getElementById('btnStartClassic').addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.playPickup();
      hide('startScreen');
      if (this.pauseStartShowcase) this.pauseStartShowcase();
      this.startNewGame(true, true);
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
      this.startNewGame(true);
    });

    document.getElementById('btnHome').addEventListener('click', () => {
      window.soundEngine.playPickup();
      hide('settingsModal');
      show('startScreen');
      if (this.lastVisualSurface) {
        this.applyVisualSurface(this.lastVisualSurface, true);
      } else {
        this.syncRootSurfaceColor(true);
      }
      if (this.resumeStartShowcase) this.resumeStartShowcase();
    });

    const btnRevive = document.getElementById('btnRevive');
    if (btnRevive) {
      btnRevive.addEventListener('click', () => {
        this.reviveGame();
      });
    }

    document.getElementById('btnPlayAgain').addEventListener('click', () => {
      window.soundEngine.playPickup();
      this.startNewGame(true);
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

    const btnReloadApp = document.getElementById('btnReloadApp');
    if (btnReloadApp) {
      btnReloadApp.addEventListener('click', async () => {
        window.soundEngine.playPickup();
        try {
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
          }
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const r of regs) await r.unregister();
          }
        } catch (e) {}
        window.location.href = window.location.origin + window.location.pathname + '?reload=' + Date.now();
      });
    }

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-close');
        document.getElementById(target).classList.add('hidden');
        if (target === 'questsModal' && this.isGameOver) {
          this.updateReviveUI();
        }
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop && backdrop.id !== 'gameOverModal') {
          backdrop.classList.add('hidden');
          if (backdrop.id === 'questsModal' && this.isGameOver) {
            this.updateReviveUI();
          }
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
    if (this.introAnim && this.introAnim.active) {
      if (this.introAnim.elapsed > 0.75) {
        this.skipIntroAnimation();
      }
      return;
    }
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
        this.drag.startX = pt.x;
        this.drag.startY = pt.y;
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

    // Responsive thumb drag: lift piece comfortably above finger and boost reach
    const baseLift = this.drag.isTouch ? cellSize * 2.5 : cellSize * 0.7;
    const deltaY = py - (this.drag.startY || py);
    const deltaX = px - (this.drag.startX || px);
    const extraUpwardReach = deltaY < 0 ? Math.abs(deltaY) * 0.45 : 0;
    const extraSidewaysReach = deltaX * 0.20;

    const centerX = px + extraSidewaysReach;
    const centerY = py - baseLift - extraUpwardReach;

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
    this.movesCount = (this.movesCount || 0) + 1;
    this.movesSinceDot = (this.movesSinceDot ?? 99) + 1;
    this.postReviveMoves = (this.postReviveMoves ?? 99) + 1;

    // Quest: First block placed counts as a game played
    if (!this.hasCountedGamePlayed) {
      this.hasCountedGamePlayed = true;
      if (window.questManager) {
        window.questManager.onEvent('games_played', 1);
      }
      if (window.leaderboardManager) {
        window.leaderboardManager.recordLocalProgress(this.bestScore, this.maxCombo || 1, 1);
      }
    }

    // Base placement points (juicy reward for placing shapes)
    const placementPoints = shape.blockCount * 3;
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

      // Clear cells & spawn staggered shatter FX (periodically cycles: numbers, cubes, lightning, fireworks, bubbles, stars)
      const clearedSet = new Set();
      const activeFXMode = this.fx.currentMode;
      this.fx.advanceClearMode();

      for (const r of fullRows) {
        this.fx.spawnLineBeam(
          gridOriginX,
          gridOriginY + r * cellSize,
          cellSize * 8,
          cellSize,
          pieceColorObj.glow || pieceColorObj.base
        );
        if (activeFXMode === 'lightning') {
          this.fx.spawnLightning(
            gridOriginX,
            gridOriginY + (r + 0.5) * cellSize,
            gridOriginX + cellSize * 8,
            gridOriginY + (r + 0.5) * cellSize,
            '#00f0ff'
          );
        }
        for (let c = 0; c < 8; c++) {
          const key = `${r},${c}`;
          if (!clearedSet.has(key)) {
            clearedSet.add(key);
            const cIdx = this.grid[r][c] ?? colorIndex;
            const cObj = this.theme.palette[cIdx % this.theme.palette.length];
            const cx = gridOriginX + (c + 0.5) * cellSize;
            const cy = gridOriginY + (r + 0.5) * cellSize;
            const delay = c * 0.016;
            this.fx.spawnCellShatter(cx, cy, cellSize, cObj, delay);
            if (activeFXMode === 'numbers') {
              this.fx.spawnCellScore(cx, cy, 5 * Math.max(1, this.comboStreak), delay);
            }
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
        if (activeFXMode === 'lightning') {
          this.fx.spawnLightning(
            gridOriginX + (c + 0.5) * cellSize,
            gridOriginY,
            gridOriginX + (c + 0.5) * cellSize,
            gridOriginY + cellSize * 8,
            '#00f0ff'
          );
        }
        for (let r = 0; r < 8; r++) {
          const key = `${r},${c}`;
          if (!clearedSet.has(key)) {
            clearedSet.add(key);
            const cIdx = this.grid[r][c] ?? colorIndex;
            const cObj = this.theme.palette[cIdx % this.theme.palette.length];
            const cx = gridOriginX + (c + 0.5) * cellSize;
            const cy = gridOriginY + (r + 0.5) * cellSize;
            const delay = r * 0.016;
            this.fx.spawnCellShatter(cx, cy, cellSize, cObj, delay);
            if (activeFXMode === 'numbers') {
              this.fx.spawnCellScore(cx, cy, 5 * Math.max(1, this.comboStreak), delay);
            }
            this.grid[r][c] = null;
          }
        }
      }

      // Check if the entire 8x8 board is now completely empty ("ALL CLEAR!")
      const isAllClear = this.grid.every((row) => row.every((cell) => cell === null));

      // Authentic Block Blast Line Clear & Balanced Combo Multiplier Scoring
      // Smoothly compresses ultra-high x10+ streaks so scores climb naturally without hyperinflation
      const baseLineScore = 30 * ((totalLines * (totalLines + 1)) / 2);
      const effectiveCombo = this.comboStreak <= 10
        ? this.comboStreak
        : 10 + Math.sqrt(this.comboStreak - 10) * 1.6;
      const cappedStepBonus = Math.min(this.comboStreak, 12);
      const comboBonus = Math.round(
        baseLineScore * effectiveCombo + (cappedStepBonus >= 2 ? (cappedStepBonus - 1) * 40 : 0)
      );
      const allClearBonus = isAllClear ? 500 : 0;
      movePoints += comboBonus + allClearBonus;

      // Quests tracking for line clears, destroyed blocks, combo, all clear
      if (window.questManager) {
        window.questManager.onEvent('lines_cleared', totalLines);
        window.questManager.onEvent('blocks_destroyed', clearedSet.size);
        window.questManager.onEvent('max_combo', this.comboStreak);
        if (isAllClear) {
          window.questManager.onEvent('all_clear', 1);
        }
      }

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

      // Authentic Block Blast Banner Callouts & Diamond Pop
      if (isAllClear) {
        this.fx.spawnBanner('ALL CLEAR!', `БОНУС +500`, '#51cf66');
      } else if (this.comboStreak >= 1) {
        this.fx.spawnBanner(`Combo ${this.comboStreak}`, totalLines >= 2 ? `+${totalLines} ЛИНИИ` : '', '#d2fba4', true);
      } else if (totalLines >= 2) {
        this.fx.spawnBanner(this.getPraiseWord(totalLines), `${totalLines} ЛИНИИ СРАЗУ!`, '#66d9e8');
      }

      const diamond = document.getElementById('comboDiamond');
      if (diamond && this.comboStreak >= 1) {
        diamond.classList.add('active');
        diamond.classList.remove('pulse');
        void diamond.offsetWidth;
        diamond.classList.add('pulse');
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
          const diamond = document.getElementById('comboDiamond');
          if (diamond) diamond.classList.remove('active', 'pulse');
        }
      }
    }

    // Add score & check high score
    this.score += movePoints;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bb_best_score', String(this.bestScore));
      if (window.leaderboardManager) {
        window.leaderboardManager.recordLocalProgress(this.bestScore, this.maxCombo || 1, 0);
      }
    }

    // Quest: Score update
    if (window.questManager) {
      window.questManager.onEvent('single_score', this.score);
    }

    // Rotate color palette less frequently (every 800 pts), only when active theme supports dynamic palettes!
    const baseTheme = (window.THEMES && (window.THEMES[this.themeId] || window.THEMES.classic)) || this.theme;
    if (baseTheme && baseTheme.supportsAutoPalette && this.autoPalette) {
      this.paletteProgress += movePoints;
      if (totalLines >= 1 && this.paletteProgress >= 800) {
        const steps = Math.floor(this.paletteProgress / 800);
        this.paletteProgress = this.paletteProgress % 800;
        this.applyPaletteIndex(this.paletteIndex + steps);
      }
      localStorage.setItem('bb_palette_pts', String(this.paletteProgress));
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

    if (window.questManager) {
      window.questManager.onEvent('single_score', this.score);
      window.questManager.onEvent('max_combo', this.maxCombo);
      window.questManager.updateUIBadge();
    }

    if (window.leaderboardManager) {
      window.leaderboardManager.recordLocalProgress(this.bestScore, this.maxCombo || 1, 0);
      if (this.bestScore > 0) {
        window.leaderboardManager.syncScore({
          bestScore: this.bestScore,
          maxCombo: this.maxCombo || 1
        }).then(() => this.refreshGameOverRankBadge());
      }
    }

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

      this.updateReviveUI();
      this.refreshGameOverRankBadge();
      document.getElementById('gameOverModal').classList.remove('hidden');
    }, 620);
  }

  getReviveCost() {
    return this.revivesUsed === 0 ? 50 : 100;
  }

  updateReviveUI() {
    const btn = document.getElementById('btnRevive');
    const pill = document.getElementById('reviveCostPill');
    const hint = document.getElementById('reviveHint');
    if (!btn || !pill || !hint) return;

    if (this.revivesUsed >= 2) {
      btn.classList.add('hidden');
      hint.textContent = 'Лимит возрождений за партию (2/2) исчерпан';
      return;
    }

    btn.classList.remove('hidden');
    const cost = this.getReviveCost();
    const trophies = window.questManager ? window.questManager.trophies : 0;
    pill.innerHTML = `${cost} ${UI_ICONS.trophy}`;

    if (trophies >= cost) {
      btn.classList.remove('locked');
      hint.innerHTML = `Взорвёт 4×4 в центре завала и сменит фигуры • У вас: ${trophies} ${UI_ICONS.trophy}`;
    } else {
      btn.classList.add('locked');
      const missing = cost - trophies;
      const hasClaimable = window.questManager && window.questManager.hasUnclaimed();
      hint.innerHTML = hasClaimable
        ? `Есть готовые награды в квестах! Нажми, чтобы забрать ${UI_ICONS.trophy}`
        : `Не хватает ${missing} ${UI_ICONS.trophy} — нажми, чтобы открыть квесты`;
    }
  }

  reviveGame() {
    if (!this.isGameOver || this.revivesUsed >= 2) return;
    const cost = this.getReviveCost();
    const qm = window.questManager;

    if (!qm || qm.trophies < cost) {
      window.soundEngine.playPickup();
      this.renderQuestsModal();
      document.getElementById('questsModal').classList.remove('hidden');
      return;
    }

    if (!qm.spendTrophies(cost)) return;

    this.revivesUsed += 1;
    this.postReviveMoves = 0;
    this.isGameOver = false;
    document.getElementById('gameOverModal').classList.add('hidden');

    // Locate the densest 4x4 region (biased near board center) and blast it clear
    let bestR = 2;
    let bestC = 2;
    let bestScore = -1;
    for (let r = 0; r <= 4; r++) {
      for (let c = 0; c <= 4; c++) {
        let count = 0;
        for (let dr = 0; dr < 4; dr++) {
          for (let dc = 0; dc < 4; dc++) {
            if (this.grid[r + dr][c + dc] !== null) count++;
          }
        }
        const centerDist = Math.abs(r - 2) + Math.abs(c - 2);
        const s = count * 10 - centerDist;
        if (s > bestScore) {
          bestScore = s;
          bestR = r;
          bestC = c;
        }
      }
    }

    const { boardX, boardY, boardPad, cellSize } = this.metrics;
    const gridOriginX = boardX + boardPad;
    const gridOriginY = boardY + boardPad;

    for (let dr = 0; dr < 4; dr++) {
      for (let dc = 0; dc < 4; dc++) {
        const rr = bestR + dr;
        const cc = bestC + dc;
        const cIdx = this.grid[rr][cc];
        if (cIdx !== null) {
          const cObj = this.theme.palette[cIdx % this.theme.palette.length];
          const cx = gridOriginX + (cc + 0.5) * cellSize;
          const cy = gridOriginY + (rr + 0.5) * cellSize;
          const delay = (dr + dc) * 0.025;
          this.fx.spawnCellShatter(cx, cy, cellSize, cObj, delay);
          this.grid[rr][cc] = null;
        }
      }
    }

    // Refresh dock with a guaranteed-solvable 3-piece hand
    this.spawnNewTray();
    this.checkPieceFitStates();
    this.updateHUD();
    this.saveGameState();

    this.fx.triggerShake(10, 0.35);
    this.fx.spawnBanner('ВТОРОЙ ШАНС!', 'ПОЛЕ РАСЧИЩЕНО', '#ffd43b');
    window.soundEngine.playLineClear(3, Math.max(3, this.comboStreak || 1), true);
    if (navigator.vibrate) {
      navigator.vibrate([30, 40, 50]);
    }
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

  update(dt, now) {
    // Periodic quest expiry check (~1 sec) to reset progress if time limit ran out
    if (!this._lastQuestCheck || now - this._lastQuestCheck > 1000) {
      this._lastQuestCheck = now;
      if (window.questManager) {
        window.questManager.checkTimeExpiry();
      }
    }

    const easeOutBack = (x, overshoot = 1.35) => {
      const tNorm = Math.max(0, Math.min(1, x));
      const c3 = overshoot + 1;
      return 1 + c3 * Math.pow(tNorm - 1, 3) + overshoot * Math.pow(tNorm - 1, 2);
    };

    // Intro board fill and reveal animation
    if (this.introAnim && this.introAnim.active) {
      this.introAnim.elapsed += dt;
      const t = this.introAnim.elapsed;
      const { boardX, boardY, boardPad, cellSize } = this.metrics;
      const gridOriginX = boardX + boardPad;
      const gridOriginY = boardY + boardPad;

      const phaseEnd = this.introAnim.isHeart ? 1.12 : 1.02;
      for (const cell of this.introAnim.cells) {
        if (cell.shattered) continue;
        if (t >= cell.delay) {
          if (!cell.soundPlayed) {
            cell.soundPlayed = true;
            if (t - this.introAnim.lastSoundTime > 0.04) {
              this.introAnim.lastSoundTime = t;
              window.soundEngine.playHoverTick();
            }
          }
          if (t < phaseEnd) {
            const p = Math.min(1, (t - cell.delay) / 0.24);
            cell.scale = p < 1 ? easeOutBack(p, 1.15) : 1.0;
          }
        }
      }

      if (this.introAnim.isHeart) {
        // Heart phase 2: gentle upward sparkle dissolve -> staggered radial pop-in of targetGrid
        let anyHeartVisible = false;
        if (t >= 1.12) {
          if (!this.introAnim.dissolveStarted) {
            this.introAnim.dissolveStarted = true;
            if (window.soundEngine && typeof window.soundEngine.playHeartDissolve === 'function') {
              window.soundEngine.playHeartDissolve();
            }
          }

          for (const cell of this.introAnim.cells) {
            const shrinkDelay = 1.12 + (cell.r * 0.032) + Math.abs(cell.c - 3.5) * 0.018;
            if (t >= shrinkDelay) {
              if (!cell.sparkled) {
                cell.sparkled = true;
                const cx = gridOriginX + (cell.c + 0.5) * cellSize;
                const cy = gridOriginY + (cell.r + 0.5) * cellSize;
                if (this.fx && typeof this.fx.spawnHeartSparkle === 'function') {
                  this.fx.spawnHeartSparkle(cx, cy, cellSize, cell.colorObj);
                }
              }
              cell.scale = Math.max(0, cell.scale - dt * 6.5);
            }
            if (cell.scale > 0.01) anyHeartVisible = true;
          }
        } else {
          anyHeartVisible = true;
        }

        // Reveal actual starting board cells with radial spring bounce
        let allTargetsSettled = true;
        const revealStart = this.introAnim.heartRevealStart || 1.28;
        if (t >= revealStart) {
          for (const tCell of this.introAnim.targetCells) {
            const localT = t - (revealStart + tCell.delay);
            if (localT >= 0) {
              if (!tCell.soundPlayed) {
                tCell.soundPlayed = true;
                if (t - this.introAnim.lastSoundTime > 0.045) {
                  this.introAnim.lastSoundTime = t;
                  window.soundEngine.playHoverTick();
                }
              }
              const p = Math.min(1, localT / 0.28);
              tCell.scale = p < 1 ? easeOutBack(p, 1.35) : 1.0;
              if (p < 1) allTargetsSettled = false;
            } else {
              allTargetsSettled = false;
            }
          }
        } else if (this.introAnim.targetCells.length > 0) {
          allTargetsSettled = false;
        }

        if ((t >= revealStart + 0.28 && !anyHeartVisible && allTargetsSettled) || t >= 1.92) {
          this.introAnim.active = false;
          if (this.introAnim.targetGrid) {
            this.grid = this.introAnim.targetGrid;
          }
          if (typeof this.introAnim.onComplete === 'function') {
            const cb = this.introAnim.onComplete;
            this.introAnim.onComplete = null;
            cb();
          }
        }
      } else {
        // Full grid pattern: shatter ONLY non-survivor cells; targetGrid blocks stay with settle bounce
        if (t >= 1.02 && !this.introAnim.shattered) {
          this.introAnim.shattered = true;
          for (const cell of this.introAnim.cells) {
            if (cell.isSurvivor) {
              cell.scale = 1.0;
              cell.settleElapsed = 0;
              continue;
            }
            cell.shattered = true;
            cell.scale = 0;
            const cx = gridOriginX + (cell.c + 0.5) * cellSize;
            const cy = gridOriginY + (cell.r + 0.5) * cellSize;
            const stagger = (cell.r + cell.c) * 0.010;
            this.fx.spawnCellShatter(cx, cy, cellSize, cell.colorObj, stagger);
          }

          window.soundEngine.playLineClear(2, 2, false);
          this.fx.triggerShake(5, 0.24);
        }

        if (this.introAnim.shattered) {
          for (const cell of this.introAnim.cells) {
            if (cell.isSurvivor && !cell.shattered) {
              cell.settleElapsed = Math.min(0.32, (cell.settleElapsed || 0) + dt);
              const sp = cell.settleElapsed / 0.32;
              cell.scale = 1.0 + 0.11 * Math.sin(sp * Math.PI);
            }
          }
        }

        // Complete at 1.38s once survivors settle cleanly
        if (t >= 1.38) {
          this.introAnim.active = false;
          if (this.introAnim.targetGrid) {
            this.grid = this.introAnim.targetGrid;
          }
          if (typeof this.introAnim.onComplete === 'function') {
            const cb = this.introAnim.onComplete;
            this.introAnim.onComplete = null;
            cb();
          }
        }
      }
    }

    // Smoothly animate displayed score rollup
    if (this.displayedScore < this.score) {
      const diff = this.score - this.displayedScore;
      const step = Math.max(1, Math.ceil(diff * Math.min(1, dt * 14)));
      this.displayedScore = Math.min(this.score, this.displayedScore + step);
      this.scoreEl.textContent = this.displayedScore.toLocaleString('ru-RU');
    }

    // Staggered spring-bounce spawn animation for tray pieces
    for (const item of this.tray) {
      if (!item || item.placed) continue;
      if (typeof item.appearDuration === 'number' && item.appearDuration > 0) {
        if ((item.appearElapsed || 0) < item.appearDuration) {
          item.appearElapsed = Math.min(item.appearDuration, (item.appearElapsed || 0) + dt);
          if (item.appearElapsed <= 0) {
            item.scale = 0;
          } else {
            const p = item.appearElapsed / item.appearDuration;
            item.scale = p < 1 ? easeOutBack(p, 1.35) * item.targetScale : item.targetScale;
          }
        } else {
          item.scale = item.targetScale;
        }
      } else if (item.scale < item.targetScale) {
        item.scale = Math.min(item.targetScale, item.scale + dt * 5.5);
      }
    }

    // Ultra-snappy drag interpolation (instant follow, zero lag)
    if (this.drag.active) {
      const { cellSize } = this.metrics;
      const baseLift = this.drag.isTouch ? cellSize * 2.5 : cellSize * 0.7;
      const deltaY = this.drag.y - (this.drag.startY || this.drag.y);
      const deltaX = this.drag.x - (this.drag.startX || this.drag.x);
      const extraUpwardReach = deltaY < 0 ? Math.abs(deltaY) * 0.45 : 0;
      const extraSidewaysReach = deltaX * 0.20;

      const targetX = this.drag.x + extraSidewaysReach;
      const targetY = this.drag.y - baseLift - extraUpwardReach;
      const lerp = Math.min(1, dt * 95);
      this.drag.visualX += (targetX - this.drag.visualX) * lerp;
      this.drag.visualY += (targetY - this.drag.visualY) * lerp;
      this.drag.visualScale += (1.0 - this.drag.visualScale) * Math.min(1, dt * 28);
    }

    this.fx.update(dt);
  }

  draw(now) {
    const ctx = this.ctx;
    const {
      width,
      height,
      dpr = 1,
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

    // 1. Board: clean dark panel
    ctx.save();
    window.roundRectPath(ctx, boardX, boardY, boardSize, boardSize, 6);
    ctx.fillStyle = theme.boardBg;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.boardBorder;
    ctx.stroke();
    ctx.restore();

    // 1.1 Authentic Combo Neon Aura (Vibrant Magenta/Pink pulsating aura with sparks)
    if (this.comboStreak >= 1) {
      const auraPulse = 0.72 + 0.28 * Math.sin(now * 0.009);
      ctx.save();
      const expand = 2;
      window.roundRectPath(ctx, boardX - expand, boardY - expand, boardSize + expand * 2, boardSize + expand * 2, 8);
      ctx.lineWidth = Math.min(4.5, 2.5 + this.comboStreak * 0.35);
      ctx.strokeStyle = `rgba(255, 68, 185, ${0.85 * auraPulse})`;
      ctx.shadowColor = '#ff2b85';
      ctx.shadowBlur = 14 + Math.min(12, this.comboStreak * 2.5);
      ctx.stroke();
      ctx.restore();
    }

    const gridOriginX = boardX + boardPad;
    const gridOriginY = boardY + boardPad;

    // 2. Clean Grid lines (сеточка)
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

    // 4.5. Draw Intro Animated Cells (Fill, Selective Shatter & Reveal)
    if (this.introAnim && this.introAnim.active) {
      const isHeart = this.introAnim.isHeart;
      let pulse = 1.0;
      if (isHeart && this.introAnim.elapsed < 1.12 && this.introAnim.elapsed >= 0.52) {
        const bp = this.introAnim.elapsed - 0.52;
        const b1 = Math.exp(-Math.pow((bp - 0.12) / 0.075, 2));
        const b2 = Math.exp(-Math.pow((bp - 0.34) / 0.085, 2)) * 0.78;
        pulse = 1.0 + 0.075 * (b1 + b2);
      }

      for (const cell of this.introAnim.cells) {
        if (cell.shattered || cell.scale <= 0.01) continue;
        const cx = gridOriginX + (cell.c + 0.5) * cellSize;
        const cy = gridOriginY + (cell.r + 0.5) * cellSize;
        const cellPulse = isHeart ? pulse : 1.0;
        const s = cellSize * cell.scale * cellPulse;
        const bx = cx - s / 2;
        const by = cy - s / 2;
        window.drawStyledBlock(ctx, bx, by, s, cell.colorObj, this.themeId, {
          alpha: Math.min(1, cell.scale * 1.15)
        });
      }

      if (this.introAnim.targetCells && this.introAnim.targetCells.length > 0) {
        for (const tCell of this.introAnim.targetCells) {
          if (tCell.scale <= 0.01) continue;
          const cx = gridOriginX + (tCell.c + 0.5) * cellSize;
          const cy = gridOriginY + (tCell.r + 0.5) * cellSize;
          const s = cellSize * tCell.scale;
          const bx = cx - s / 2;
          const by = cy - s / 2;
          window.drawStyledBlock(ctx, bx, by, s, tCell.colorObj, this.themeId, {
            alpha: Math.min(1, tCell.scale * 1.15)
          });
        }
      }
    }

    // 5. Dock has no container in the original — pieces sit on the background

    // 6. Draw Dock Pieces (with soft ambient drop shadow)
    for (let i = 0; i < 3; i++) {
      const item = this.tray[i];
      if (!item || item.placed) continue;
      if (this.drag.active && this.drag.slotIndex === i) continue;
      if (item.scale <= 0.01) continue;

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

      if (window.drawPieceShadow) {
        window.drawPieceShadow(ctx, shape, startX, startY, dCellSize, colorObj, this.themeId, {
          dpr,
          offsetX: dCellSize * 0.13,
          offsetY: dCellSize * 0.15,
          blur: Math.max(2, dCellSize * 0.13),
          shadowColor: theme.styleType === 'neon' ? 'rgba(0, 0, 0, 0.48)' : 'rgba(0, 0, 0, 0.27)'
        });
      }

      for (const cell of shape.cells) {
        window.drawStyledBlock(
          ctx,
          startX + cell.c * dCellSize,
          startY + cell.r * dCellSize,
          dCellSize,
          colorObj,
          this.themeId,
          { alpha: 1.0 }
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

      if (window.drawPieceShadow) {
        window.drawPieceShadow(ctx, shape, startX, startY, dSize, colorObj, this.themeId, {
          dpr,
          offsetX: dSize * 0.14,
          offsetY: dSize * 0.22,
          blur: Math.max(4, dSize * 0.26),
          shadowColor: 'rgba(0, 0, 0, 0.36)'
        });
      }

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
    }

    // 8. Draw Particle Explosions, Shattering Cubes & Combo Banners
    this.fx.draw(ctx, width, boardY + boardSize * 0.46, this.themeId);

    ctx.restore();
  }


  renderQuestsModal() {
    if (!window.questManager) return;
    const qm = window.questManager;
    qm.checkTimeExpiry();

    document.getElementById('modalTrophyCount').textContent = qm.trophies;

    // Update timer badges
    const updateTimers = () => {
      const hTimerEl = document.getElementById('hourlyTimerText');
      const dTimerEl = document.getElementById('dailyTimerText');
      if (hTimerEl) hTimerEl.textContent = qm.getRemainingHourFormatted();
      if (dTimerEl) dTimerEl.textContent = qm.getRemainingDayFormatted();
    };
    updateTimers();

    // Start live 1-second countdown while modal is open
    if (this._questTimerInterval) clearInterval(this._questTimerInterval);
    this._questTimerInterval = setInterval(() => {
      const modal = document.getElementById('questsModal');
      if (!modal || modal.classList.contains('hidden')) {
        clearInterval(this._questTimerInterval);
        this._questTimerInterval = null;
        return;
      }
      const expired = qm.checkTimeExpiry();
      if (expired) {
        this.renderQuestsModal();
      } else {
        updateTimers();
      }
    }, 1000);

    const renderList = (elId, list, category) => {
      const container = document.getElementById(elId);
      if (!container) return;
      container.innerHTML = '';

      list.forEach(q => {
        const item = document.createElement('div');
        item.className = 'quest-item';
        const pct = Math.min(100, Math.round((q.current / q.target) * 100));
        const canClaim = q.current >= q.target && !q.claimed;

        let btnHtml = '';
        if (q.claimed) {
          btnHtml = `<button class="quest-action-btn done" disabled>Получено ${UI_ICONS.check}</button>`;
        } else if (canClaim) {
          btnHtml = `<button class="quest-action-btn claim" data-claim="${q.id}" data-cat="${category}">Забрать +${q.reward} ${UI_ICONS.trophy}</button>`;
        } else {
          btnHtml = `<div class="quest-action-btn done">${q.reward} ${UI_ICONS.trophy}</div>`;
        }

        item.innerHTML = `
          <div class="quest-info">
            <div class="quest-title">${q.title}</div>
            <div class="quest-progress-bar-bg">
              <div class="quest-progress-fill" style="width: ${pct}%"></div>
            </div>
            <div class="quest-counter">${q.current} / ${q.target}</div>
          </div>
          ${btnHtml}
        `;

        container.appendChild(item);
      });
    };

    renderList('hourlyQuestsList', qm.hourlyQuests, 'hourly');
    renderList('dailyQuestsList', qm.dailyQuests, 'daily');

    // Bind claim buttons
    document.querySelectorAll('[data-claim]').forEach(btn => {
      let claimedOnce = false;
      const handleClaim = (e) => {
        if (claimedOnce) return;
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        claimedOnce = true;
        const qId = btn.getAttribute('data-claim');
        const category = btn.getAttribute('data-cat') || 'daily';
        const reward = qm.claim(qId, category);
        if (reward > 0) {
          window.soundEngine.playNewRecord();
          this.renderQuestsModal();
          this.updateHUD();
        }
      };
      btn.addEventListener('pointerup', handleClaim);
      btn.addEventListener('click', handleClaim);
    });
  }

  

  refreshGameOverRankBadge() {
    const pill = document.getElementById('gameOverRankBadge');
    if (!pill || !window.leaderboardManager) return;
    const rank = window.leaderboardManager.cachedRank;
    if (rank) {
      pill.textContent = `#${rank} в мире`;
      pill.classList.remove('hidden');
    } else {
      pill.classList.add('hidden');
    }
  }

  async renderLeaderboardModal(forceRefresh = false) {
    const lm = window.leaderboardManager;
    if (!lm) return;

    const myRankEl = document.getElementById('lbMyRank');
    const myScoreEl = document.getElementById('lbMyScore');
    const myComboEl = document.getElementById('lbMyCombo');
    const nameInput = document.getElementById('lbNameInput');
    const statusEl = document.getElementById('lbStatus');
    const listEl = document.getElementById('lbList');
    const onlineTag = document.getElementById('lbOnlineTag');

    if (myScoreEl) myScoreEl.textContent = this.bestScore.toLocaleString('ru-RU');
    if (myComboEl) myComboEl.textContent = `x${Math.max(lm.maxComboSeen, this.maxCombo || 1)}`;
    if (myRankEl) myRankEl.textContent = lm.cachedRank ? `#${lm.cachedRank}` : '—';
    if (nameInput && document.activeElement !== nameInput) {
      nameInput.value = lm.playerName || '';
      nameInput.placeholder = lm.getDefaultName(lm.user ? lm.user.uid : '');
    }

    if (statusEl) statusEl.textContent = 'Синхронизация с облаком...';

    if (this.bestScore > 0) {
      await lm.syncScore({ bestScore: this.bestScore, maxCombo: this.maxCombo || 1 });
    }

    const res = await lm.fetchLeaderboard({ force: forceRefresh });
    if (nameInput && document.activeElement !== nameInput) {
      nameInput.placeholder = lm.getDefaultName(res.myUid || (lm.user ? lm.user.uid : ''));
      if (!nameInput.value && lm.playerName) nameInput.value = lm.playerName;
    }

    if (onlineTag) {
      if (res.ok) {
        onlineTag.textContent = 'Онлайн';
        onlineTag.classList.remove('offline');
      } else {
        onlineTag.textContent = 'Офлайн';
        onlineTag.classList.add('offline');
      }
    }

    if (myRankEl) {
      myRankEl.textContent = res.myRank ? `#${res.myRank}` : '—';
    }
    this.updateHUD();
    this.refreshGameOverRankBadge();

    if (!listEl) return;
    listEl.innerHTML = '';

    if (!res.ok && (!res.entries || res.entries.length === 0)) {
      if (statusEl) {
        statusEl.textContent = 'Нет подключения к сети. Ваш рекорд сохранён локально и отправится автоматически при появлении интернета.';
      }
      return;
    }

    if (!res.entries || res.entries.length === 0) {
      if (statusEl) {
        statusEl.textContent = 'Пока нет записей — сыграйте первую партию и станьте #1!';
      }
      return;
    }

    if (statusEl) {
      statusEl.textContent = res.ok
        ? `Топ-${res.entries.length} лучших игроков мира`
        : 'Показаны кэшированные данные (нет сети)';
    }

    res.entries.forEach((entry, index) => {
      const rank = index + 1;
      const isMe = Boolean(res.myUid && entry.uid === res.myUid);
      const row = document.createElement('div');
      row.className = `lb-row${isMe ? ' me' : ''}${rank <= 3 ? ` top${rank}` : ''}`;

      const rankEl = document.createElement('span');
      rankEl.className = 'lb-rank';
      if (rank <= 3) {
        rankEl.innerHTML = UI_ICONS.medal(rank);
      } else {
        rankEl.textContent = `#${rank}`;
      }

      const nameWrap = document.createElement('div');
      nameWrap.className = 'lb-name-wrap';

      const nameEl = document.createElement('span');
      nameEl.className = 'lb-name';
      nameEl.textContent = isMe ? `${entry.name} (Вы)` : entry.name;

      const subEl = document.createElement('span');
      subEl.className = 'lb-sub';
      subEl.textContent = `Макс. комбо x${entry.maxCombo || 1}${entry.gamesPlayed ? ` • Игр: ${entry.gamesPlayed}` : ''}`;

      nameWrap.appendChild(nameEl);
      nameWrap.appendChild(subEl);

      const scoreEl = document.createElement('span');
      scoreEl.className = 'lb-score';
      scoreEl.textContent = (Number(entry.bestScore) || 0).toLocaleString('ru-RU');

      row.appendChild(rankEl);
      row.appendChild(nameWrap);
      row.appendChild(scoreEl);
      listEl.appendChild(row);
    });
  }

  renderThemeModalList() {
    const listEl = document.getElementById('themeList');
    if (!listEl) return;
    listEl.innerHTML = '';

    Object.values(window.THEMES).forEach((t) => {
      const isActive = t.id === this.themeId;
      const card = document.createElement('div');
      card.className = `theme-item ${isActive ? 'active' : ''}`;

      const swatchesHtml = t.palette
        .slice(0, 5)
        .map((c) => `<span class="theme-swatch" style="background:${c.base}"></span>`)
        .join('');

      const dotsHtml = t.palette
        .slice(0, 4)
        .map((c) => `<span class="theme-preview-dot" style="background:${c.base}"></span>`)
        .join('');

      card.innerHTML = `
        <div class="theme-preview-box" style="background:${t.bgGradient}">
          <div class="theme-preview-board" style="background:${t.boardBg}">
            ${dotsHtml}
          </div>
        </div>
        <div class="theme-info">
          <div class="theme-title">${t.name}</div>
          <div class="theme-sub">${t.subtitle}</div>
        </div>
        <div class="theme-right">
          <div class="theme-swatches">${swatchesHtml}</div>
          ${isActive ? `<span class="theme-active-tag">${UI_ICONS.check}<span>Выбрана</span></span>` : ''}
        </div>
      `;

      card.addEventListener('click', () => {
        window.soundEngine.playPickup();
        this.applyTheme(t.id);
        this.updateHUD();
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

// Register Service Worker with instant auto-update for iPhone PWA / Safari
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=14').then((reg) => {
      reg.update().catch(() => {});
    }).catch(() => {});
  });
}

window.BlockBlastGame = BlockBlastGame;

window.addEventListener('DOMContentLoaded', () => {
  if (/[?&]play\b/.test(window.location.search)) {
    document.getElementById('startScreen').classList.add('hidden');
    document.body.classList.remove('on-start-screen');
  }
  window.game = new BlockBlastGame();
});
