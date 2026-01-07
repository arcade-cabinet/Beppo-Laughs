# AI Agent Instructions

This directory contains instructions for AI coding agents working on this repository.

## ⚠️ Project Architecture

**Beppo Laughs** uses **Astro 5 + React**, NOT bare Vite + React:
- Build system: Astro (wraps Vite internally)
- Entry point: `src/pages/index.astro`
- React components: `client/src/` (loaded as islands)
- Package manager: **pnpm** (not npm/yarn)

## Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| Code Reviewer | `code-reviewer.md` | PR review, security, quality |
| Test Runner | `test-runner.md` | Unit, integration, E2E tests |
| Project Manager | `project-manager.md` | Issues, PRs, project tracking |

## Development Commands

```bash
pnpm run dev       # Astro dev server (port 5000)
pnpm run build     # Astro check + build
pnpm run preview   # Preview production build
pnpm run test      # Vitest unit tests
pnpm run test:e2e  # Playwright E2E tests
pnpm run lint      # Biome linting
```

## Usage

AI agents should reference these files for repository-specific guidance.

### Key Documentation

- `/AGENTS.md` - Specialized agent routing and patterns
- `/CLAUDE.md` - AI development guide with tech stack
- `docs/` - Architecture, vision, testing guides

### Authentication

All agents must use proper GitHub authentication:

```bash
GH_TOKEN="$GITHUB_TOKEN" gh <command>
```

### Common Patterns

1. **Read before modifying** - Always understand context first
2. **Run Astro build after changes** - Verify with `pnpm run build`
3. **Link issues to PRs** - Use `Closes #123` format
4. **Test on both dev and production** - Use `pnpm run preview`

