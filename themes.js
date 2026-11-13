// Dynamic Background & Block Palettes that cycle infinitely during gameplay (every 250 points)
const DYNAMIC_PALETTES = [
  {
    name: 'Classic Indigo',
    bgGradient: 'linear-gradient(180deg, #4766b4 0%, #3f5aa5 100%)',
    themeColor: '#4766b4',
    boardBg: '#1b2447',
    boardBorder: '#141c39',
    cellEmpty: '#222d56',
    cellEmptyBorder: '#18203f',
    modalRow: '#273566',
    diamondBg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%)',
    diamondShadow: '0 4px 20px rgba(2, 132, 199, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
    startBlockBg: 'rgba(255, 255, 255, 0.09)',
    startBlockBorder: 'rgba(255, 255, 255, 0.15)',
    startBlockHighlight: 'rgba(255, 255, 255, 0.2)',
    startShadowColor: 'rgba(7, 18, 56, 0.44)',
    startShadowMid: 'rgba(7, 18, 56, 0.16)',
    palette: [
      { id: 'coral',  base: '#e55a60', top: '#f89498', left: '#ee7378', right: '#c64247', bottom: '#a83035', inner: '#e55a60', glow: '#f89498' },
      { id: 'orange', base: '#ea7834', top: '#f8a876', left: '#f18e50', right: '#ca5d1c', bottom: '#aa4710', inner: '#ea7834', glow: '#f8a876' },
      { id: 'gold',   base: '#f2b535', top: '#fbd87c', left: '#f6c552', right: '#d3981d', bottom: '#b37d10', inner: '#f2b535', glow: '#fbd87c' },
      { id: 'green',  base: '#52be62', top: '#8fe09b', left: '#6ecf7d', right: '#3ca14a', bottom: '#2d8439', inner: '#52be62', glow: '#8fe09b' },
      { id: 'sky',    base: '#38b7d9', top: '#80dbf2', left: '#56c6e4', right: '#2297b6', bottom: '#177b96', inner: '#38b7d9', glow: '#80dbf2' },
      { id: 'blue',   base: '#4d75db', top: '#8eacf5', left: '#6b8de8', right: '#365bbe', bottom: '#27479f', inner: '#4d75db', glow: '#8eacf5' },
      { id: 'purple', base: '#8d68d4', top: '#bfa7f2', left: '#a484e1', right: '#724eb8', bottom: '#5a3b98', inner: '#8d68d4', glow: '#bfa7f2' }
    ]
  },
  {
    name: 'Sage Garden (Original)',
    bgGradient: 'linear-gradient(180deg, #98baa0 0%, #8bb194 100%)',
    themeColor: '#98baa0',
    boardBg: '#526e57',
    boardBorder: '#435c47',
    cellEmpty: '#3f5644',
    cellEmptyBorder: '#344738',
    modalBg: '#46614b',
    modalRow: '#374e3b',
    modalShadow: '#2a3d2d',
    diamondBg: 'linear-gradient(135deg, #7fb85b 0%, #58933c 55%, #3f6f29 100%)',
    diamondShadow: '0 4px 20px rgba(63, 111, 41, 0.42), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
    startBlockBg: 'rgba(255, 255, 255, 0.14)',
    startBlockBorder: 'rgba(255, 255, 255, 0.22)',
    startBlockHighlight: 'rgba(255, 255, 255, 0.28)',
    startShadowColor: 'rgba(22, 46, 26, 0.36)',
    startShadowMid: 'rgba(22, 46, 26, 0.14)',
    palette: [
      { id: 'coral',    base: '#dc7382', top: '#eea0ab', left: '#e58895', right: '#bf5766', bottom: '#a64453', inner: '#dc7382', glow: '#f7b8c2' },
      { id: 'lavender', base: '#8c7bc7', top: '#b4a7df', left: '#9f90d4', right: '#7261ab', bottom: '#5a4b90', inner: '#8c7bc7', glow: '#d1c8ed' },
      { id: 'caramel',  base: '#dd9d62', top: '#ecc299', left: '#e5ae7e', right: '#be7f46', bottom: '#a16532', inner: '#dd9d62', glow: '#f7dcc3' },
      { id: 'slate',    base: '#739bb5', top: '#9fc2d7', left: '#88adc5', right: '#587c94', bottom: '#436378', inner: '#739bb5', glow: '#c4dceb' },
      { id: 'amber',    base: '#e6af3f', top: '#f3cca6', left: '#ecc05f', right: '#c79025', bottom: '#a87515', inner: '#e6af3f', glow: '#fde5a8' },
      { id: 'lime',     base: '#7fb85b', top: '#aadb8e', left: '#93c970', right: '#669c43', bottom: '#517f33', inner: '#7fb85b', glow: '#c9eaaf' }
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
    modalRow: '#392660',
    diamondBg: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #5b21b6 100%)',
    diamondShadow: '0 4px 20px rgba(124, 58, 237, 0.48), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
    startBlockBg: 'rgba(200, 170, 255, 0.11)',
    startBlockBorder: 'rgba(200, 170, 255, 0.22)',
    startBlockHighlight: 'rgba(255, 255, 255, 0.24)',
    startShadowColor: 'rgba(18, 6, 40, 0.54)',
    startShadowMid: 'rgba(18, 6, 40, 0.2)',
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
    modalRow: '#17545f',
    diamondBg: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 50%, #155e75 100%)',
    diamondShadow: '0 4px 20px rgba(8, 145, 178, 0.48), inset 0 2px 4px rgba(255, 255, 255, 0.55)',
    startBlockBg: 'rgba(102, 217, 232, 0.1)',
    startBlockBorder: 'rgba(102, 217, 232, 0.24)',
    startBlockHighlight: 'rgba(165, 243, 252, 0.26)',
    startShadowColor: 'rgba(3, 22, 29, 0.54)',
    startShadowMid: 'rgba(3, 22, 29, 0.2)',
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
    modalRow: '#601d39',
    diamondBg: 'linear-gradient(135deg, #fb7185 0%, #e11d48 50%, #9f1239 100%)',
    diamondShadow: '0 4px 20px rgba(225, 29, 72, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
    startBlockBg: 'rgba(255, 190, 210, 0.1)',
    startBlockBorder: 'rgba(255, 190, 210, 0.2)',
    startBlockHighlight: 'rgba(255, 255, 255, 0.22)',
    startShadowColor: 'rgba(38, 8, 22, 0.54)',
    startShadowMid: 'rgba(38, 8, 22, 0.2)',
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
    modalRow: '#1d5638',
    diamondBg: 'linear-gradient(135deg, #34d399 0%, #059669 50%, #065f46 100%)',
    diamondShadow: '0 4px 20px rgba(5, 150, 105, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
    startBlockBg: 'rgba(167, 243, 208, 0.1)',
    startBlockBorder: 'rgba(167, 243, 208, 0.22)',
    startBlockHighlight: 'rgba(255, 255, 255, 0.22)',
    startShadowColor: 'rgba(6, 30, 18, 0.5)',
    startShadowMid: 'rgba(6, 30, 18, 0.18)',
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
    name: 'Классика (Хамелеон)',
    subtitle: 'Сочный оригинал • поддержка авто-смены цветов',
    supportsAutoPalette: true,
    bgGradient: 'linear-gradient(180deg, #4766b4 0%, #3f5aa5 100%)',
    themeColor: '#4766b4',
    boardBg: '#1b2447',
    boardBorder: '#141c39',
    boardShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    cellEmpty: '#222d56',
    cellEmptyBorder: '#18203f',
    cellHighlight: 'rgba(255, 255, 255, 0.14)',
    modalBg: '#364d94',
    modalRow: '#2b3f7d',
    modalShadow: '#213063',
    diamondBg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%)',
    diamondShadow: '0 4px 20px rgba(2, 132, 199, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
    startBlockBg: 'rgba(255, 255, 255, 0.09)',
    startBlockBorder: 'rgba(255, 255, 255, 0.15)',
    startBlockHighlight: 'rgba(255, 255, 255, 0.2)',
    startShadowColor: 'rgba(7, 18, 56, 0.44)',
    startShadowMid: 'rgba(7, 18, 56, 0.16)',
    dockBg: 'transparent',
    dockBorder: 'transparent',
    textPrimary: '#ffffff',
    textAccent: '#ffc633',
    styleType: 'bevel3d',
    palette: [
      { id: 'coral',  base: '#e55a60', top: '#f89498', left: '#ee7378', right: '#c64247', bottom: '#a83035', inner: '#e55a60', glow: '#f89498' },
      { id: 'orange', base: '#ea7834', top: '#f8a876', left: '#f18e50', right: '#ca5d1c', bottom: '#aa4710', inner: '#ea7834', glow: '#f8a876' },
      { id: 'gold',   base: '#f2b535', top: '#fbd87c', left: '#f6c552', right: '#d3981d', bottom: '#b37d10', inner: '#f2b535', glow: '#fbd87c' },
      { id: 'green',  base: '#52be62', top: '#8fe09b', left: '#6ecf7d', right: '#3ca14a', bottom: '#2d8439', inner: '#52be62', glow: '#8fe09b' },
      { id: 'sky',    base: '#38b7d9', top: '#80dbf2', left: '#56c6e4', right: '#2297b6', bottom: '#177b96', inner: '#38b7d9', glow: '#80dbf2' },
      { id: 'blue',   base: '#4d75db', top: '#8eacf5', left: '#6b8de8', right: '#365bbe', bottom: '#27479f', inner: '#4d75db', glow: '#8eacf5' },
      { id: 'purple', base: '#8d68d4', top: '#bfa7f2', left: '#a484e1', right: '#724eb8', bottom: '#5a3b98', inner: '#8d68d4', glow: '#bfa7f2' }
    ]
  },

  sage: {
    id: 'sage',
    name: 'Шалфей (Дзен)',
    subtitle: 'Спокойный зелёный минимализм',
    bgGradient: 'linear-gradient(180deg, #98baa0 0%, #8bb194 100%)',
    themeColor: '#98baa0',
    boardBg: '#526e57',
    boardBorder: '#435c47',
    boardShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
    cellEmpty: '#3f5644',
    cellEmptyBorder: '#344738',
    cellHighlight: 'rgba(255, 255, 255, 0.16)',
    modalBg: '#46614b',
    modalRow: '#384f3c',
    modalShadow: '#2a3d2d',
    diamondBg: 'linear-gradient(135deg, #7fb85b 0%, #58933c 55%, #3f6f29 100%)',
    diamondShadow: '0 4px 20px rgba(63, 111, 41, 0.42), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
    startBlockBg: 'rgba(255, 255, 255, 0.14)',
    startBlockBorder: 'rgba(255, 255, 255, 0.22)',
    startBlockHighlight: 'rgba(255, 255, 255, 0.28)',
    startShadowColor: 'rgba(22, 46, 26, 0.36)',
    startShadowMid: 'rgba(22, 46, 26, 0.14)',
    dockBg: 'transparent',
    dockBorder: 'transparent',
    textPrimary: '#ffffff',
    textAccent: '#ffd24d',
    styleType: 'bevel3d',
    palette: [
      { id: 'coral',    base: '#dc7382', top: '#eea0ab', left: '#e58895', right: '#bf5766', bottom: '#a64453', inner: '#dc7382', glow: '#f7b8c2' },
      { id: 'lavender', base: '#8c7bc7', top: '#b4a7df', left: '#9f90d4', right: '#7261ab', bottom: '#5a4b90', inner: '#8c7bc7', glow: '#d1c8ed' },
      { id: 'caramel',  base: '#dd9d62', top: '#ecc299', left: '#e5ae7e', right: '#be7f46', bottom: '#a16532', inner: '#dd9d62', glow: '#f7dcc3' },
      { id: 'slate',    base: '#739bb5', top: '#9fc2d7', left: '#88adc5', right: '#587c94', bottom: '#436378', inner: '#739bb5', glow: '#c4dceb' },
      { id: 'amber',    base: '#e6af3f', top: '#f3cca6', left: '#ecc05f', right: '#c79025', bottom: '#a87515', inner: '#e6af3f', glow: '#fde5a8' },
      { id: 'lime',     base: '#7fb85b', top: '#aadb8e', left: '#93c970', right: '#669c43', bottom: '#517f33', inner: '#7fb85b', glow: '#c9eaaf' }
    ]
  },

  neon: {
    id: 'neon',
    name: 'Неоновый Киберпанк',
    subtitle: 'Тёмный ультрафиолет и лазерное свечение',
    bgGradient: 'linear-gradient(180deg, #110924 0%, #070512 60%, #040309 100%)',
    themeColor: '#0e0720',
    boardBg: '#090714',
    boardBorder: '#3f277a',
    boardShadow: '0 0 34px rgba(121, 80, 242, 0.35), inset 0 0 18px rgba(0, 0, 0, 0.85)',
    cellEmpty: '#141129',
    cellEmptyBorder: '#201b40',
    cellHighlight: 'rgba(0, 245, 212, 0.18)',
    modalBg: '#191333',
    modalRow: '#241c47',
    modalShadow: '#0a0718',
    diamondBg: 'linear-gradient(135deg, #9d4edd 0%, #5a189a 55%, #240046 100%)',
    diamondShadow: '0 4px 22px rgba(157, 78, 221, 0.55), inset 0 2px 4px rgba(0, 245, 212, 0.45)',
    startBlockBg: 'rgba(157, 78, 221, 0.12)',
    startBlockBorder: 'rgba(0, 245, 212, 0.28)',
    startBlockHighlight: 'rgba(0, 245, 212, 0.32)',
    startShadowColor: 'rgba(4, 2, 16, 0.68)',
    startShadowMid: 'rgba(157, 78, 221, 0.2)',
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
    subtitle: 'Тёплое резное дерево с фактурой',
    bgGradient: 'linear-gradient(180deg, #523421 0%, #382315 60%, #24160d 100%)',
    themeColor: '#482d1c',
    boardBg: '#23150c',
    boardBorder: '#754c2e',
    boardShadow: '0 14px 36px rgba(0, 0, 0, 0.65), inset 0 3px 8px rgba(0, 0, 0, 0.7)',
    cellEmpty: '#331f13',
    cellEmptyBorder: '#24150c',
    cellHighlight: 'rgba(255, 216, 168, 0.16)',
    modalBg: '#3e2718',
    modalRow: '#2e1c10',
    modalShadow: '#1c1008',
    diamondBg: 'linear-gradient(135deg, #e6af6c 0%, #c2723e 55%, #8c4a20 100%)',
    diamondShadow: '0 4px 20px rgba(140, 74, 32, 0.5), inset 0 2px 4px rgba(255, 244, 230, 0.45)',
    startBlockBg: 'rgba(255, 192, 120, 0.09)',
    startBlockBorder: 'rgba(230, 175, 108, 0.22)',
    startBlockHighlight: 'rgba(255, 224, 178, 0.24)',
    startShadowColor: 'rgba(22, 11, 4, 0.58)',
    startShadowMid: 'rgba(22, 11, 4, 0.22)',
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
    subtitle: 'Мягкие глянцевые 3D-кубики',
    bgGradient: 'linear-gradient(180deg, #433970 0%, #2c2452 60%, #1c1638 100%)',
    themeColor: '#372e60',
    boardBg: '#1c1736',
    boardBorder: '#574c8c',
    boardShadow: '0 14px 34px rgba(10, 8, 22, 0.55), inset 0 2px 6px rgba(0, 0, 0, 0.4)',
    cellEmpty: '#28224a',
    cellEmptyBorder: '#1d1838',
    cellHighlight: 'rgba(255, 255, 255, 0.14)',
    modalBg: '#2d2654',
    modalRow: '#393066',
    modalShadow: '#191433',
    diamondBg: 'linear-gradient(135deg, #b197fc 0%, #845ef7 50%, #5f3dc4 100%)',
    diamondShadow: '0 4px 20px rgba(132, 94, 247, 0.48), inset 0 2px 4px rgba(255, 255, 255, 0.55)',
    startBlockBg: 'rgba(255, 222, 235, 0.1)',
    startBlockBorder: 'rgba(177, 151, 252, 0.26)',
    startBlockHighlight: 'rgba(255, 255, 255, 0.24)',
    startShadowColor: 'rgba(14, 10, 38, 0.52)',
    startShadowMid: 'rgba(14, 10, 38, 0.2)',
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
  },

  ocean: {
    id: 'ocean',
    name: 'Морской Кристалл',
    subtitle: 'Глубокий бирюзовый океан и блеск граней',
    bgGradient: 'linear-gradient(180deg, #136f82 0%, #0b4a59 60%, #07303b 100%)',
    themeColor: '#105c6d',
    boardBg: '#082c36',
    boardBorder: '#1f7a8c',
    boardShadow: '0 14px 36px rgba(0, 20, 30, 0.6)',
    cellEmpty: '#0d3b47',
    cellEmptyBorder: '#07242c',
    cellHighlight: 'rgba(102, 217, 232, 0.18)',
    modalBg: '#0f4754',
    modalRow: '#155c6d',
    modalShadow: '#07242b',
    diamondBg: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 50%, #155e75 100%)',
    diamondShadow: '0 4px 20px rgba(8, 145, 178, 0.48), inset 0 2px 4px rgba(255, 255, 255, 0.55)',
    startBlockBg: 'rgba(102, 217, 232, 0.1)',
    startBlockBorder: 'rgba(102, 217, 232, 0.24)',
    startBlockHighlight: 'rgba(165, 243, 252, 0.26)',
    startShadowColor: 'rgba(3, 22, 29, 0.54)',
    startShadowMid: 'rgba(3, 22, 29, 0.2)',
    dockBg: 'transparent',
    dockBorder: 'transparent',
    textPrimary: '#f0fbff',
    textAccent: '#66d9e8',
    styleType: 'crystal',
    palette: [
      { id: 'aqua',    base: '#06b6d4', top: '#a5f3fc', left: '#22d3ee', right: '#0891b2', bottom: '#155e75', inner: '#06b6d4', glow: '#67e8f9' },
      { id: 'emerald', base: '#10b981', top: '#a7f3d0', left: '#34d399', right: '#059669', bottom: '#065f46', inner: '#10b981', glow: '#6ee7b7' },
      { id: 'amber',   base: '#f59f00', top: '#fef08a', left: '#fcc419', right: '#d97706', bottom: '#92400e', inner: '#f59f00', glow: '#fde68a' },
      { id: 'coral',   base: '#fb7185', top: '#fecdd3', left: '#fda4af', right: '#e11d48', bottom: '#9f1239', inner: '#fb7185', glow: '#ffe4e6' },
      { id: 'indigo',  base: '#6366f1', top: '#c7d2fe', left: '#818cf8', right: '#4338ca', bottom: '#312e81', inner: '#6366f1', glow: '#a5b4fc' },
      { id: 'teal',    base: '#14b8a6', top: '#99f6e4', left: '#2dd4bf', right: '#0d9488', bottom: '#115e59', inner: '#14b8a6', glow: '#5eead4' }
    ]
  }
};

function appendRoundRectSubpath(ctx, x, y, w, h, r) {
  w = Math.max(0, w);
  h = Math.max(0, h);
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  appendRoundRectSubpath(ctx, x, y, w, h, r);
}

/**
 * Draws a unified down-right drop shadow behind a multi-cell piece before its cells are drawn.
 * Kept separate from drawStyledBlock because internal bevel clipping (ctx.clip) clips canvas shadows.
 */
function drawPieceShadow(ctx, shape, startX, startY, cellSize, color, themeId = 'classic', opts = {}) {
  if (!shape || !shape.cells || shape.cells.length === 0) return;
  const {
    offsetX = cellSize * 0.13,
    offsetY = cellSize * 0.15,
    blur = Math.max(2, cellSize * 0.13),
    shadowColor = null,
    dpr = 1
  } = opts;

  const theme = THEMES[themeId] || THEMES.classic;
  const pad = Math.max(0.5, cellSize * 0.018);
  const bs = cellSize - pad * 2;
  if (bs < 4) return;

  const baseRadius = Math.max(3, bs * 0.16);
  const radius =
    theme.styleType === 'bevel3d'
      ? Math.max(1, bs * 0.05)
      : theme.styleType === 'wood'
      ? baseRadius * 0.7
      : baseRadius;

  const inset = 0.35;
  const casterSize = Math.max(1, bs - inset * 2);
  const casterRadius = Math.max(0, radius - inset * 0.5);
  const safeColor = color || {};

  ctx.save();
  ctx.shadowColor = shadowColor || (theme.styleType === 'neon' ? 'rgba(0, 0, 0, 0.48)' : 'rgba(0, 0, 0, 0.27)');
  ctx.shadowOffsetX = offsetX * dpr;
  ctx.shadowOffsetY = offsetY * dpr;
  ctx.shadowBlur = blur * dpr;
  ctx.fillStyle =
    theme.styleType === 'neon'
      ? (safeColor.inner || '#110b22')
      : (safeColor.bottom || safeColor.base || '#000000');

  ctx.beginPath();
  for (const cell of shape.cells) {
    const cx = startX + cell.c * cellSize + pad + inset;
    const cy = startY + cell.r * cellSize + pad + inset;
    appendRoundRectSubpath(ctx, cx, cy, casterSize, casterSize, casterRadius);
  }
  ctx.fill();
  ctx.restore();
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

    if (theme.styleType === 'pastel') {
      // Candy glossy pillow highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
      roundRectPath(ctx, innerX + 2, innerY + 2, innerS * 0.62, innerS * 0.24, Math.max(2, innerS * 0.1));
      ctx.fill();
    } else if (theme.styleType === 'crystal') {
      // Crystal diagonal specular band
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.moveTo(innerX, innerY + innerS * 0.45);
      ctx.lineTo(innerX + innerS * 0.45, innerY);
      ctx.lineTo(innerX + innerS * 0.78, innerY);
      ctx.lineTo(innerX, innerY + innerS * 0.78);
      ctx.closePath();
      ctx.fill();
    }

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
window.drawPieceShadow = drawPieceShadow;
window.roundRectPath = roundRectPath;
