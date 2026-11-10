// Quests & Trophies System for Block Blast!
// Features Daily Quests (24h) and Flash Hourly Quests (1h) with live timers!

class QuestManager {
  constructor() {
    this.trophies = parseInt(localStorage.getItem('bb_trophies') || '0', 10) || 0;

    this.dailyKey = this.getTodayKey();
    this.hourlyKey = this.getCurrentHourKey();

    this.dailyQuests = [];
    this.hourlyQuests = [];

    this.loadQuests();
  }

  getTodayKey() {
    const d = new Date();
    return `d_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
  }

  getCurrentHourKey() {
    const d = new Date();
    return `h_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}_${d.getHours()}`;
  }

  getRemainingHourSeconds() {
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
    return Math.max(0, Math.floor((nextHour - now) / 1000));
  }

  getRemainingDaySeconds() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return Math.max(0, Math.floor((tomorrow - now) / 1000));
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

  // Flash 1-hour fast quests
  getDefaultHourlyPool() {
    return [
      { id: 'h_clear_5_lines', title: 'Очистить 5 линий', target: 5, reward: 8, type: 'lines_cleared' },
      { id: 'h_combo_2', title: 'Достичь комбо x2', target: 2, reward: 8, type: 'max_combo' },
      { id: 'h_score_400', title: 'Набрать 400 очков в игре', target: 400, reward: 10, type: 'single_score' },
      { id: 'h_destroy_25_blocks', title: 'Уничтожить 25 блоков', target: 25, reward: 8, type: 'blocks_destroyed' },
      { id: 'h_play_1_game', title: 'Сыграть 1 игру', target: 1, reward: 5, type: 'games_played' },
      { id: 'h_clear_8_lines', title: 'Очистить 8 линий', target: 8, reward: 12, type: 'lines_cleared' },
      { id: 'h_score_600', title: 'Набрать 600 очков в игре', target: 600, reward: 12, type: 'single_score' }
    ];
  }

  getDefaultDailyPool() {
    return [
      { id: 'play_3_games', title: 'Сыграть 3 игры', target: 3, reward: 15, type: 'games_played' },
      { id: 'score_1000', title: 'Набрать 1 000 очков в игре', target: 1000, reward: 25, type: 'single_score' },
      { id: 'clear_20_lines', title: 'Очистить 20 линий', target: 20, reward: 20, type: 'lines_cleared' },
      { id: 'combo_3', title: 'Достичь комбо x3', target: 3, reward: 20, type: 'max_combo' },
      { id: 'destroy_60_blocks', title: 'Уничтожить 60 блоков', target: 60, reward: 20, type: 'blocks_destroyed' },
      { id: 'all_clear_1', title: 'Сделать «Чистое поле»', target: 1, reward: 40, type: 'all_clear' }
    ];
  }

  checkTimeExpiry() {
    let changed = false;
    const curHour = this.getCurrentHourKey();
    if (curHour !== this.hourlyKey) {
      this.hourlyKey = curHour;
      this.initHourlyQuests();
      changed = true;
    }

    const curDay = this.getTodayKey();
    if (curDay !== this.dailyKey) {
      this.dailyKey = curDay;
      this.initDailyQuests();
      changed = true;
    }

    return changed;
  }

  loadQuests() {
    // 1. Daily Quests
    const savedDailyKey = localStorage.getItem('bb_daily_key');
    const savedDailyData = localStorage.getItem('bb_daily_quests');

    if (savedDailyKey === this.dailyKey && savedDailyData) {
      try {
        const parsed = JSON.parse(savedDailyData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.dailyQuests = parsed.map(q => ({
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
    const savedHourlyKey = localStorage.getItem('bb_hourly_key');
    const savedHourlyData = localStorage.getItem('bb_hourly_quests');

    if (savedHourlyKey === this.hourlyKey && savedHourlyData) {
      try {
        const parsed = JSON.parse(savedHourlyData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.hourlyQuests = parsed.map(q => ({
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
    this.dailyQuests = shuffled.slice(0, 3).map(q => ({
      ...q,
      current: 0,
      claimed: false
    }));
    localStorage.setItem('bb_daily_key', this.dailyKey);
    this.saveQuests();
  }

  initHourlyQuests() {
    const pool = this.getDefaultHourlyPool();
    const shuffled = pool.sort(() => 0.5 - Math.random());
    this.hourlyQuests = shuffled.slice(0, 2).map(q => ({
      ...q,
      current: 0,
      claimed: false
    }));
    localStorage.setItem('bb_hourly_key', this.hourlyKey);
    this.saveQuests();
  }

  saveQuests() {
    localStorage.setItem('bb_daily_quests', JSON.stringify(this.dailyQuests));
    localStorage.setItem('bb_hourly_quests', JSON.stringify(this.hourlyQuests));
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
