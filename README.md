<div align="center">
  <img src="docs/banner.svg" alt="InstantNodes Banner" width="100%">

  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React"></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" alt="FastAPI"></a>
    <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" alt="Python"></a>
    <a href="#quick-start"><img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker"></a>
    <a href="https://github.com/DiptanshuDhawan/NetSimX/commits/main"><img src="https://img.shields.io/github/last-commit/DiptanshuDhawan/NetSimX.svg?style=flat&color=blue" alt="Last Commit"></a>
    <br>
    <a href="https://github.com/DiptanshuDhawan/NetSimX/stargazers"><img src="https://img.shields.io/github/stars/DiptanshuDhawan/NetSimX.svg?style=flat&color=yellow" alt="Stars"></a>
    <a href="https://github.com/DiptanshuDhawan/NetSimX/network/members"><img src="https://img.shields.io/github/forks/DiptanshuDhawan/NetSimX.svg?style=flat&color=orange" alt="Forks"></a>
    <a href="https://github.com/DiptanshuDhawan/NetSimX/issues"><img src="https://img.shields.io/github/issues/DiptanshuDhawan/NetSimX.svg?style=flat&color=red" alt="Issues"></a>
    <a href="https://github.com/DiptanshuDhawan/NetSimX"><img src="https://img.shields.io/github/repo-size/DiptanshuDhawan/NetSimX.svg?style=flat&color=brightgreen" alt="Repo Size"></a>
    <a href="#license"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
    <a href="https://github.com/DiptanshuDhawan/NetSimX/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="#project-status"><img src="https://img.shields.io/badge/Status-Beta-orange.svg" alt="Status"></a>
  </p>
</div>

---

## Overview

<div align="center">
  <img src="docs/dashboard.png" alt="InstantNodes Dashboard" width="800">
  <br>
  <img src="docs/lab_terminal.png" alt="InstantNodes Lab UI with Terminal" width="800">
</div>

Setting up traditional network emulators can be frustrating and time-consuming. InstantNodes solves this by containerizing GNS3 and exposing a React frontend. You supply your own Cisco IOS/IOL images, and the platform handles the rest.

- **Automated Grading Engine**: Configures devices in-browser. The Python backend (using Netmiko) connects via SSH, pulls running configurations, and evaluates them against a known-good solution file.
- **In-Browser Terminal**: A native `xterm.js` terminal connects to router consoles via WebSockets. No external SSH clients required.
- **Interactive Topologies**: Dynamic, SVG-based network diagrams that clearly map out VLANs, trunks, and active interfaces.
- **Local Execution**: The entire stack runs in Docker Compose on your local machine.

## Architecture

InstantNodes runs as three coordinated Docker containers.

```mermaid
graph TD
    User([User Browser]) -->|HTTP / WebSocket| Frontend[React & Next.js Frontend]
    
    Frontend -->|REST API| Backend[FastAPI Backend]
    
    Backend -->|gns3fy API| GNS3[GNS3 Server Container]
    Backend -->|netmiko SSH| GNS3
    
    GNS3 -->|Boots IOS/IOL| Routers((Emulated Devices))
    
    Backend -.->|Reads / Writes| DB[(SQLite Database)]
    Backend -.->|Reads| Labs[YAML Lab Definitions]
```

## Quick Start

### Prerequisites

- Docker Desktop
- Cisco IOS/IOL `.bin` or `.image` files

> **Note:** Cisco images are not distributed with this project. You must supply your own images.

### 1. Clone the repository

```bash
git clone https://github.com/DiptanshuDhawan/NetSimX.git
cd NetSimX
```

### 2. Add your Cisco images

Place your images into the `./images` directory at the repository root. This folder is mounted directly into the GNS3 server container.

**Important:** Rename your Layer 3 image to `router.bin` and your Layer 2 image to `switch.bin`.

```
NetSimX/
└── images/
    ├── router.bin
    └── switch.bin
```

### 3. Launch the stack

```bash
docker-compose up -d --build
```

The initial run will build the frontend and backend containers. Once complete, the application will be available at `http://localhost:3000`.

### 4. Shutting down

```bash
docker-compose down
```
Lab progress and grading history are persisted in a local SQLite database stored in a Docker volume.

## Authoring Labs

Labs are defined using YAML and reference configurations. No application code modifications are required to add new labs.

```
labs/
└── inter-vlan-routing/
    ├── lab.yaml        # Topology layout, instructions, and metadata
    └── solution.cfg    # Reference configuration for the grading engine
```

Review the existing examples in the `/labs` directory to use as templates for creating new scenarios.

## Project Status

InstantNodes is currently in active beta. The core grading engine, Docker Compose stack, and frontend UI are fully functional. Current work is focused on expanding the built-in lab library to cover the full CCNA 200-301 blueprint.

## License

Distributed under the MIT License. See `LICENSE` for details.
