<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/aidanpetti/CompX">
    <img src="assets/logo.png" alt="CompX Logo" width="80" height="80">
  </a>

<h3 align="center">CompX</h3>

  <p align="center">
    Visual Block-Based Computational Graph System
    <br />
    <a href="claudedocs/README.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#demo">View Demo</a>
    ·
    <a href="https://github.com/aidanpetti/CompX/issues/new?labels=bug&template=bug-report.md">Report Bug</a>
    ·
    <a href="https://github.com/aidanpetti/CompX/issues/new?labels=enhancement&template=feature-request.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#quick-start">Quick Start</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![CompX Screenshot][product-screenshot]](https://github.com/aidanpetti/CompX)

**CompX** is a sophisticated visual computational graph system that enables block-based modeling, simulation, and visual programming. Built with TypeScript and React, it provides a powerful platform for creating and executing directed computational graphs with real-time visualization.

### Core Capabilities

- **Visual Block Programming**: Drag-and-drop interface for building computational graphs
- **Graph Execution Engine**: Advanced DFS-based compilation with SCC detection and topological sorting
- **Multi-Platform Support**: Web application and Electron desktop application
- **Real-Time Simulation**: Continuous and discrete-time execution with visualization
- **Type-Safe Architecture**: Strongly-typed port system ensuring connection validity

### Key Features

🎯 **Intelligent Graph Compilation**

- Automatic topological sort for execution order
- Strongly connected component detection (Kosaraju's algorithm)
- Edge classification (tree, back, forward, cross)
- Graph validation ensuring executable structure

🔧 **Extensible Block System**

- Built-in blocks: Constant, Gain, Sum, Integrator, Scope
- Custom block creation with domain-specific syntax
- Type-safe ports (number, vector, matrix, boolean, string)
- Pseudo-source blocks for feedback loops

⚡ **High Performance**

- O(V+E) graph algorithms
- Efficient canvas-based visualization with React-Konva
- Optimized execution engine for large graphs

🏗️ **Monorepo Architecture**

- Lerna-managed multi-package structure
- Shared core engine across platforms
- Independent package development and testing

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

**Core Technologies**

- [![TypeScript][TypeScript.badge]][TypeScript-url]
- [![React][React.js]][React-url]
- [![Redux][Redux.badge]][Redux-url]
- [![Electron][Electron.badge]][Electron-url]

**Key Libraries**

- **React-Konva**: Canvas-based graph visualization
- **Bootstrap 5**: UI components and styling
- **Lerna**: Monorepo management
- **Jest**: Testing framework
- **Webpack 5**: Build system

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- **Node.js** 16.x or later
- **npm** 8.x or later
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repository

   ```sh
   git clone https://github.com/aidanpetti/CompX.git
   cd CompX
   ```

2. Install dependencies

   ```sh
   npm install
   ```

3. Bootstrap packages (Lerna)

   ```sh
   npm run bootstrap
   ```

4. Verify installation
   ```sh
   npm test
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Quick Start

**Launch Web Application**

```sh
npm run web:start
```

Open browser to `http://localhost:3000`

**Launch Electron Application**

```sh
npm run electron:start
```

**Build for Production**

```sh
# Web application
npm run web:build

# Electron application
npm run electron:build
```

**Docker Deployment**

```sh
# Build web server image
docker build --target web_server -t compx:latest .

# Run container
docker run -p 8080:80 compx:latest
```

Open browser to `http://localhost:8080`

For detailed setup and development workflows, see the [Quick Start Guide](claudedocs/QUICK_START.md).
For Docker deployment and configuration, see the [Docker Guide](claudedocs/DOCKER.md).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

### Creating Your First Graph

```typescript
import { Graph } from '@compx/common';
import { Constant, Gain, Scope } from '@compx/common';

// Create empty graph
const graph = new Graph({ blocks: [], edges: [] });

// Add blocks
const constantId = graph.AddBlock(Constant); // Source: outputs constant value
const gainId = graph.AddBlock(Gain); // Multiplier
const scopeId = graph.AddBlock(Scope); // Visualization sink

// Connect blocks
graph.AddEdge(constantId, 'value', gainId, 'in');
graph.AddEdge(gainId, 'out', scopeId, 'in');

// Execute simulation (10 seconds, 0.01s time step)
graph.Execute(10.0, 0.01);
```

### Creating a Custom Block

```typescript
import { BlockStorageType } from '@compx/common';

export const Multiplier: BlockStorageType<['in1', 'in2'], ['out']> = {
  name: 'Multiplier',
  description: 'Multiplies two inputs',
  tags: ['math'],
  inputPorts: [
    { name: 'in1', type: 'number' },
    { name: 'in2', type: 'number' }
  ],
  outputPorts: [{ name: 'out', type: 'number' }],
  callbackString: 'return [inputPort[in1] * inputPort[in2]];'
};
```

### Advanced Features

**Feedback Loops with Integrator**

```typescript
// Integrator uses previous output as state
const integratorId = graph.AddBlock(Integrator);

// Create feedback loop
graph.AddEdge(gainId, 'out', integratorId, 'in');
graph.AddEdge(integratorId, 'out', gainId, 'in'); // Feedback!
```

**Graph Validation**

```typescript
// Check if graph is valid (all SCCs have sources)
if (!graph.isValidGraph()) {
  console.error('Invalid graph structure');
  console.log('Components:', graph.SCC());
  console.log('Sources:', graph.GetSourceBlocks());
}

// Get execution order
const compileOrder = graph.GetBlockCompileOrder();
console.log('Execution order:', compileOrder);
```

_For more examples and API documentation, please refer to the [API Reference](claudedocs/API_REFERENCE.md)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ARCHITECTURE -->

## Architecture

CompX uses a **monorepo structure** managed by Lerna with four main packages:

```
CompX/
├── packages/
│   ├── common/           # Core graph engine (platform-independent)
│   ├── web_app/          # React web application
│   ├── electron_app/     # Electron main process
│   └── electron_loader/  # Splash screen
```

### Core Components

**Graph Engine** (`@compx/common`)

- Graph data structure with blocks, edges, and ports
- Advanced algorithms: DFS, SCC (Kosaraju), topological sort
- Type-safe port system with generic constraints
- Block execution engine with callback system

**Web Application** (`@compx/web_app`)

- React 18 + Redux Toolkit for state management
- React-Konva for canvas-based visualization
- Bootstrap 5 UI components
- Webpack dev server with HMR

**Desktop Application** (`@compx/electron_app`)

- Electron wrapper for cross-platform desktop
- Custom window management
- Bundles web_app as renderer process

### Key Algorithms

| Algorithm               | Complexity | Purpose                                   |
| ----------------------- | ---------- | ----------------------------------------- |
| **DFS**                 | O(V + E)   | Graph traversal and reachability          |
| **SCC (Kosaraju)**      | O(V + E)   | Detect feedback loops, validate structure |
| **Topological Sort**    | O(V + E)   | Compute execution order                   |
| **Edge Classification** | O(V + E)   | Identify structural patterns              |

_For detailed architecture documentation, see [ARCHITECTURE.md](claudedocs/ARCHITECTURE.md)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

### Current Features ✅

- [x] Core graph engine with advanced algorithms
- [x] Type-safe block and port system
- [x] Web and Electron applications
- [x] Default blocks (Constant, Gain, Sum, Integrator, Scope)
- [x] Real-time graph execution
- [x] Canvas-based visualization

### Planned Enhancements 🚀

#### Short-Term

- [ ] Graph save/load functionality
- [ ] Custom block editor UI
- [ ] Additional mathematical blocks (Derivative, Transfer Function)
- [ ] Enhanced scope visualization (plotting, data export)
- [ ] Keyboard shortcuts and hotkeys
- [ ] Undo/redo functionality

#### Medium-Term

- [ ] Performance profiling per block
- [ ] Asynchronous execution with Web Workers
- [ ] Real-time collaboration (multi-user)
- [ ] Block library marketplace
- [ ] Advanced visualization (3D, animations)

#### Long-Term

- [ ] Code generation from graphs (C++, Python)
- [ ] Hardware-in-the-loop simulation
- [ ] Cloud-based execution
- [ ] AI-assisted graph optimization

See the [open issues](https://github.com/aidanpetti/CompX/issues) for a full list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions make the open source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

### Development Setup

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Install dependencies (`npm install && npm run bootstrap`)
4. Make your changes
5. Run tests (`npm test`)
6. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
7. Push to the Branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request

### Development Guidelines

- **Code Quality**: Run `npm run lint` before committing
- **Testing**: Maintain test coverage with `npm test`
- **Documentation**: Update docs for new features
- **Commit Messages**: Use descriptive commit messages
- **TypeScript**: Follow strict typing standards

See the [Development Guide](claudedocs/DEVELOPMENT_GUIDE.md) for detailed workflows.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the ISC License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

**Aidan Petti** - [@aidanpetti](https://twitter.com/aidanpetti)

**Project Link**: [https://github.com/aidanpetti/CompX](https://github.com/aidanpetti/CompX)

**Documentation**: [CompX Docs](claudedocs/README.md)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

### Technologies & Libraries

- [React](https://reactjs.org/) - UI framework
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [React-Konva](https://konvajs.org/docs/react/) - Canvas visualization
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Lerna](https://lerna.js.org/) - Monorepo management
- [Electron](https://www.electronjs.org/) - Desktop application
- [Bootstrap](https://getbootstrap.com/) - UI components
- [Jest](https://jestjs.io/) - Testing framework

### Algorithms & Computer Science

- Kosaraju's Algorithm for Strongly Connected Components
- Topological Sorting for DAG execution
- Depth-First Search for graph traversal

### Documentation Template

- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/aidanpetti/CompX.svg?style=for-the-badge
[contributors-url]: https://github.com/aidanpetti/CompX/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/aidanpetti/CompX.svg?style=for-the-badge
[forks-url]: https://github.com/aidanpetti/CompX/network/members
[stars-shield]: https://img.shields.io/github/stars/aidanpetti/CompX.svg?style=for-the-badge
[stars-url]: https://github.com/aidanpetti/CompX/stargazers
[issues-shield]: https://img.shields.io/github/issues/aidanpetti/CompX.svg?style=for-the-badge
[issues-url]: https://github.com/aidanpetti/CompX/issues
[license-shield]: https://img.shields.io/github/license/aidanpetti/CompX.svg?style=for-the-badge
[license-url]: https://github.com/aidanpetti/CompX/blob/master/LICENSE.txt
[product-screenshot]: assets/screenshot.png
[TypeScript.badge]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Redux.badge]: https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white
[Redux-url]: https://redux-toolkit.js.org/
[Electron.badge]: https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white
[Electron-url]: https://www.electronjs.org/
