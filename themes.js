// Dynamic Background & Block Palettes that cycle infinitely during gameplay (every 400 points)
const DYNAMIC_PALETTES = [
  {
    name: 'Classic Indigo',
    bgGradient: 'linear-gradient(180deg, #4766b4 0%, #3f5aa5 100%)',
    themeColor: '#4766b4',
    boardBg: '#1f2749',
    boardBorder: '#1a2140',
    cellEmpty: '#1f2749',
    cellEmptyBorder: '#161c37',
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
  {
    name: 'Deep Purple & Neon Pastels',
    bgGradient: 'linear-gradient(180deg, #5c3c92 0%, #462878 100%)',
    themeColor: '#5c3c92',
    boardBg: '#281a44',
    boardBorder: '#201338',
    cellEmpty: '#281a44',
    cellEmptyBorder: '#1d1133',
    palette: [
      { id: 'magenta', base: '#e64980', top: '#faa2c1', left: '#f783ac', right: '#c2255c', bottom: '#9c1444', inner: '#e64980', glow: '#faa2c1' },
      { id: 'lime',    base: '#82c91e', top: '#c0eb75', left: '#a9e34b', right: '#5c940d', bottom: '#3e6605', inner: '#82c91e', glow: '#c0eb75' },
      { id: 'gold',    base: '#fcc419', top: '#ffe066', left: '#ffd43b', right: '#e67700', bottom: '#b85d00', inner: '#fcc419', glow: '#ffe066' },
      { id: 'cyan',    base: '#15aabf', top: '#66d9e8', left: '#22b8cf', right: '#0c8599', bottom: '#086373', inner: '#15aabf', glow: '#66d9e8' },
      { id: 'coral',   base: '#ff6b6b', top: '#ffa8a8', left: '#ff8787', right: '#e03131', bottom: '#b02020', inner: '#ff6b6b', glow: '#ffa8a8' },
      { id: 'violet',  base: '#7950f2', top: '#b197fc', left: '#845ef7', right: '#5f3dc4', bottom: '#442799', inner: '#7950f2', glow: '#b197fc' },
      { id: 'teal',    base: '#12b886', top: '#63e6be', left: '#20c997', right: '#099268', bottom: '#066849', inner: '#12b886', glow: '#63e6be' }
    ]
  },
  {
    name: 'Ocean Teal & Marine Jewels',
    bgGradient: 'linear-gradient(180deg, #1b7b8a 0%, #13606c 100%)',
    themeColor: '#1b7b8a',
    boardBg: '#0f3c44',
    boardBorder: '#0b2e34',
    cellEmpty: '#0f3c44',
    cellEmptyBorder: '#082328',
    palette: [
      { id: 'amber',   base: '#f59f00', top: '#ffe066', left: '#fcc419', right: '#d97706', bottom: '#b45309', inner: '#f59f00', glow: '#fde68a' },
      { id: 'emerald', base: '#10b981', top: '#6ee7b7', left: '#34d399', right: '#059669', bottom: '#047857', inner: '#10b981', glow: '#a7f3d0' },
      { id: 'cyan',    base: '#06b6d4', top: '#67e8f9', left: '#22d3ee', right: '#0891b2', bottom: '#0e7490', inner: '#06b6d4', glow: '#cffafe' },
      { id: 'pink',    base: '#f43f5e', top: '#fda4af', left: '#fb7185', right: '#e11d48', bottom: '#be123c', inner: '#f43f5e', glow: '#fecdd3' },
      { id: 'purple',  base: '#8b5cf6', top: '#c4b5fd', left: '#a78bfa', right: '#7c3aed', bottom: '#6d28d9', inner: '#8b5cf6', glow: '#ddd6fe' },
      { id: 'orange',  base: '#f97316', top: '#fdba74', left: '#fb923c', right: '#ea580c', bottom: '#c2410c', inner: '#f97316', glow: '#fed7aa' }
    ]
  },
  {
    name: 'Sunset Crimson & Warm Gems',
    bgGradient: 'linear-gradient(180deg, #9e375f 0%, #80274a 100%)',
    themeColor: '#9e375f',
    boardBg: '#471429',
    boardBorder: '#380e20',
    cellEmpty: '#471429',
    cellEmptyBorder: '#2a0917',
    palette: [
      { id: 'yellow',  base: '#eab308', top: '#fde047', left: '#facc15', right: '#ca8a04', bottom: '#a16207', inner: '#eab308', glow: '#fef08a' },
      { id: 'orange',  base: '#ea580c', top: '#fb923c', left: '#f97316', right: '#c2410c', bottom: '#9a3412', inner: '#ea580c', glow: '#ffedd5' },
      { id: 'ruby',    base: '#e11d48', top: '#fb7185', left: '#f43f5e', right: '#be123c', bottom: '#9f1239', inner: '#e11d48', glow: '#ffe4e6' },
      { id: 'cyan',    base: '#0284c7', top: '#38bdf8', left: '#0ea5e9', right: '#0369a1', bottom: '#075985', inner: '#0284c7', glow: '#bae6fd' },
      { id: 'lime',    base: '#65a30d', top: '#a3e635', left: '#84cc16', right: '#4d7c0f', bottom: '#3f6212', inner: '#65a30d', glow: '#d9f99d' },
      { id: 'violet',  base: '#7c3aed', top: '#a78bfa', left: '#8b5cf6', right: '#6d28d9', bottom: '#5b21b6', inner: '#7c3aed', glow: '#ede9fe' }
    ]
  },
  {
    name: 'Emerald Forest & Mint Radiance',
    bgGradient: 'linear-gradient(180deg, #2d7a52 0%, #205c3c 100%)',
    themeColor: '#2d7a52',
    boardBg: '#143d27',
    boardBorder: '#0e2d1c',
    cellEmpty: '#143d27',
    cellEmptyBorder: '#091f13',
    palette: [
      { id: 'gold',    base: '#eab308', top: '#fef08a', left: '#fde047', right: '#ca8a04', bottom: '#854d0e', inner: '#eab308', glow: '#fef9c3' },
      { id: 'mint',    base: '#14b8a6', top: '#5eead4', left: '#2dd4bf', right: '#0f766e', bottom: '#115e59', inner: '#14b8a6', glow: '#ccfbf1' },
      { id: 'orange',  base: '#f97316', top: '#fed7aa', left: '#fb923c', right: '#ea580c', bottom: '#9a3412', inner: '#f97316', glow: '#ffedd5' },
      { id: 'cyan',    base: '#06b6d4', top: '#a5f3fc', left: '#22d3ee', right: '#0891b2', bottom: '#155e75', inner: '#06b6d4', glow: '#cffafe' },
      { id: 'pink',    base: '#ec4899', top: '#fbcfe8', left: '#f472b6', right: '#db2777', bottom: '#9d174d', inner: '#ec4899', glow: '#fce7f3' },
      { id: 'purple',  base: '#a855f7', top: '#e9d5ff', left: '#c084fc', right: '#9333ea', bottom: '#6b21a8', inner: '#a855f7', glow: '#f3e8ff' }
    ]
  }
];

window.DYNAMIC_PALETTES = DYNAMIC_PALETTES;

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
    pulse = 0,
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

  if (theme.styleType === 'neon') {
    roundRectPath(ctx, bx, by, bs, bs, radius);
    ctx.fillStyle = color.inner || '#110b22';
    ctx.fill();

    ctx.lineWidth = Math.max(2, bs * 0.09);
    ctx.strokeStyle = color.base;
    if (!isGhost) {
      ctx.shadowColor = color.glow || color.base;
      ctx.shadowBlur = bs * 0.28;
    }
    roundRectPath(ctx, bx + ctx.lineWidth * 0.5, by + ctx.lineWidth * 0.5, bs - ctx.lineWidth, bs - ctx.lineWidth, radius * 0.85);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const inset = bs * 0.24;
    roundRectPath(ctx, bx + inset, by + inset, bs - inset * 2, bs - inset * 2, radius * 0.45);
    ctx.fillStyle = color.base;
    ctx.globalAlpha = alpha * 0.85;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = alpha * 0.5;
    roundRectPath(ctx, bx + inset + 2, by + inset + 2, (bs - inset * 2) * 0.45, (bs - inset * 2) * 0.22, 2);
    ctx.fill();
  } else if (theme.styleType === 'wood') {
    roundRectPath(ctx, bx, by, bs, bs, radius * 0.7);
    ctx.save();
    ctx.clip();

    ctx.fillStyle = color.base;
    ctx.fillRect(bx, by, bs, bs);

    const bevel = Math.max(3, bs * 0.155);

    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bs, by);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bevel);
    ctx.closePath();
    ctx.fillStyle = color.top;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx, by + bs);
    ctx.closePath();
    ctx.fillStyle = color.left;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bx + bs, by);
    ctx.lineTo(bx + bs, by + bs);
    ctx.lineTo(bx + bs - bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.closePath();
    ctx.fillStyle = color.right;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bx, by + bs);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bs - bevel);
    ctx.lineTo(bx + bs, by + bs);
    ctx.closePath();
    ctx.fillStyle = color.bottom;
    ctx.fill();

    const innerSize = bs - bevel * 2;
    roundRectPath(ctx, bx + bevel, by + bevel, innerSize, innerSize, 2);
    ctx.fillStyle = color.inner;
    ctx.fill();

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
    const bevelRatio = bs < 22 ? 0.16 : 0.14;
    const bevel = Math.max(1.5, Math.min(bs * bevelRatio, 4));
    roundRectPath(ctx, bx, by, bs, bs, theme.styleType === 'bevel3d' ? Math.max(1, bs * 0.05) : radius);
    ctx.save();
    ctx.clip();

    ctx.fillStyle = color.base;
    ctx.fillRect(bx, by, bs, bs);

    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bs, by);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bevel);
    ctx.closePath();
    ctx.fillStyle = color.top;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx, by + bs);
    ctx.closePath();
    ctx.fillStyle = color.left;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bx + bs, by);
    ctx.lineTo(bx + bs, by + bs);
    ctx.lineTo(bx + bs - bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.closePath();
    ctx.fillStyle = color.right;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bx, by + bs);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bs - bevel);
    ctx.lineTo(bx + bs, by + bs);
    ctx.closePath();
    ctx.fillStyle = color.bottom;
    ctx.fill();

    const innerX = bx + bevel;
    const innerY = by + bevel;
    const innerS = bs - bevel * 2;
    ctx.fillStyle = color.base;
    ctx.fillRect(innerX, innerY, innerS, innerS);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, by + 0.5, bs - 1, bs - 1);

    ctx.restore();
  }

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
