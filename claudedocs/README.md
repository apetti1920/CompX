# CompX Documentation Index

## Overview

This directory contains comprehensive documentation for the CompX visual computational graph system. Documentation is organized to support both new developers and experienced contributors.

## Documentation Structure

### 📘 [CLAUDE.md](../.claude/CLAUDE.md)
**Project-specific instructions for Claude Code**
- Project overview and capabilities
- Architecture summary
- Technology stack
- Build commands and workflows
- Common development tasks
- Testing patterns
- Debugging tips

**When to Use**: Starting point for understanding the project, working with Claude Code

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
**System architecture and design patterns**
- High-level architecture diagrams
- Package structure and dependencies
- Core algorithms (DFS, SCC, topological sort)
- Type system architecture
- State management (Redux)
- Block execution model
- Visualization architecture
- Performance characteristics
- Extension points

**When to Use**: Understanding system design, implementing new features, architectural decisions

### 📚 [API_REFERENCE.md](./API_REFERENCE.md)
**Complete API documentation**
- Graph class methods
- Block class API
- Port and Edge types
- Default blocks reference
- Redux actions
- Type utilities
- Error types

**When to Use**: Implementing features, integrating with graph engine, API usage

### 🛠️ [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
**Practical development workflows**
- Setup and prerequisites
- Development workflows (web, Electron, packages)
- Adding features (blocks, port types, algorithms)
- Testing strategies
- Code quality tools
- Debugging techniques
- Build & deployment
- Performance optimization
- Common issues & solutions
- Best practices

**When to Use**: Day-to-day development, adding features, debugging, deploying

## Quick Navigation

### Getting Started
1. Read [CLAUDE.md](../.claude/CLAUDE.md) → Project Overview
2. Follow [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#getting-started) → Setup
3. Review [ARCHITECTURE.md](./ARCHITECTURE.md) → System Understanding

### Common Tasks

#### Adding a New Block Type
1. [DEVELOPMENT_GUIDE.md → Adding Features → Adding a New Block Type](./DEVELOPMENT_GUIDE.md#adding-a-new-block-type)
2. [API_REFERENCE.md → Default Blocks](./API_REFERENCE.md#default-blocks-api)

#### Understanding Graph Algorithms
1. [ARCHITECTURE.md → Core Algorithms](./ARCHITECTURE.md#core-algorithms)
2. [API_REFERENCE.md → Graph Algorithm Methods](./API_REFERENCE.md#graph-algorithm-methods)

#### Debugging Graph Execution
1. [DEVELOPMENT_GUIDE.md → Debugging → Graph Execution Debugging](./DEVELOPMENT_GUIDE.md#graph-execution-debugging)
2. [CLAUDE.md → Debugging Tips](../.claude/CLAUDE.md#debugging-tips)

#### API Integration
1. [API_REFERENCE.md → Graph Class](./API_REFERENCE.md#graph-class)
2. [ARCHITECTURE.md → Data Flow Architecture](./ARCHITECTURE.md#data-flow-architecture)

## Documentation Map

```
CompX Documentation
│
├── Getting Started
│   ├── CLAUDE.md → Project Overview
│   ├── DEVELOPMENT_GUIDE.md → Setup & Installation
│   └── ARCHITECTURE.md → System Understanding
│
├── Development
│   ├── DEVELOPMENT_GUIDE.md → Workflows & Best Practices
│   ├── API_REFERENCE.md → API Usage
│   └── CLAUDE.md → Common Development Tasks
│
├── Architecture & Design
│   ├── ARCHITECTURE.md → System Architecture
│   ├── ARCHITECTURE.md → Core Algorithms
│   └── ARCHITECTURE.md → Type System
│
├── API Reference
│   ├── API_REFERENCE.md → Graph API
│   ├── API_REFERENCE.md → Block API
│   ├── API_REFERENCE.md → Port/Edge API
│   └── API_REFERENCE.md → Redux Actions
│
└── Troubleshooting
    ├── DEVELOPMENT_GUIDE.md → Common Issues
    ├── CLAUDE.md → Debugging Tips
    └── DEVELOPMENT_GUIDE.md → Performance Optimization
```

## Key Concepts Reference

### Graph Theory Foundations
- **[Graph](./API_REFERENCE.md#graph-class)**: Container for computational blocks and edges
- **[Block](./API_REFERENCE.md#block-class)**: Computational node with typed I/O ports
- **[Edge](./API_REFERENCE.md#edge-class)**: Typed connection between ports
- **[Port](./API_REFERENCE.md#port-class)**: Typed data endpoint

### Core Algorithms
- **[DFS (Depth-First Search)](./ARCHITECTURE.md#1-topological-sort-compile-order)**: Graph traversal
- **[SCC (Strongly Connected Components)](./ARCHITECTURE.md#2-strongly-connected-components-scc)**: Feedback loop detection
- **[Topological Sort](./ARCHITECTURE.md#1-topological-sort-compile-order)**: Execution order computation
- **[Edge Classification](./ARCHITECTURE.md#3-edge-classification)**: Structural analysis

### Package Architecture
- **[@compx/common](./ARCHITECTURE.md#1-compxcommon-core-engine)**: Core graph engine
- **[@compx/web_app](./ARCHITECTURE.md#2-compxweb_app-react-frontend)**: React UI
- **[@compx/electron_app](./ARCHITECTURE.md#3-compxelectron_app-desktop-application)**: Desktop wrapper
- **[@compx/electron_loader](./ARCHITECTURE.md#4-compxelectron_loader-splash-screen)**: Splash screen

## File Location Guide

### Source Code
- **Graph Engine**: `packages/common/src/Graph/`
- **Default Blocks**: `packages/common/src/DefaultBlocks/`
- **UI Components**: `packages/web_app/src/app/Container/`
- **Redux Store**: `packages/web_app/src/store/`
- **Electron Main**: `packages/electron_app/src/`

### Tests
- **Common Tests**: `packages/common/__tests__/`
- **Test Resources**: `packages/common/__tests__/Resources/`

### Configuration
- **Root Config**: `package.json`, `lerna.json`, `tsconfig.json`
- **Package Configs**: `packages/*/package.json`, `packages/*/tsconfig.json`
- **Build Config**: `packages/web_app/webpack/`

## Development Workflows

### Web Development
```bash
npm run web:start    # Dev server → http://localhost:3000
npm run web:build    # Production build
```

### Electron Development
```bash
npm run electron:start    # Build and launch
npm run electron:build    # Production build
```

### Testing
```bash
npm test                     # All tests
npm test -- --watch         # Watch mode
npm test -- packages/common # Specific package
```

### Code Quality
```bash
npm run lint           # ESLint
npm run format         # Prettier
npx tsc --noEmit       # Type check
```

## Technology Stack Summary

### Core
- **TypeScript 4.4.4**: Static typing
- **Lodash**: Utilities
- **uuid**: ID generation
- **loglevel**: Logging

### Frontend
- **React 18.2**: UI framework
- **Redux Toolkit**: State management
- **React-Konva**: Canvas visualization
- **Bootstrap 5.2**: UI components

### Build & Quality
- **Lerna 6.4.1**: Monorepo management
- **Webpack 5**: Bundling
- **Jest 29**: Testing
- **ESLint + Prettier**: Code quality

## Contributing

### Before Starting
1. Read [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
2. Set up development environment
3. Run tests to verify setup

### Development Process
1. Create feature branch
2. Implement changes
3. Write/update tests
4. Run linter and tests
5. Update documentation
6. Create pull request

### Code Quality Standards
- ESLint: Airbnb config + TypeScript
- Prettier: Consistent formatting
- Tests: Maintain coverage
- Documentation: Update for features

## Additional Resources

### External Documentation
- [Lerna Documentation](https://lerna.js.org/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React-Konva](https://konvajs.org/docs/react/)
- [TypeScript](https://www.typescriptlang.org/)

### Project Repository
- Main repository: [CompX GitHub](https://github.com/your-org/CompX)
- Issue tracking: [GitHub Issues](https://github.com/your-org/CompX/issues)

## Documentation Updates

### When to Update Documentation
- Adding new features
- Changing APIs
- Modifying architecture
- Discovering common issues
- Improving development workflows

### How to Update
1. Edit relevant markdown files in `claudedocs/`
2. Update cross-references if structure changes
3. Maintain consistent formatting
4. Commit with descriptive message

---

**Documentation Version**: 1.0
**Last Updated**: 2025-10-25
**Maintained By**: CompX Development Team

## Quick Reference Card

### Essential Commands
```bash
npm run bootstrap        # Setup
npm run web:start       # Dev server
npm test                # Run tests
npm run lint            # Code quality
```

### Key Files
```
.claude/CLAUDE.md       # Project instructions
claudedocs/*.md         # Documentation
packages/common/src/    # Core engine
packages/web_app/src/   # UI code
```

### Critical Classes
```typescript
Graph                   # Container & algorithms
Block                   # Computational node
Edge                    # Connection
Port                    # Typed I/O
```

### Common Operations
```typescript
graph.AddBlock(...)         // Add block
graph.AddEdge(...)          // Connect blocks
graph.GetBlockCompileOrder() // Execution order
graph.Execute(T, dt)        // Run simulation
```
