# Setup Guide for Pancake Stack Frenzy

## Prerequisites Installation

### Install Node.js

You need Node.js and npm to run this project. Here's how to install them on macOS:

#### Option 1: Using Homebrew (Recommended)

1. Install Homebrew if you don't have it:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install Node.js:
```bash
brew install node
```

3. Verify installation:
```bash
node --version
npm --version
```

#### Option 2: Download from nodejs.org

1. Visit https://nodejs.org/
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer
4. Verify installation in Terminal:
```bash
node --version
npm --version
```

## Project Setup

Once Node.js is installed, follow these steps:

### 1. Install Dependencies

Navigate to the project directory and install all required packages:

```bash
cd /Users/lily/Documents/GitHub/PancakeGame
npm install
```

This will install:
- Three.js (3D graphics)
- Cannon-es (physics engine)
- Vite (dev server and build tool)

### 2. Start Development Server

Run the development server:

```bash
npm run dev
```

The game will automatically open in your browser at `http://localhost:3000`

### 3. Development Workflow

- **Hot Reload**: Changes to code automatically refresh in the browser
- **Console Logs**: Open browser DevTools (F12) to see console output
- **Mobile Testing**: Use your local IP to test on mobile devices on the same network

### 4. Build for Production

When ready to deploy:

```bash
npm run build
```

The optimized build will be created in the `dist/` directory.

### 5. Preview Production Build

Test the production build locally:

```bash
npm run preview
```

## Troubleshooting

### Port Already in Use

If port 3000 is taken, the dev server will automatically try the next available port.

### Module Not Found Errors

Delete `node_modules/` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Browser Compatibility

Modern browsers required:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Mobile Testing

1. Make sure your computer and mobile device are on the same WiFi
2. Find your computer's local IP:
   ```bash
   ipconfig getifaddr en0
   ```
3. On mobile, visit `http://YOUR_IP:3000`

## Next Steps

After setup is complete:

1. Review the [README.md](README.md) for gameplay instructions
2. Check [PRD.MD](PRD.MD) for the complete product requirements
3. Start developing new features!

## Development Tips

- Keep the browser console open to see debug logs
- Use the Three.js DevTools browser extension for 3D scene inspection
- Test physics tweaks by adjusting values in `src/game/GameEngine.js`
- Add new scenes by creating files in `src/scenes/`

## File Structure Quick Reference

```
src/
├── game/
│   ├── main.js           - Entry point
│   ├── GameManager.js    - State management, scene switching
│   └── GameEngine.js     - Three.js + Cannon.js setup
└── scenes/
    ├── MenuScene.js      - Main menu with decorative pancakes
    ├── ClassicStackScene.js - Main stacking gameplay
    └── DecorateScene.js  - Pancake decoration mode
```

Happy coding! 🥞
