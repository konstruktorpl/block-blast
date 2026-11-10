// Quests & Trophies System for Block Blast!

class QuestManager {
  constructor() {
    this.trophies = parseInt(localStorage.getItem('bb_trophies') || '0', 10) || 0;

    this.dailyKey = this.getTodayKey();
    this.weeklyKey = this.getCurrentWeekKey();

    this.dailyQuests = [];
    this.weeklyQuests = [];

    this.loadQuests();
  }

  getTodayKey() {
    const d = new Date();
    return `d_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
  }

  getCurrentWeekKey() {
    const d = new Date();
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return `w_${d.getFullYear()}_${week}`;
  }

  getDefaultDailyPool() {
    return [
      { id: 'play_3_games', title: 'Сыграть 3 игры', target: 3, reward: 10, type: 'games_played' },
      { id: 'score_1000', title: 'Набрать 1 000 очков в игре', target: 1000, reward: 20, type: 'single_score' },
      { id: 'clear_15_lines', title: 'Очистить 15 линий', target: 15, reward: 15, type: 'lines_cleared' },
      { id: 'combo_3', title: 'Достичь комбо x3', target: 3, reward: 15, type: 'max_combo' },
      { id: 'destroy_40_blocks', title: 'Уничтожить 40 блоков', target: 40, reward: 15, type: 'blocks_destroyed' }
    ];
  }

  getDefaultWeeklyPool() {
    return [
      { id: 'play_15_games', title: 'Сыграть 15 игр', target: 15, reward: 40, type: 'games_played' },
      { id: 'score_3000', title: 'Набрать 3 000 очков в игре', target: 3000, reward: 50, type: 'single_score' },
      { id: 'clear_60_lines', title: 'Очистить 60 линий', target: 60, reward: 60, type: 'lines_cleared' },
      { id: 'combo_5', title: 'Достичь комбо x5', target: 5, reward: 50, type: 'max_combo' },
      { id: 'all_clear_1', title: 'Сделать «Чистое поле»', target: 1, reward: 70, type: 'all_clear' }
    ];
  }

  loadQuests() {
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

    const savedWeeklyKey = localStorage.getItem('bb_weekly_key');
    const savedWeeklyData = localStorage.getItem('bb_weekly_quests');

    if (savedWeeklyKey === this.weeklyKey && savedWeeklyData) {
      try {
        const parsed = JSON.parse(savedWeeklyData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.weeklyQuests = parsed.map(q => ({
            ...q,
            current: Number(q.current) || 0,
            target: Number(q.target) || 1,
            reward: Number(q.reward) || 40,
            claimed: Boolean(q.claimed)
          }));
        } else {
          this.initWeeklyQuests();
        }
      } catch (e) {
        this.initWeeklyQuests();
      }
    } else {
      this.initWeeklyQuests();
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

  initWeeklyQuests() {
    const pool = this.getDefaultWeeklyPool();
    const shuffled = pool.sort(() => 0.5 - Math.random());
    this.weeklyQuests = shuffled.slice(0, 3).map(q => ({
      ...q,
      current: 0,
      claimed: false
    }));
    localStorage.setItem('bb_weekly_key', this.weeklyKey);
    this.saveQuests();
  }

  saveQuests() {
    localStorage.setItem('bb_daily_quests', JSON.stringify(this.dailyQuests));
    localStorage.setItem('bb_weekly_quests', JSON.stringify(this.weeklyQuests));
    localStorage.setItem('bb_trophies', String(this.trophies));
  }

  onEvent(type, value = 1) {
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

    processList(this.dailyQuests);
    processList(this.weeklyQuests);

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
      this.dailyQuests.some(q => (Number(q.current) || 0) >= (Number(q.target) || 1) && !q.claimed) ||
      this.weeklyQuests.some(q => (Number(q.current) || 0) >= (Number(q.target) || 1) && !q.claimed)
    );
  }

  claim(questId, isWeekly = false) {
    const list = isWeekly ? this.weeklyQuests : this.dailyQuests;
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
