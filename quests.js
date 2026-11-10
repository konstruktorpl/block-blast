// Quests & Trophies System for Block Blast!
// Features Daily Quests (24h) and Flash Hourly Express Quests (1h) with live timers!
// Uncompleted quests strictly reset progress to 0 if the time limit expires!

class QuestManager {
  constructor() {
    this.trophies = parseInt(localStorage.getItem('bb_trophies') || '0', 10) || 0;

    const now = Date.now();
    const savedHourlyExpires = parseInt(localStorage.getItem('bb_hourly_expires_at'), 10);
    const savedDailyExpires = parseInt(localStorage.getItem('bb_daily_expires_at'), 10);

    this.hourlyExpiresAt = (!isNaN(savedHourlyExpires) && savedHourlyExpires > now)
      ? savedHourlyExpires
      : now + 3600 * 1000;

    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    this.dailyExpiresAt = (!isNaN(savedDailyExpires) && savedDailyExpires > now)
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

  // Express 1-hour fast quests (meaningful challenge for 1h window)
  getDefaultHourlyPool() {
    return [
      { id: 'exp_clear_20_lines', title: 'Очистить 20 линий', target: 20, reward: 20, type: 'lines_cleared' },
      { id: 'exp_combo_4', title: 'Достичь комбо x4', target: 4, reward: 25, type: 'max_combo' },
      { id: 'exp_score_2000', title: 'Набрать 2 000 очков в игре', target: 2000, reward: 25, type: 'single_score' },
      { id: 'exp_destroy_90_blocks', title: 'Уничтожить 90 блоков', target: 90, reward: 20, type: 'blocks_destroyed' },
      { id: 'exp_play_4_games', title: 'Сыграть 4 игры', target: 4, reward: 15, type: 'games_played' },
      { id: 'exp_clear_30_lines', title: 'Очистить 30 линий', target: 30, reward: 30, type: 'lines_cleared' },
      { id: 'exp_score_3000', title: 'Набрать 3 000 очков в игре', target: 3000, reward: 30, type: 'single_score' }
    ];
  }

  // Daily 24-hour quests (solid milestones throughout the day)
  getDefaultDailyPool() {
    return [
      { id: 'd_play_8_games', title: 'Сыграть 8 игр', target: 8, reward: 35, type: 'games_played' },
      { id: 'd_score_5000', title: 'Набрать 5 000 очков в игре', target: 5000, reward: 50, type: 'single_score' },
      { id: 'd_clear_60_lines', title: 'Очистить 60 линий', target: 60, reward: 45, type: 'lines_cleared' },
      { id: 'd_combo_6', title: 'Достичь комбо x6', target: 6, reward: 50, type: 'max_combo' },
      { id: 'd_destroy_250_blocks', title: 'Уничтожить 250 блоков', target: 250, reward: 45, type: 'blocks_destroyed' },
      { id: 'd_all_clear_1', title: 'Сделать «Чистое поле»', target: 1, reward: 60, type: 'all_clear' },
      { id: 'd_clear_90_lines', title: 'Очистить 90 линий', target: 90, reward: 60, type: 'lines_cleared' }
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
    const savedDailyData = localStorage.getItem('bb_daily_quests_v3') || localStorage.getItem('bb_daily_quests_v2');
    const savedHourlyData = localStorage.getItem('bb_hourly_quests_v3') || localStorage.getItem('bb_hourly_quests_v2');

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
    localStorage.setItem('bb_daily_quests_v3', JSON.stringify(this.dailyQuests));
    localStorage.setItem('bb_hourly_quests_v3', JSON.stringify(this.hourlyQuests));
    localStorage.setItem('bb_hourly_expires_at', String(this.hourlyExpiresAt));
    localStorage.setItem('bb_daily_expires_at', String(this.dailyExpiresAt));
    localStorage.setItem('bb_trophies', String(this.trophies));
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
