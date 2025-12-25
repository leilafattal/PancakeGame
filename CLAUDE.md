# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000, opens browser)
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run serve        # Serve production build on port 3000
```

The dev server enables network access (`host: true` in vite.config.js) for testing on mobile devices on the same network.

## Architecture Overview

This is a physics-based 3D pancake stacking game built with Three.js (rendering) and Cannon-ES (physics).

### Core Engine (`src/game/`)

- **GameEngine.js** - Manages Three.js scene/camera/renderer and Cannon-ES physics world. Provides `physicsBodies` Map that syncs mesh positions with physics bodies each frame. Key helper methods: `createPancake()`, `createGround()`, `addPhysicsBody()`, `removePhysicsBody()`, `clearScene()`.

- **GameManager.js** - Central state machine managing game states: `LOADING`, `MENU`, `PLAYING`, `GAME_OVER`, `DECORATING`. Handles scene transitions, UI visibility, score tracking, and localStorage persistence for high scores.

- **main.js** - Entry point; initializes GameManager on DOMContentLoaded.

### Scene System (`src/scenes/`)

Each scene is self-contained with `init()` and `destroy()` lifecycle methods:

- **MenuScene.js** - Decorative rotating pancake stack display
- **ClassicStackScene.js** - Main gameplay with physics stacking, scoring, and collapse detection. Two control modes: tap-to-drop (pancake auto-sways) and drag-and-drop.
- **DecorateScene.js** - Pancake decoration with raycast-based placement. Tools: sprinkles (1), cream (2), syrup (3).

### Physics Integration Pattern

```javascript
// Create paired mesh + body
const { mesh, body } = this.gameEngine.createPancake(radius, height);
// Add to scene and physics world, returns tracked pair
this.gameEngine.addPhysicsBody(mesh, body);
// GameEngine.syncPhysics() automatically updates mesh positions from bodies
```

Pancakes use `CANNON.Body.KINEMATIC` while being positioned, then switch to `CANNON.Body.DYNAMIC` when dropped.

### Collapse Detection

Stack stability is checked via center-of-mass calculation in `ClassicStackScene.checkStackStability()`. When horizontal offset exceeds `collapseThreshold` (0.3 radians), all pancakes become dynamic and receive random impulses.

## Key Technologies

- Three.js for 3D rendering with PerspectiveCamera, shadow mapping enabled
- Cannon-ES for physics (gravity 9.82, solver iterations 10, sleep enabled)
- Vite for bundling (console.logs stripped in production)
