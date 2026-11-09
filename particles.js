// Juicy Particle, Shatter & Combo Callout FX System for Block Blast!

class FXManager {
  constructor() {
    this.particles = [];
    this.lineBeams = [];
    this.poppingCells = [];
    this.floatingTexts = [];
    this.banners = [];
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
  }

  triggerShake(magnitude = 6, duration = 0.22) {
    this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  spawnCellShatter(cx, cy, cellSize, colorObj, delay = 0) {
    this.poppingCells.push({
      cx,
      cy,
      size: cellSize,
      colorObj,
      delay,
      age: 0,
      duration: 0.22,
      spawnedDebris: false
    });
  }

  spawnDebrisBurst(cx, cy, cellSize, colorObj) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
      const speed = (cellSize * 2.2) + Math.random() * (cellSize * 3.8);
      this.particles.push({
        x: cx + (Math.random() - 0.5) * (cellSize * 0.35),
        y: cy + (Math.random() - 0.5) * (cellSize * 0.35),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - cellSize * 1.4,
        gravity: cellSize * 11.5,
        size: cellSize * (0.16 + Math.random() * 0.16),
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 14,
        color: i % 3 === 0 ? '#ffffff' : (i % 2 === 0 ? colorObj.top : colorObj.base),
        glow: colorObj.glow || colorObj.base,
        age: 0,
        life: 0.45 + Math.random() * 0.28,
        shape: i % 4 === 0 ? 'star' : 'cube'
      });
    }
  }

  spawnLineBeam(x, y, w, h, colorHex) {
    this.lineBeams.push({
      x,
      y,
      w,
      h,
      color: colorHex || '#ffffff',
      age: 0,
      life: 0.32
    });
  }

  spawnFloatingScore(x, y, text, color = '#ffd43b', scale = 1) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      scale,
      age: 0,
      life: 0.95
    });
  }

  spawnBanner(title, subtitle = '', color = '#ffd43b') {
    // Replace older banner if too many
    if (this.banners.length > 1) {
      this.banners.shift();
    }
    this.banners.push({
      title,
      subtitle,
      color,
      age: 0,
      life: 1.25
    });
  }

  update(dt) {
    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
      if (this.shakeTime === 0) this.shakeMagnitude = 0;
    }

    // Update popping cells (delayed ripple along cleared rows/columns)
    for (let i = this.poppingCells.length - 1; i >= 0; i--) {
      const pc = this.poppingCells[i];
      if (pc.delay > 0) {
        pc.delay -= dt;
        continue;
      }
      if (!pc.spawnedDebris) {
        pc.spawnedDebris = true;
        this.spawnDebrisBurst(pc.cx, pc.cy, pc.size, pc.colorObj);
      }
      pc.age += dt;
      if (pc.age >= pc.duration) {
        this.poppingCells.splice(i, 1);
      }
    }

    // Update line beams
    for (let i = this.lineBeams.length - 1; i >= 0; i--) {
      const b = this.lineBeams[i];
      b.age += dt;
      if (b.age >= b.life) {
        this.lineBeams.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.age += dt;
      ft.y -= 48 * dt;
      if (ft.age >= ft.life) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update banners
    for (let i = this.banners.length - 1; i >= 0; i--) {
      const bn = this.banners[i];
      bn.age += dt;
      if (bn.age >= bn.life) {
        this.banners.splice(i, 1);
      }
    }
  }

  draw(ctx, canvasWidth, boardCenterY, themeId) {
    // 1. Line laser beams
    for (const b of this.lineBeams) {
      const t = b.age / b.life;
      const alpha = Math.max(0, 1 - t);
      ctx.save();
      ctx.globalAlpha = alpha * 0.75;
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 18;
      window.roundRectPath(ctx, b.x, b.y, b.w, b.h, 8);
      ctx.fill();
      ctx.restore();
    }

    // 2. Popping cells (scale up + white flash before vanishing)
    for (const pc of this.poppingCells) {
      const t = Math.max(0, pc.age / pc.duration);
      const scale = pc.delay > 0 ? 1 : (1 + Math.sin(t * Math.PI) * 0.32);
      const alpha = pc.delay > 0 ? 1 : Math.max(0, 1 - t);
      const s = pc.size * scale;
      window.drawStyledBlock(
        ctx,
        pc.cx - s / 2,
        pc.cy - s / 2,
        s,
        pc.colorObj,
        themeId,
        { alpha, pulse: 1 - t }
      );
    }

    // 3. Shattered 3D cube & sparkle particles
    for (const p of this.particles) {
      const t = p.age / p.life;
      const alpha = Math.max(0, 1 - t * t);
      const s = p.size * (1 - t * 0.35);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.glow;
      ctx.shadowBlur = 6;

      if (p.shape === 'star') {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
        ctx.fill();
      } else {
        window.roundRectPath(ctx, -s / 2, -s / 2, s, s, Math.max(2, s * 0.22));
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillRect(-s * 0.3, -s * 0.3, s * 0.35, s * 0.22);
      }
      ctx.restore();
    }

    // 4. Floating score popups
    for (const ft of this.floatingTexts) {
      const t = ft.age / ft.life;
      const elastic = t < 0.2 ? (t / 0.2) * 1.15 : 1.15 - (t - 0.2) * 0.2;
      const alpha = t > 0.65 ? Math.max(0, 1 - (t - 0.65) / 0.35) : 1;

      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(elastic * ft.scale, elastic * ft.scale);
      ctx.globalAlpha = alpha;
      ctx.font = '800 26px "Baloo 2", "Nunito", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(10, 14, 38, 0.85)';
      ctx.strokeText(ft.text, 0, 0);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }

    // 5. Big Combo & Praise Banners ("COMBO x3!", "UNBELIEVABLE!")
    for (const bn of this.banners) {
      const t = bn.age / bn.life;
      let scale = 1;
      if (t < 0.16) {
        const p = t / 0.16;
        scale = 0.3 + Math.sin(p * Math.PI * 0.65) * 0.88;
      } else if (t > 0.78) {
        scale = 1 + ((t - 0.78) / 0.22) * 0.2;
      }
      const alpha = t > 0.75 ? Math.max(0, 1 - (t - 0.75) / 0.25) : 1;
      const yOffset = -t * 26;

      ctx.save();
      ctx.translate(canvasWidth / 2, boardCenterY + yOffset);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Title
      ctx.font = '800 36px "Baloo 2", "Nunito", -apple-system, sans-serif';
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(8, 12, 34, 0.92)';
      ctx.strokeText(bn.title, 0, 0);

      const grad = ctx.createLinearGradient(0, -18, 0, 18);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.45, bn.color);
      grad.addColorStop(1, '#ff922b');
      ctx.fillStyle = grad;
      ctx.fillText(bn.title, 0, 0);

      if (bn.subtitle) {
        ctx.font = '800 19px "Baloo 2", "Nunito", -apple-system, sans-serif';
        ctx.lineWidth = 5;
        ctx.strokeText(bn.subtitle, 0, 32);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(bn.subtitle, 0, 32);
      }

      ctx.restore();
    }
  }
}

window.FXManager = FXManager;
