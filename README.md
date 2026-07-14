<div align="center">

# InstantNodes

**A browser-based CCNA training academy — no VMs, no clunky desktop tools, no friction.**

Configure real Cisco routers and switches from your browser. Get graded automatically. Learn networking the way it should be taught.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](#quick-start)
[![Python](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](#architecture)
[![React](https://img.shields.io/badge/Frontend-React%20%2F%20Next.js-61DAFB?logo=react&logoColor=black)](#architecture)
[![Status](https://img.shields.io/badge/Status-Beta-orange.svg)](#project-status)

[Features](#features) · [Architecture](#architecture) · [Quick Start](#quick-start) · [Lab Authoring](#authoring-your-own-labs) · [Roadmap](#roadmap) · [Contributing](#contributing)

</div>

---

## Why InstantNodes?

Packet Tracer is closed-source and cartoonish. GNS3 is powerful but hands you a blank canvas and a wall of setup steps. Neither one tells you whether your configuration is actually *correct*.

InstantNodes is built around one idea: **a lab isn't done when you finish typing commands — it's done when something checks your work.**

You get curated, step-by-step labs (Inter-VLAN Routing, Router-on-a-Stick, trunking, and more), a real browser-based terminal wired straight into emulated Cisco gear, and an automated grading engine that logs into your devices, reads the running config, and scores you against a known-good solution — instantly, no instructor required.

Everything runs in Docker. Clone the repo, drop in your own Cisco images, and you have a full network lab environment running at `localhost:3000` in a few minutes.

---

## 🚀 Quick Start
1. Clone the repository.
2. Place your Cisco IOU `.bin` images into the `images/` directory. 
   **CRITICAL:** You must rename your layer 3 image to `router.bin` and your layer 2 image to `switch.bin`.
3. Run `docker-compose up -d --build`.
4. Open your browser to `http://localhost:3000`.

---

## Features

- 🎯 **Automated Grading Engine** — Configure devices in-browser, hit **Grade**, and a Python backend (via Netmiko) SSHes into the routers, pulls `show run` and `show vlan brief` (to catch VLANs hidden in `vlan.dat`), sanitizes the output, and diffs it against the lab's solution file. Scores and feedback appear in seconds.
- 🖥️ **Real In-Browser Terminal** — A full `xterm.js` terminal connects over WebSockets straight to the router console. No SSH client, no serial cable, no local install.
- 🗺️ **Interactive Topology Diagrams** — Dynamic, SVG-based network diagrams with a dark, glassmorphism aesthetic. VLANs, trunks, and interfaces are color-coded so the topology is legible at a glance, not just technically accurate.
- 📚 **Guided, Curated Labs** — Step-by-step walkthroughs for foundational and intermediate CCNA topics, with more added regularly during the current lab-expansion phase.
- 🐳 **Zero-Friction Setup** — No VirtualBox, no VMware, no manual GNS3 install. `docker-compose up` and you're learning.
- 💾 **Persistent Progress** — Lab attempts and grading history are stored in SQLite inside a Docker volume, so your progress survives restarts.

---

## Architecture

InstantNodes runs as three coordinated Docker containers, all orchestrated locally on your machine — nothing leaves your network.

<div align="center">
  <img src="docs/architecture.png" alt="InstantNodes Architecture Diagram" width="800">
</div>

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React / Next.js, xterm.js | UI, topology rendering, live terminal |
| Backend | FastAPI, `netmiko`, `gns3fy` | Orchestration + automated grading |
| Emulation | `gns3/gns3-server` (headless) | Cisco IOS/IOL device emulation |
| Storage | SQLite, YAML | Progress tracking, lab & solution definitions |

Each lab is defined by a `lab.yaml` file paired with a `solution.cfg`, so adding a new lab to the platform doesn't require touching any application code.

---

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac, Windows, or Linux)
- Your own legally-obtained Cisco IOS/IOL `.bin` or `.image` file(s)

> **A note on Cisco images:** Cisco IOS/IOL images are copyrighted software and are **not** distributed with this project. InstantNodes only provides the platform — you must supply your own images.

### 1. Clone the repository

```bash
git clone https://github.com/DiptanshuDhawan/NetSimX.git
cd NetSimX
```

### 2. Add your Cisco images

Drop your `.bin` / `.image` file(s) into the `./images` directory at the repo root. This folder is mounted directly into the `gns3-server` container.

```
NetSimX/
└── images/
    └── your-cisco-image.bin
```

### 3. Launch the stack

```bash
docker-compose up -d
```

The first run will build the frontend, build the backend, and pull the GNS3 server image — this can take a few minutes. Subsequent runs are near-instant.

### 4. Start learning

Open your browser to:

```
http://localhost:3000
```

Pick a lab, open the terminal, configure the topology, and click **Grade** when you're ready.

### Shutting down

```bash
docker-compose down
```

Your lab progress and grading history live in a Docker volume and will be there the next time you run `docker-compose up`.

---

## Authoring Your Own Labs

Labs are just YAML + a solution config — no application code required.

```
labs/
└── inter-vlan-routing/
    ├── lab.yaml        # Topology, instructions, metadata
    └── solution.cfg    # Reference configuration used for grading
```

`lab.yaml` describes the topology, step-by-step instructions, and grading criteria; `solution.cfg` is the known-good configuration the Grading Engine diffs student output against. See [`/labs`](./labs) for existing examples to use as a template.

---

## Project Status

InstantNodes is in **active beta**. The core platform is functional end-to-end:

- ✅ Grading Engine handles complex configurations (ROAS, trunking, inter-VLAN routing)
- ✅ Full Docker Compose stack, with `.dockerignore` tuned for lean images
- ✅ Polished dark-mode UI with live topology rendering
- 🚧 Lab library expansion in progress
- 🚧 Broader CCNA topic coverage (OSPF, EtherChannel, ACLs, wireless, security features) on the way

## Roadmap

- [ ] Expanded lab library covering full CCNA 200-301 blueprint
- [ ] Multi-user / classroom mode for instructors
- [ ] Exportable progress reports
- [ ] Additional vendor/platform support beyond Cisco IOS/IOL

## Contributing

Contributions are welcome — new labs, bug fixes, UI polish, or grading engine improvements. Please open an issue to discuss significant changes before submitting a PR.

## License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">

Built with ❤️ to make network engineering accessible.

</div>
