// Quests & Trophies System for Block Blast!

class QuestManager {
  constructor() {
    this.trophies = parseInt(localStorage.getItem('bb_trophies') || '0', 10);
    this.unlockedEffects = JSON.parse(localStorage.getItem('bb_unlocked_effects') || '["cubes"]');
    this.selectedEffect = localStorage.getItem('bb_selected_effect') || 'cubes';

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
        this.dailyQuests = JSON.parse(savedDailyData);
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
        this.weeklyQuests = JSON.parse(savedWeeklyData);
      } catch (e) {
        this.initWeeklyQuests();
      }
    } else {
      this.initWeeklyQuests();
    }
  }

  initDailyQuests() {
    const pool = this.getDefaultDailyPool();
    // Pick 3 random quests
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
    localStorage.setItem('bb_unlocked_effects', JSON.stringify(this.unlockedEffects));
    localStorage.setItem('bb_selected_effect', this.selectedEffect);
  }

  onEvent(type, value = 1) {
    let changed = false;
    const processList = (list) => {
      for (const q of list) {
        if (q.claimed) continue;
        if (q.type === type) {
          if (type === 'single_score' || type === 'max_combo') {
            if (value > q.current) {
              q.current = Math.min(q.target, value);
              changed = true;
            }
          } else {
            q.current = Math.min(q.target, q.current + value);
            changed = true;
          }
        }
      }
    };

    processList(this.dailyQuests);
    processList(this.weeklyQuests);

    if (changed) {
      this.saveQuests();
      this.updateUIBadge();
    }
  }

  hasUnclaimed() {
    return (
      this.dailyQuests.some(q => q.current >= q.target && !q.claimed) ||
      this.weeklyQuests.some(q => q.current >= q.target && !q.claimed)
    );
  }

  claim(questId, isWeekly = false) {
    const list = isWeekly ? this.weeklyQuests : this.dailyQuests;
    const q = list.find(item => item.id === questId);
    if (q && q.current >= q.target && !q.claimed) {
      q.claimed = true;
      this.trophies += q.reward;
      this.saveQuests();
      this.updateUIBadge();
      return q.reward;
    }
    return 0;
  }

  unlockEffect(effectId, cost) {
    if (this.trophies >= cost && !this.unlockedEffects.includes(effectId)) {
      this.trophies -= cost;
      this.unlockedEffects.push(effectId);
      this.selectedEffect = effectId;
      this.saveQuests();
      this.updateUIBadge();
      return true;
    }
    return false;
  }

  selectEffect(effectId) {
    if (this.unlockedEffects.includes(effectId)) {
      this.selectedEffect = effectId;
      this.saveQuests();
      return true;
    }
    return false;
  }

  updateUIBadge() {
    const badge = document.getElementById('questBadge');
    const trophyVal = document.getElementById('trophyCount');
    if (trophyVal) trophyVal.textContent = this.trophies;
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
