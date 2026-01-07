# 🤡 Beppo Laughs

A horror clown maze game built with React, Three.js, and React Three Fiber. Trapped in Beppo's nightmare circus tent labyrinth, navigate to escape before your sanity runs out.

## 🎮 Play Now

**Live Demo**: [https://arcade-cabinet.github.io/Beppo-Laughs/](https://arcade-cabinet.github.io/Beppo-Laughs/)

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **3D Graphics**: Three.js + React Three Fiber
- **Routing**: Wouter
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + Playwright
- **Linting**: Biome

## 🚀 Getting Started

### Prerequisites

- Node.js 24.x (specified in `.nvmrc`)
- pnpm 10.12.1+

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev:client
```

The app will be available at `http://localhost:5000`

### Building

```bash
# Build for production
pnpm run build:client

# Build outputs to dist/public/
```

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
pnpm run test

# Run with coverage
pnpm run test:coverage

# Watch mode
pnpm run test:watch
```

### E2E Tests
```bash
# Run E2E tests
pnpm run test:e2e

# Run E2E tests in UI mode
pnpm run test:e2e:ui
```

### Linting
```bash
# Check code quality
pnpm run lint

# Auto-fix issues
pnpm run lint:fix
```

## 🎯 Game Features

### Dual Sanity System
- **Fear (Red)**: Increases when exploring unknown areas
- **Despair (Blue)**: Increases when backtracking through known areas

### Horror Mechanics
- Dynamic sanity meters affecting visual effects
- SDF-based villain rendering
- Procedurally generated maze from seed
- Blockades requiring collected items to pass
- Multiple endings based on sanity levels

### Controls
- **Desktop**: Mouse-controlled lever to accelerate/brake
- **Mobile**: Touch controls with lever and directional buttons
- **Navigation**: Choose direction at junctions

## 📁 Project Structure

```
Beppo-Laughs/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   └── game/      # Game-specific components
│   │   ├── game/          # Game logic and state
│   │   ├── pages/         # Route pages
│   │   ├── shaders/       # GLSL shaders
│   │   └── lib/           # Utilities
│   ├── public/            # Static assets
│   └── index.html         # Entry HTML
├── e2e/                   # Playwright E2E tests
├── docs/                  # Documentation
├── .github/workflows/     # CI/CD pipelines
└── vite.config.ts         # Vite configuration
```

## 🚢 Deployment

The project is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

### Deployment Workflow
1. Code is pushed to `main`
2. CI runs tests and builds the project with `VITE_BASE_PATH=/Beppo-Laughs`
3. Build artifacts are uploaded to GitHub Pages
4. Site is live at `https://arcade-cabinet.github.io/Beppo-Laughs/`

See [docs/GITHUB_PAGES_FIX.md](./docs/GITHUB_PAGES_FIX.md) for detailed deployment configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality
- All code must pass Biome linting
- Unit tests should be added for new features
- E2E tests should cover critical user paths
- Type checking must pass (some pre-existing errors are known)

## 📚 Documentation

- [GitHub Pages Deployment Fix](./docs/GITHUB_PAGES_FIX.md) - Routing configuration for subpath deployment
- [Vision Document](./docs/VISION.md) - Game design and horror mechanics
- [Architecture](./docs/ARCHITECTURE.md) - Technical architecture details
- [Agents Guide](./AGENTS.md) - Guide for AI development agents

## 🎮 Game Design

Beppo Laughs is a first-person horror maze game where:
- You're trapped in a circus tent labyrinth
- Your sanity depletes as you explore (fear) and backtrack (despair)
- Villains create blockades that require specific items to pass
- Find the exit before losing your sanity
- Each playthrough is unique based on the seed

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Three.js and React Three Fiber communities
- Playwright for E2E testing
- Biome for ultra-fast linting
