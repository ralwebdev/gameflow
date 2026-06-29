export const seedGames = [
  {
    title: 'Money Ladder',
    slug: 'money-ladder',
    description: 'Fullscreen-first WebGL trivia ladder experience.',
    gameUrl: '/games/Money%20Ladder/index.html',
    loadingScreenUrl: '/games/Money%20Ladder/loading_screen.png',
    mode: 'landscape',
    aspectRatio: '16 / 9',
    isPublished: true,
    displayOrder: 1,
  },
  {
    title: 'Flappy Bird',
    slug: 'flappy-bird',
    description: 'Portrait-friendly arcade demo build.',
    gameUrl: '/games/Flappy%20Bird/Build/index.html',
    mode: 'portrait',
    aspectRatio: '9 / 16',
    isPublished: false,
    displayOrder: 2,
  },
]

export const seedAssets = [
  {
    title: 'Hammer',
    slug: 'hammer',
    description: 'Sample GLB asset for the 3D viewer.',
    modelUrl: '/3dAssets/hammer.glb',
    background: '#101820',
    mode: 'landscape',
    isPublished: true,
    displayOrder: 1,
  },
]
