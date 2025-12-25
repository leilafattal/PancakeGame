# 🥞 Pancake Stack Frenzy

A casual, physics-based mobile game where you stack pancakes as high as possible before they topple over!

## Features

- **Classic Stack Mode** - Stack pancakes and beat your high score
- **Decorate Mode** - Customize your pancakes with sprinkles, whipped cream, and maple syrup
- **Realistic Physics** - Built with Three.js and Cannon.js for satisfying wobble and collapse mechanics
- **Mobile-First** - Optimized for touch controls on iOS and Android

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## How to Play

### Classic Stack Mode

1. Tap or click to drop pancakes onto the stack
2. Try to center each pancake for bonus points
3. The stack becomes more unstable as it grows taller
4. Game ends when the stack collapses
5. Beat your high score!

**Controls:**
- **Tap mode** (default): Pancake sways left-right automatically, tap anywhere to drop
- **Drag mode**: Drag pancake left-right before releasing to drop

**Scoring:**
- +10 points per pancake
- +5 bonus for perfect center alignment
- Combo multiplier for consecutive perfect placements
- +50 bonus every 10 pancakes

### Decorate Mode

1. Click on a pancake to add decorations
2. Press 1, 2, or 3 to select decoration tools:
   - **1** - Sprinkles
   - **2** - Whipped Cream
   - **3** - Maple Syrup
3. Click on the pancake to apply decorations
4. Get creative and make delicious-looking pancakes!

## Project Structure

```
PancakeGame/
├── src/
│   ├── game/
│   │   ├── main.js              # Entry point
│   │   ├── GameManager.js       # Game state management
│   │   └── GameEngine.js        # Three.js + Cannon.js engine
│   ├── scenes/
│   │   ├── MenuScene.js         # Main menu
│   │   ├── ClassicStackScene.js # Stacking gameplay
│   │   └── DecorateScene.js     # Pancake decoration
│   ├── utils/                   # Helper utilities
│   └── decorations/             # Decoration system (future)
├── assets/
│   ├── images/                  # Textures and sprites
│   ├── sounds/                  # Sound effects
│   └── music/                   # Background music
├── public/                      # Static assets
├── index.html                   # Main HTML file
├── package.json
├── vite.config.js
└── PRD.MD                       # Product Requirements Document

## Technologies

- **Three.js** - 3D graphics rendering
- **Cannon.js** - Physics simulation
- **Vite** - Fast build tool and dev server
- **Vanilla JavaScript** - No framework dependencies

## Roadmap

See [PRD.MD](PRD.MD) for the complete product requirements and future features.

### Coming Soon

- [ ] Sound effects and background music
- [ ] More decoration tools and options
- [ ] Special pancake types (blueberry, chocolate chip)
- [ ] Achievement system
- [ ] Challenge modes
- [ ] Mobile app builds (iOS/Android)

## Development

### Adding New Features

1. Create new scene files in `src/scenes/`
2. Add utility functions in `src/utils/`
3. Update `GameManager.js` to handle new game states

### Testing on Mobile

1. Start dev server: `npm run dev`
2. Find your local IP address
3. On mobile device (same network), visit `http://YOUR_IP:3000`

## License

MIT License

## Credits

Built with ❤️ and pancakes
