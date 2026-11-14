// Quests & Trophies System for Block Blast!
// Features Daily Quests (24h) and Flash Hourly Express Quests (1h) with live timers!
// Uncompleted quests strictly reset progress to 0 if the time limit expires!

class QuestManager {
  constructor() {
    this.trophies = parseInt(localStorage.getItem('bb_trophies') || '0', 10) || 0;

    const now = Date.now();
    const savedHourlyExpires = parseInt(localStorage.getItem('bb_hourly_expires_at'), 10);
    const savedDailyExpires = parseInt(localStorage.getItem('bb_daily_expires_at'), 10);

    // Keep expired timestamps intact so checkTimeExpiry() below processes missed resets/rotations
    this.hourlyExpiresAt = (!isNaN(savedHourlyExpires) && savedHourlyExpires > 0)
      ? savedHourlyExpires
      : now + 3600 * 1000;

    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    this.dailyExpiresAt = (!isNaN(savedDailyExpires) && savedDailyExpires > 0)
      ? savedDailyExpires
      : nextMidnight.getTime();

    this.dailyQuests = [];
    this.hourlyQuests = [];

    this.loadQuests();
    this.checkTimeExpiry();
  }

  getRemainingHourSeconds() {
    const now = Date.now();
    return Math.max(0, Math.floor((this.hourlyExpiresAt - now) / 1000));
  }

  getRemainingDaySeconds() {
    const now = Date.now();
    return Math.max(0, Math.floor((this.dailyExpiresAt - now) / 1000));
  }

  getRemainingHourFormatted() {
    const s = this.getRemainingHourSeconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  getRemainingDayFormatted() {
    const s = this.getRemainingDaySeconds();
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}ч ${m}м`;
  }

  // Express 1-hour fast quests (calibrated to 1h session benchmarks & Revive economy)
  getDefaultHourlyPool() {
    return [
      { id: 'exp_clear_80_lines', title: 'Очистить 80 линий', target: 80, reward: 25, type: 'lines_cleared' },
      { id: 'exp_combo_10', title: 'Достичь комбо x10', target: 10, reward: 30, type: 'max_combo' },
      { id: 'exp_score_15000', title: 'Набрать 15 000 очков в игре', target: 15000, reward: 30, type: 'single_score' },
      { id: 'exp_destroy_450_blocks', title: 'Уничтожить 450 блоков', target: 450, reward: 25, type: 'blocks_destroyed' },
      { id: 'exp_play_3_games', title: 'Сыграть 3 игры', target: 3, reward: 20, type: 'games_played' },
      { id: 'exp_clear_120_lines', title: 'Очистить 120 линий', target: 120, reward: 35, type: 'lines_cleared' },
      { id: 'exp_score_25000', title: 'Набрать 25 000 очков в игре', target: 25000, reward: 40, type: 'single_score' }
    ];
  }

  // Daily 24-hour quests (solid daily milestones feeding Trophy/Revive loop)
  getDefaultDailyPool() {
    return [
      { id: 'd_play_6_games', title: 'Сыграть 6 игр', target: 6, reward: 50, type: 'games_played' },
      { id: 'd_score_40000', title: 'Набрать 40 000 очков в игре', target: 40000, reward: 80, type: 'single_score' },
      { id: 'd_clear_250_lines', title: 'Очистить 250 линий', target: 250, reward: 70, type: 'lines_cleared' },
      { id: 'd_combo_16', title: 'Достичь комбо x16', target: 16, reward: 75, type: 'max_combo' },
      { id: 'd_destroy_1200_blocks', title: 'Уничтожить 1 200 блоков', target: 1200, reward: 70, type: 'blocks_destroyed' },
      { id: 'd_all_clear_1', title: 'Сделать «Чистое поле»', target: 1, reward: 90, type: 'all_clear' },
      { id: 'd_clear_400_lines', title: 'Очистить 400 линий', target: 400, reward: 95, type: 'lines_cleared' }
    ];
  }

  checkTimeExpiry() {
    const now = Date.now();
    let changed = false;

    // 1. Express 1-hour fast quests
    if (now >= this.hourlyExpiresAt) {
      const pool = this.getDefaultHourlyPool();
      const hasQuests = Array.isArray(this.hourlyQuests) && this.hourlyQuests.length > 0;

      if (!hasQuests) {
        this.initHourlyQuests();
      } else {
        this.hourlyQuests.forEach((q) => {
          if (!q.claimed && (Number(q.current) || 0) < (Number(q.target) || 1)) {
            // Did not manage to complete in time: reset progress to 0!
            q.current = 0;
          } else if (q.claimed) {
            // Already claimed: rotate to a fresh quest from pool
            const activeIds = this.hourlyQuests.map((hq) => hq.id);
            const available = pool.filter((p) => !activeIds.includes(p.id));
            const next = available.length > 0
              ? available[Math.floor(Math.random() * available.length)]
              : pool[Math.floor(Math.random() * pool.length)];
            Object.assign(q, { ...next, current: 0, claimed: false });
          }
          // If completed but unclaimed (current >= target && !claimed), keep so player can claim trophies!
        });
      }

      this.hourlyExpiresAt = now + 3600 * 1000;
      this.saveQuests();
      changed = true;
    }

    // 2. Daily 24-hour quests
    if (now >= this.dailyExpiresAt) {
      const pool = this.getDefaultDailyPool();
      const hasQuests = Array.isArray(this.dailyQuests) && this.dailyQuests.length > 0;

      if (!hasQuests) {
        this.initDailyQuests();
      } else {
        this.dailyQuests.forEach((q) => {
          if (!q.claimed && (Number(q.current) || 0) < (Number(q.target) || 1)) {
            // Did not manage to complete in time: reset progress to 0!
            q.current = 0;
          } else if (q.claimed) {
            // Already claimed: rotate to a fresh daily quest
            const activeIds = this.dailyQuests.map((dq) => dq.id);
            const available = pool.filter((p) => !activeIds.includes(p.id));
            const next = available.length > 0
              ? available[Math.floor(Math.random() * available.length)]
              : pool[Math.floor(Math.random() * pool.length)];
            Object.assign(q, { ...next, current: 0, claimed: false });
          }
        });
      }

      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      this.dailyExpiresAt = nextMidnight.getTime();
      this.saveQuests();
      changed = true;
    }

    if (changed) {
      this.updateUIBadge();
      const modal = document.getElementById('questsModal');
      if (modal && !modal.classList.contains('hidden') && window.game && typeof window.game.renderQuestsModal === 'function') {
        window.game.renderQuestsModal();
      }
    }

    return changed;
  }

  loadQuests() {
    const savedDailyData = localStorage.getItem('bb_daily_quests_v4');
    const savedHourlyData = localStorage.getItem('bb_hourly_quests_v4');

    // 1. Daily Quests
    if (savedDailyData) {
      try {
        const parsed = JSON.parse(savedDailyData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.dailyQuests = parsed.map((q) => ({
            ...q,
            current: Number(q.current) || 0,
            target: Number(q.target) || 1,
            reward: Number(q.reward) || 10,
            claimed: Boolean(q.claimed)
          }));
        } else {
          this.initDailyQuests();
        }
      } catch (e) {
        this.initDailyQuests();
      }
    } else {
      this.initDailyQuests();
    }

    // 2. Hourly Quests
    if (savedHourlyData) {
      try {
        const parsed = JSON.parse(savedHourlyData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.hourlyQuests = parsed.map((q) => ({
            ...q,
            current: Number(q.current) || 0,
            target: Number(q.target) || 1,
            reward: Number(q.reward) || 8,
            claimed: Boolean(q.claimed)
          }));
        } else {
          this.initHourlyQuests();
        }
      } catch (e) {
        this.initHourlyQuests();
      }
    } else {
      this.initHourlyQuests();
    }
  }

  initDailyQuests() {
    const pool = this.getDefaultDailyPool();
    const shuffled = pool.sort(() => 0.5 - Math.random());
    this.dailyQuests = shuffled.slice(0, 3).map((q) => ({
      ...q,
      current: 0,
      claimed: false
    }));
    this.saveQuests();
  }

  initHourlyQuests() {
    const pool = this.getDefaultHourlyPool();
    const shuffled = pool.sort(() => 0.5 - Math.random());
    this.hourlyQuests = shuffled.slice(0, 2).map((q) => ({
      ...q,
      current: 0,
      claimed: false
    }));
    this.saveQuests();
  }

  saveQuests() {
    localStorage.setItem('bb_daily_quests_v4', JSON.stringify(this.dailyQuests));
    localStorage.setItem('bb_hourly_quests_v4', JSON.stringify(this.hourlyQuests));
    localStorage.setItem('bb_hourly_expires_at', String(this.hourlyExpiresAt));
    localStorage.setItem('bb_daily_expires_at', String(this.dailyExpiresAt));
    localStorage.setItem('bb_trophies', String(this.trophies));
  }

  spendTrophies(amount) {
    const cost = Number(amount) || 0;
    if (cost <= 0 || this.trophies < cost) return false;
    this.trophies -= cost;
    this.saveQuests();
    this.updateUIBadge();
    return true;
  }

  onEvent(type, value = 1) {
    this.checkTimeExpiry();

    const numVal = Number(value) || 0;
    if (numVal <= 0 && type !== 'single_score') return;

    let changed = false;
    const processList = (list) => {
      for (const q of list) {
        if (q.claimed) continue;
        if (q.type === type) {
          const cur = Number(q.current) || 0;
          const target = Number(q.target) || 1;
          if (type === 'single_score' || type === 'max_combo') {
            const nextVal = Math.min(target, Math.max(cur, numVal));
            if (nextVal !== cur) {
              q.current = nextVal;
              changed = true;
            }
          } else {
            const nextVal = Math.min(target, cur + numVal);
            if (nextVal !== cur) {
              q.current = nextVal;
              changed = true;
            }
          }
        }
      }
    };

    processList(this.hourlyQuests);
    processList(this.dailyQuests);

    if (changed) {
      this.saveQuests();
      this.updateUIBadge();
      const modal = document.getElementById('questsModal');
      if (modal && !modal.classList.contains('hidden') && window.game && typeof window.game.renderQuestsModal === 'function') {
        window.game.renderQuestsModal();
      }
    }
  }

  hasUnclaimed() {
    return (
      this.hourlyQuests.some(q => (Number(q.current) || 0) >= (Number(q.target) || 1) && !q.claimed) ||
      this.dailyQuests.some(q => (Number(q.current) || 0) >= (Number(q.target) || 1) && !q.claimed)
    );
  }

  claim(questId, category = 'daily') {
    const list = category === 'hourly' ? this.hourlyQuests : this.dailyQuests;
    const q = list.find(item => item.id === questId);
    if (q && (Number(q.current) || 0) >= (Number(q.target) || 1) && !q.claimed) {
      q.claimed = true;
      this.trophies = (Number(this.trophies) || 0) + (Number(q.reward) || 10);
      this.saveQuests();
      this.updateUIBadge();
      return q.reward;
    }
    return 0;
  }

  updateUIBadge() {
    const badge = document.getElementById('questBadge');
    const trophyVal = document.getElementById('trophyCount');
    const modalTrophy = document.getElementById('modalTrophyCount');
    if (trophyVal) trophyVal.textContent = this.trophies;
    if (modalTrophy) modalTrophy.textContent = this.trophies;
    if (badge) {
      if (this.hasUnclaimed()) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }
}

window.questManager = new QuestManager();
