// Global Online Leaderboard for Block Blast!
// Powered by Firebase Auth (Anonymous) + Cloud Firestore Enterprise Edition (Pipelines).
// Gracefully degrades offline and auto-syncs pending best scores when connectivity returns.

(function () {
  const FIREBASE_SDK_VERSION = '13.2.0';
  const FIREBASE_CONFIG = {
    projectId: 'blockblast-a8b17',
    appId: '1:450865751597:web:09476ca6b2dfb50cac7aa4',
    storageBucket: 'blockblast-a8b17.firebasestorage.app',
    apiKey: 'AIzaSyCm1xdsyJAsbNczK1P6YiIluEOSBzyqg2o',
    authDomain: 'blockblast-a8b17.firebaseapp.com',
    messagingSenderId: '450865751597'
  };
  const FIRESTORE_DATABASE_ID = 'blockblast-lb';
  const COLLECTION_NAME = 'leaderboard';
  const TOP_LIMIT = 50;

  class LeaderboardManager {
    constructor() {
      this.sdk = null;
      this.app = null;
      this.auth = null;
      this.db = null;
      this.user = null;
      this.initPromise = null;

      this.playerName = this.sanitizeName(localStorage.getItem('bb_player_name') || '');
      this.maxComboSeen = Math.max(1, parseInt(localStorage.getItem('bb_lb_max_combo') || '1', 10) || 1);
      this.gamesPlayedCount = Math.max(0, parseInt(localStorage.getItem('bb_lb_games') || '0', 10) || 0);
      this.lastSyncedSignature = localStorage.getItem('bb_lb_synced_sig') || '';

      this.cachedEntries = [];
      this.cachedRank = null;
      this.cachedAt = 0;
      this.lastError = null;
    }

    sanitizeName(raw) {
      const cleaned = String(raw || '')
        .replace(/[\r\n\t]+/g, ' ')
        .trim()
        .slice(0, 20);
      return cleaned;
    }

    getDefaultName(uid) {
      const suffix = uid ? uid.slice(-4).toUpperCase() : '0000';
      return `Игрок #${suffix}`;
    }

    getEffectiveName(uid) {
      if (this.playerName && this.playerName.length >= 1) {
        return this.playerName;
      }
      return this.getDefaultName(uid || (this.user && this.user.uid));
    }

    hasCustomName() {
      return Boolean(this.playerName && this.playerName.length >= 1);
    }

    setPlayerName(rawName) {
      const clean = this.sanitizeName(rawName);
      this.playerName = clean;
      if (clean) {
        localStorage.setItem('bb_player_name', clean);
      } else {
        localStorage.removeItem('bb_player_name');
      }
      return clean;
    }

    recordLocalProgress(score, maxCombo, gameIncrement = 0) {
      const safeScore = Math.max(0, Math.floor(Number(score) || 0));
      const safeCombo = Math.max(1, Math.min(999, Math.floor(Number(maxCombo) || 1)));
      if (safeCombo > this.maxComboSeen) {
        this.maxComboSeen = safeCombo;
        localStorage.setItem('bb_lb_max_combo', String(this.maxComboSeen));
      }
      if (gameIncrement > 0) {
        this.gamesPlayedCount += gameIncrement;
        localStorage.setItem('bb_lb_games', String(this.gamesPlayedCount));
      }
      const localBest = Math.max(
        safeScore,
        parseInt(localStorage.getItem('bb_best_score') || '0', 10) || 0
      );
      return {
        bestScore: localBest,
        maxCombo: this.maxComboSeen,
        gamesPlayed: this.gamesPlayedCount
      };
    }

    async ensureInitialized() {
      if (this.db && this.user) return true;
      if (this.initPromise) return this.initPromise;

      this.initPromise = (async () => {
        try {
          if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            throw new Error('offline');
          }

          const base = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
          const [appMod, authMod, fsMod] = await Promise.all([
            import(`${base}/firebase-app.js`),
            import(`${base}/firebase-auth.js`),
            import(`${base}/firebase-firestore-pipelines.js`)
          ]);

          this.sdk = { appMod, authMod, fsMod };
          const existingApps = appMod.getApps();
          this.app = existingApps.length > 0 ? existingApps[0] : appMod.initializeApp(FIREBASE_CONFIG);
          this.auth = authMod.getAuth(this.app);
          this.db = fsMod.getFirestore(this.app, FIRESTORE_DATABASE_ID);

          this.user = await new Promise((resolve, reject) => {
            let settled = false;
            const unsub = authMod.onAuthStateChanged(
              this.auth,
              async (user) => {
                if (settled) return;
                if (user) {
                  settled = true;
                  unsub();
                  resolve(user);
                } else {
                  try {
                    const cred = await authMod.signInAnonymously(this.auth);
                    settled = true;
                    unsub();
                    resolve(cred.user);
                  } catch (err) {
                    settled = true;
                    unsub();
                    reject(err);
                  }
                }
              },
              (err) => {
                if (settled) return;
                settled = true;
                unsub();
                reject(err);
              }
            );
          });

          this.lastError = null;
          return true;
        } catch (err) {
          this.lastError = err;
          return false;
        } finally {
          this.initPromise = null;
        }
      })();

      return this.initPromise;
    }

    async syncScore({ bestScore = null, maxCombo = null, force = false } = {}) {
      const localBest = Math.max(
        0,
        Math.floor(Number(bestScore ?? (localStorage.getItem('bb_best_score') || 0)) || 0)
      );
      const localCombo = Math.max(
        this.maxComboSeen,
        Math.floor(Number(maxCombo || 1) || 1)
      );
      if (localCombo > this.maxComboSeen) {
        this.maxComboSeen = Math.min(999, localCombo);
        localStorage.setItem('bb_lb_max_combo', String(this.maxComboSeen));
      }

      if (localBest <= 0) {
        return { synced: false, reason: 'zero_score' };
      }

      const ready = await this.ensureInitialized();
      if (!ready || !this.user || !this.db) {
        return { synced: false, reason: 'offline' };
      }

      const uid = this.user.uid;
      const name = this.getEffectiveName(uid);
      const desiredSig = `${uid}|${name}|${localBest}|${this.maxComboSeen}|${this.gamesPlayedCount}`;
      if (!force && desiredSig === this.lastSyncedSignature) {
        return { synced: true, skipped: true };
      }

      try {
        const { doc, getDocFromServer, setDoc, serverTimestamp } = this.sdk.fsMod;
        const ref = doc(this.db, COLLECTION_NAME, uid);
        const snap = await getDocFromServer(ref);
        const prev = snap.exists() ? snap.data() : null;

        const mergedBest = Math.min(50000000, Math.max(localBest, prev ? Number(prev.bestScore) || 0 : 0));
        const mergedCombo = Math.min(999, Math.max(this.maxComboSeen, prev ? Number(prev.maxCombo) || 1 : 1));
        const mergedGames = Math.min(1000000, Math.max(this.gamesPlayedCount, prev ? Number(prev.gamesPlayed) || 0 : 0));
        const finalName = this.hasCustomName()
          ? this.playerName
          : (prev && prev.name ? this.sanitizeName(prev.name) : '') || name;

        if (
          !force &&
          prev &&
          prev.name === finalName &&
          prev.bestScore === mergedBest &&
          prev.maxCombo === mergedCombo &&
          prev.gamesPlayed === mergedGames
        ) {
          this.lastSyncedSignature = `${uid}|${finalName}|${mergedBest}|${mergedCombo}|${mergedGames}`;
          localStorage.setItem('bb_lb_synced_sig', this.lastSyncedSignature);
          return { synced: true, skipped: true, entry: prev };
        }

        const payload = {
          uid,
          name: finalName,
          bestScore: mergedBest,
          maxCombo: mergedCombo,
          gamesPlayed: mergedGames,
          updatedAt: serverTimestamp()
        };

        await setDoc(ref, payload);

        if (mergedBest > localBest) {
          localStorage.setItem('bb_best_score', String(mergedBest));
        }
        this.maxComboSeen = mergedCombo;
        this.gamesPlayedCount = mergedGames;
        this.lastSyncedSignature = `${uid}|${finalName}|${mergedBest}|${mergedCombo}|${mergedGames}`;
        localStorage.setItem('bb_lb_synced_sig', this.lastSyncedSignature);
        this.lastError = null;

        return {
          synced: true,
          entry: { ...payload, bestScore: mergedBest, maxCombo: mergedCombo, gamesPlayed: mergedGames }
        };
      } catch (err) {
        this.lastError = err;
        return { synced: false, error: err };
      }
    }

    async fetchLeaderboard({ force = false } = {}) {
      const ready = await this.ensureInitialized();
      if (!ready || !this.user || !this.db) {
        return {
          ok: false,
          offline: true,
          entries: this.cachedEntries,
          myRank: this.cachedRank,
          myUid: this.user ? this.user.uid : null
        };
      }

      const now = Date.now();
      if (!force && this.cachedEntries.length > 0 && now - this.cachedAt < 8000) {
        return {
          ok: true,
          entries: this.cachedEntries,
          myRank: this.cachedRank,
          myUid: this.user.uid
        };
      }

      try {
        const { pipelines, doc, getDocFromServer } = this.sdk.fsMod;
        const { execute, field, countAll } = pipelines;

        const topPipe = this.db
          .pipeline()
          .collection(COLLECTION_NAME)
          .where(field('bestScore').greaterThan(0))
          .sort(field('bestScore').descending(), field('updatedAt').ascending())
          .limit(TOP_LIMIT);

        const [topSnap, mySnap] = await Promise.all([
          execute(topPipe),
          getDocFromServer(doc(this.db, COLLECTION_NAME, this.user.uid))
        ]);

        const entries = topSnap.results.map((r) => {
          const d = r.data();
          return {
            uid: d.uid || r.id,
            name: this.sanitizeName(d.name) || this.getDefaultName(d.uid || r.id),
            bestScore: Number(d.bestScore) || 0,
            maxCombo: Number(d.maxCombo) || 1,
            gamesPlayed: Number(d.gamesPlayed) || 0
          };
        });

        let myRank = null;
        const idxInTop = entries.findIndex((e) => e.uid === this.user.uid);
        if (idxInTop !== -1) {
          myRank = idxInTop + 1;
        } else if (mySnap.exists()) {
          const myData = mySnap.data();
          const myBest = Number(myData.bestScore) || 0;
          if (myBest > 0) {
            const rankPipe = this.db
              .pipeline()
              .collection(COLLECTION_NAME)
              .where(field('bestScore').greaterThan(myBest))
              .aggregate(countAll().as('higherCount'));
            const rankSnap = await execute(rankPipe);
            const higher = rankSnap.results[0] ? Number(rankSnap.results[0].data().higherCount) || 0 : 0;
            myRank = higher + 1;
          }
        }

        if (mySnap.exists()) {
          const d = mySnap.data();
          if (!this.hasCustomName() && d.name) {
            this.playerName = this.sanitizeName(d.name);
            if (this.playerName) localStorage.setItem('bb_player_name', this.playerName);
          }
        }

        this.cachedEntries = entries;
        this.cachedRank = myRank;
        this.cachedAt = now;
        this.lastError = null;

        return {
          ok: true,
          entries,
          myRank,
          myUid: this.user.uid
        };
      } catch (err) {
        this.lastError = err;
        return {
          ok: false,
          error: err,
          entries: this.cachedEntries,
          myRank: this.cachedRank,
          myUid: this.user ? this.user.uid : null
        };
      }
    }
  }

  window.LeaderboardManager = LeaderboardManager;
  window.leaderboardManager = new LeaderboardManager();
})();
