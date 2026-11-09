// Visual Themes & High-Definition Block Renderer for Block Blast!

const THEMES = {
  classic: {
    id: 'classic',
    name: 'Классика',
    subtitle: 'Как в оригинальном Block Blast',
    bgGradient: 'linear-gradient(180deg, #4766b4 0%, #3f5aa5 100%)',
    themeColor: '#4766b4',
    boardBg: '#1f2749',
    boardBorder: '#1a2140',
    boardShadow: 'none',
    cellEmpty: '#1f2749',
    cellEmptyBorder: '#161c37',
    cellHighlight: 'rgba(255, 255, 255, 0.14)',
    dockBg: 'transparent',
    dockBorder: 'transparent',
    textPrimary: '#ffffff',
    textAccent: '#ffc633',
    styleType: 'bevel3d',
    palette: [
      { id: 'red',    base: '#e5484d', top: '#f58b8e', left: '#ec6468', right: '#c23338', bottom: '#a3262b', inner: '#e5484d', glow: '#f58b8e' },
      { id: 'orange', base: '#f07a2a', top: '#f9a868', left: '#f48d45', right: '#d0611a', bottom: '#ad4f12', inner: '#f07a2a', glow: '#f9a868' },
      { id: 'yellow', base: '#f5b72e', top: '#fcd875', left: '#f8c64c', right: '#d99a17', bottom: '#b9800c', inner: '#f5b72e', glow: '#fcd875' },
      { id: 'green',  base: '#4dc35a', top: '#8ae394', left: '#66d072', right: '#36a243', bottom: '#288535', inner: '#4dc35a', glow: '#8ae394' },
      { id: 'cyan',   base: '#34bfe0', top: '#7ddcf0', left: '#52cbe7', right: '#229fbe', bottom: '#1a84a0', inner: '#34bfe0', glow: '#7ddcf0' },
      { id: 'blue',   base: '#4a6ee0', top: '#8aa5f0', left: '#6385e8', right: '#3555c0', bottom: '#2742a2', inner: '#4a6ee0', glow: '#8aa5f0' },
      { id: 'purple', base: '#9461d9', top: '#bf9aee', left: '#a87ae3', right: '#7a49bb', bottom: '#62379d', inner: '#9461d9', glow: '#bf9aee' }
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
  w = Math.max(0, w);
  h = Math.max(0, h);
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
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
  const pad = Math.max(0.5, size * 0.018);
  const bx = x + pad;
  const by = y + pad;
  const bs = size - pad * 2;
  if (bs < 4) return;

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
    // Classic Block Blast flat bevel (sharp square block)
    const bevel = Math.max(2, bs * 0.13);
    roundRectPath(ctx, bx, by, bs, bs, theme.styleType === 'bevel3d' ? Math.max(1, bs * 0.05) : radius);
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

    // Inner face: flat color, like the original game
    const innerX = bx + bevel;
    const innerY = by + bevel;
    const innerS = bs - bevel * 2;
    ctx.fillStyle = color.base;
    ctx.fillRect(innerX, innerY, innerS, innerS);

    // Thin dark outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, by + 0.5, bs - 1, bs - 1);

    ctx.restore();
  }

  // Row/column about to be cleared while dragging: soft light overlay
  if (pulse > 0) {
    roundRectPath(ctx, bx, by, bs, bs, theme.styleType === 'bevel3d' ? 2 : radius);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.12 + pulse * 0.18})`;
    ctx.fill();
  }

  ctx.restore();
}

window.THEMES = THEMES;
window.drawStyledBlock = drawStyledBlock;
window.roundRectPath = roundRectPath;
