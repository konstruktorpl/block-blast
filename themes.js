// Visual Themes & High-Definition Block Renderer for Block Blast!

const THEMES = {
  classic: {
    id: 'classic',
    name: 'Классика Block Blast',
    subtitle: 'Оригинальный глянцевый 3D-стиль',
    bgGradient: 'linear-gradient(180deg, #2d3e8b 0%, #1c2863 55%, #141d4b 100%)',
    themeColor: '#253478',
    boardBg: '#121a3d',
    boardBorder: '#35489c',
    boardShadow: '0 14px 36px rgba(6, 10, 28, 0.65), inset 0 2px 6px rgba(0, 0, 0, 0.5)',
    cellEmpty: '#1b2654',
    cellEmptyBorder: '#151e45',
    cellHighlight: 'rgba(255, 255, 255, 0.14)',
    dockBg: 'rgba(18, 26, 61, 0.6)',
    dockBorder: 'rgba(72, 96, 198, 0.35)',
    textPrimary: '#ffffff',
    textAccent: '#ffd43b',
    styleType: 'bevel3d',
    palette: [
      { id: 'red',    base: '#f03e3e', top: '#ff8787', left: '#fa5252', right: '#c92a2a', bottom: '#a51111', inner: '#f03e3e', glow: '#ff6b6b' },
      { id: 'orange', base: '#f76707', top: '#ffa94d', left: '#fd7e14', right: '#d9480f', bottom: '#b43403', inner: '#f76707', glow: '#ff922b' },
      { id: 'yellow', base: '#f59f00', top: '#ffe066', left: '#fcc419', right: '#e67700', bottom: '#b85d00', inner: '#f59f00', glow: '#ffd43b' },
      { id: 'green',  base: '#37b24d', top: '#8ce99a', left: '#51cf66', right: '#2b8a3e', bottom: '#1b6528', inner: '#37b24d', glow: '#69db7c' },
      { id: 'cyan',   base: '#1098ad', top: '#66d9e8', left: '#22b8cf', right: '#0b7285', bottom: '#064e5c', inner: '#1098ad', glow: '#3bc9db' },
      { id: 'blue',   base: '#1c7ed6', top: '#74c0fc', left: '#339af0', right: '#1864ab', bottom: '#10477d', inner: '#1c7ed6', glow: '#4dabf7' },
      { id: 'purple', base: '#7950f2', top: '#b197fc', left: '#845ef7', right: '#5f3dc4', bottom: '#442799', inner: '#7950f2', glow: '#9775fa' }
    ]
  },

  neon: {
    id: 'neon',
    name: 'Неоновый Киберпанк',
    subtitle: 'Светящиеся лазерные блоки',
    bgGradient: 'linear-gradient(180deg, #0d081d 0%, #070610 60%, #05040a 100%)',
    themeColor: '#0b0719',
    boardBg: '#080711',
    boardBorder: '#2e1f5e',
    boardShadow: '0 0 34px rgba(121, 80, 242, 0.28), inset 0 0 18px rgba(0, 0, 0, 0.8)',
    cellEmpty: '#121024',
    cellEmptyBorder: '#1b1736',
    cellHighlight: 'rgba(0, 245, 212, 0.16)',
    dockBg: 'rgba(14, 12, 30, 0.72)',
    dockBorder: 'rgba(132, 94, 247, 0.35)',
    textPrimary: '#f8f9fa',
    textAccent: '#00f5d4',
    styleType: 'neon',
    palette: [
      { id: 'pink',   base: '#ff007f', top: '#ff85c1', left: '#ff4da6', right: '#b30059', bottom: '#660033', inner: '#2b051b', glow: '#ff2a95' },
      { id: 'cyan',   base: '#00f5d4', top: '#9bf6ff', left: '#56cfe1', right: '#00bbf9', bottom: '#0077b6', inner: '#042628', glow: '#00f5d4' },
      { id: 'lime',   base: '#70e000', top: '#ccff33', left: '#9ef01a', right: '#38b000', bottom: '#007200', inner: '#122603', glow: '#9ef01a' },
      { id: 'amber',  base: '#ffbe0b', top: '#ffea85', left: '#ffd13b', right: '#fb5607', bottom: '#a83800', inner: '#2b1d02', glow: '#ffbe0b' },
      { id: 'violet', base: '#9d4edd', top: '#e0aaff', left: '#c77dff', right: '#7b2cbf', bottom: '#3c096c', inner: '#1f0836', glow: '#c77dff' },
      { id: 'blue',   base: '#3a86ff', top: '#a2d2ff', left: '#6ea8fe', right: '#0050d5', bottom: '#00296b', inner: '#061838', glow: '#4ea8de' }
    ]
  },

  wood: {
    id: 'wood',
    name: 'Деревянная Классика',
    subtitle: 'Тёплое резное дерево и уют',
    bgGradient: 'linear-gradient(180deg, #4a3020 0%, #332014 60%, #24160d 100%)',
    themeColor: '#422a1b',
    boardBg: '#23150c',
    boardBorder: '#6e472b',
    boardShadow: '0 14px 36px rgba(0, 0, 0, 0.65), inset 0 3px 8px rgba(0, 0, 0, 0.7)',
    cellEmpty: '#311e12',
    cellEmptyBorder: '#24150c',
    cellHighlight: 'rgba(255, 216, 168, 0.16)',
    dockBg: 'rgba(35, 21, 12, 0.7)',
    dockBorder: 'rgba(138, 90, 54, 0.45)',
    textPrimary: '#fff4e6',
    textAccent: '#ffc078',
    styleType: 'wood',
    palette: [
      { id: 'oak',      base: '#d99b52', top: '#f2c58d', left: '#e6af6c', right: '#b37632', bottom: '#8c581c', inner: '#d6974e', glow: '#f2c58d' },
      { id: 'maple',    base: '#e3a857', top: '#f7d49c', left: '#ecc078', right: '#bf8233', bottom: '#94601b', inner: '#dfa352', glow: '#f7d49c' },
      { id: 'cherry',   base: '#b85239', top: '#e08268', left: '#cc684e', right: '#8f3722', bottom: '#692212', inner: '#b34e35', glow: '#e08268' },
      { id: 'walnut',   base: '#8c583a', top: '#b88463', left: '#a16d4d', right: '#693d23', bottom: '#4d2914', inner: '#875436', glow: '#b88463' },
      { id: 'cedar',    base: '#c77743', top: '#eba475', left: '#d98c59', right: '#9e5627', bottom: '#783d16', inner: '#c2723e', glow: '#eba475' },
      { id: 'pine',     base: '#c9a66b', top: '#ebd1a0', left: '#dbb981', right: '#9e7c44', bottom: '#785a2a', inner: '#c4a166', glow: '#ebd1a0' }
    ]
  },

  pastel: {
    id: 'pastel',
    name: 'Карамель (Пастель)',
    subtitle: 'Мягкие конфетные 3D-кубики',
    bgGradient: 'linear-gradient(180deg, #322c56 0%, #231e42 60%, #191530 100%)',
    themeColor: '#2c264c',
    boardBg: '#18142c',
    boardBorder: '#4c437a',
    boardShadow: '0 14px 34px rgba(10, 8, 22, 0.55), inset 0 2px 6px rgba(0, 0, 0, 0.4)',
    cellEmpty: '#241f3e',
    cellEmptyBorder: '#1b1730',
    cellHighlight: 'rgba(255, 255, 255, 0.14)',
    dockBg: 'rgba(26, 22, 48, 0.65)',
    dockBorder: 'rgba(116, 102, 184, 0.35)',
    textPrimary: '#ffffff',
    textAccent: '#ffdeeb',
    styleType: 'pastel',
    palette: [
      { id: 'coral',    base: '#ff8787', top: '#ffc9c9', left: '#ffa8a8', right: '#fa5252', bottom: '#e03131', inner: '#ff8787', glow: '#ffa8a8' },
      { id: 'peach',    base: '#ff922b', top: '#ffd8a8', left: '#ffa94d', right: '#f76707', bottom: '#d9480f', inner: '#ffa94d', glow: '#ffd8a8' },
      { id: 'lemon',    base: '#ffd43b', top: '#fff3bf', left: '#ffe066', right: '#fab005', bottom: '#f08c00', inner: '#ffe066', glow: '#fff3bf' },
      { id: 'mint',     base: '#63e6be', top: '#c3fae8', left: '#96f2d7', right: '#20c997', bottom: '#0ca678', inner: '#63e6be', glow: '#96f2d7' },
      { id: 'sky',      base: '#74c0fc', top: '#d0ebff', left: '#a5d8ff', right: '#339af0', bottom: '#1c7ed6', inner: '#74c0fc', glow: '#a5d8ff' },
      { id: 'lavender', base: '#b197fc', top: '#e5dbff', left: '#d0bfff', right: '#845ef7', bottom: '#6741d9', inner: '#b197fc', glow: '#d0bfff' }
    ]
  }
};

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Draws a single Block Blast cell with authentic 3D bevels, neon glow, wood grain, or candy finish.
 */
function drawStyledBlock(ctx, x, y, size, color, themeId = 'classic', opts = {}) {
  const {
    alpha = 1,
    pulse = 0, // 0..1 when a row/col is about to clear
    isGhost = false
  } = opts;

  const theme = THEMES[themeId] || THEMES.classic;
  const pad = Math.max(1, size * 0.035);
  const bx = x + pad;
  const by = y + pad;
  const bs = size - pad * 2;
  if (bs <= 2) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  const radius = Math.max(3, bs * 0.16);
  const bevel = Math.max(3, bs * 0.155);

  if (theme.styleType === 'neon') {
    // Neon Cyber Block
    roundRectPath(ctx, bx, by, bs, bs, radius);
    ctx.fillStyle = color.inner || '#110b22';
    ctx.fill();

    // Glowing border
    ctx.lineWidth = Math.max(2, bs * 0.09);
    ctx.strokeStyle = color.base;
    if (!isGhost) {
      ctx.shadowColor = color.glow || color.base;
      ctx.shadowBlur = bs * 0.28;
    }
    roundRectPath(ctx, bx + ctx.lineWidth * 0.5, by + ctx.lineWidth * 0.5, bs - ctx.lineWidth, bs - ctx.lineWidth, radius * 0.85);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner bright core
    const inset = bs * 0.24;
    roundRectPath(ctx, bx + inset, by + inset, bs - inset * 2, bs - inset * 2, radius * 0.45);
    ctx.fillStyle = color.base;
    ctx.globalAlpha = alpha * 0.85;
    ctx.fill();

    // Top-left specular highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = alpha * 0.5;
    roundRectPath(ctx, bx + inset + 2, by + inset + 2, (bs - inset * 2) * 0.45, (bs - inset * 2) * 0.22, 2);
    ctx.fill();
  } else if (theme.styleType === 'wood') {
    // Wood Block with beveled edges and subtle wood grain
    roundRectPath(ctx, bx, by, bs, bs, radius * 0.7);
    ctx.save();
    ctx.clip();

    // Base fill
    ctx.fillStyle = color.base;
    ctx.fillRect(bx, by, bs, bs);

    // Top trapezium
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bs, by);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bevel);
    ctx.closePath();
    ctx.fillStyle = color.top;
    ctx.fill();

    // Left trapezium
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx, by + bs);
    ctx.closePath();
    ctx.fillStyle = color.left;
    ctx.fill();

    // Right trapezium
    ctx.beginPath();
    ctx.moveTo(bx + bs, by);
    ctx.lineTo(bx + bs, by + bs);
    ctx.lineTo(bx + bs - bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.closePath();
    ctx.fillStyle = color.right;
    ctx.fill();

    // Bottom trapezium
    ctx.beginPath();
    ctx.moveTo(bx, by + bs);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bs - bevel);
    ctx.lineTo(bx + bs, by + bs);
    ctx.closePath();
    ctx.fillStyle = color.bottom;
    ctx.fill();

    // Center carved face
    const innerSize = bs - bevel * 2;
    roundRectPath(ctx, bx + bevel, by + bevel, innerSize, innerSize, 2);
    ctx.fillStyle = color.inner;
    ctx.fill();

    // Subtle wood grain lines
    ctx.strokeStyle = 'rgba(60, 30, 10, 0.16)';
    ctx.lineWidth = Math.max(1, bs * 0.035);
    ctx.beginPath();
    ctx.moveTo(bx + bevel + 2, by + bevel + innerSize * 0.33);
    ctx.bezierCurveTo(
      bx + bs * 0.4, by + bevel + innerSize * 0.26,
      bx + bs * 0.6, by + bevel + innerSize * 0.4,
      bx + bs - bevel - 2, by + bevel + innerSize * 0.34
    );
    ctx.moveTo(bx + bevel + 2, by + bevel + innerSize * 0.68);
    ctx.bezierCurveTo(
      bx + bs * 0.45, by + bevel + innerSize * 0.75,
      bx + bs * 0.65, by + bevel + innerSize * 0.62,
      bx + bs - bevel - 2, by + bevel + innerSize * 0.7
    );
    ctx.stroke();

    ctx.restore();
  } else {
    // Classic Block Blast 3D Gem Bevel & Pastel Candy
    roundRectPath(ctx, bx, by, bs, bs, radius);
    ctx.save();
    ctx.clip();

    // Base fill
    ctx.fillStyle = color.base;
    ctx.fillRect(bx, by, bs, bs);

    // Top bevel
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bs, by);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bevel);
    ctx.closePath();
    ctx.fillStyle = color.top;
    ctx.fill();

    // Left bevel
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx, by + bs);
    ctx.closePath();
    ctx.fillStyle = color.left;
    ctx.fill();

    // Right bevel
    ctx.beginPath();
    ctx.moveTo(bx + bs, by);
    ctx.lineTo(bx + bs, by + bs);
    ctx.lineTo(bx + bs - bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.closePath();
    ctx.fillStyle = color.right;
    ctx.fill();

    // Bottom bevel
    ctx.beginPath();
    ctx.moveTo(bx, by + bs);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bs - bevel);
    ctx.lineTo(bx + bs, by + bs);
    ctx.closePath();
    ctx.fillStyle = color.bottom;
    ctx.fill();

    // Inner face with subtle gradient
    const innerX = bx + bevel;
    const innerY = by + bevel;
    const innerS = bs - bevel * 2;
    const grad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerS);
    grad.addColorStop(0, color.left || color.base);
    grad.addColorStop(1, color.right || color.base);

    roundRectPath(ctx, innerX, innerY, innerS, innerS, Math.max(2, radius * 0.45));
    ctx.fillStyle = grad;
    ctx.fill();

    // Inner subtle rim light
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glossy top-left shine dot/bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.36)';
    roundRectPath(
      ctx,
      innerX + innerS * 0.12,
      innerY + innerS * 0.1,
      innerS * 0.45,
      innerS * 0.18,
      innerS * 0.09
    );
    ctx.fill();

    ctx.restore();
  }

  // If this cell is part of a row/column about to be cleared while dragging, draw a bright golden/white pulse!
  if (pulse > 0) {
    roundRectPath(ctx, bx, by, bs, bs, radius);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.32 + pulse * 0.38})`;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

window.THEMES = THEMES;
window.drawStyledBlock = drawStyledBlock;
window.roundRectPath = roundRectPath;
