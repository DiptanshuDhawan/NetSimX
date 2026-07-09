# NetLabX 🚀

NetLabX is an interactive, browser-based network emulation and learning platform. Built as a modern alternative to traditional desktop tools, it combines a sleek React UI with an automated Python grading engine to provide a fully guided, friction-free CCNA training academy.

## ✨ Features

- **Automated Grading Engine:** As you configure routers and switches in the browser-based terminal, the Python backend actively checks your running configurations against solutions and provides a final score.
- **Interactive Topologies:** View dynamic, color-coded network diagrams (built with modern glassmorphism design) that perfectly map out VLANs and interfaces.
- **Zero Friction Setup:** You do not need to fight with VirtualBox, VMware, or desktop GNS3 installations. The entire platform (Frontend, Backend, and GNS3 Server) runs inside lightweight, pre-configured Docker containers.
- **Guided Labs:** Step-by-step instructions for complex topics like Inter-VLAN Routing, Router-on-a-Stick (ROAS), and Trunking.

## 🏗️ Architecture

NetLabX uses a decentralized, containerized architecture that runs entirely on your local machine:
1. **Frontend:** React / Next.js app serving the UI.
2. **Backend:** Python FastAPI server handling the grading engine (via Netmiko) and lab coordination.
3. **Emulator:** A headless `gns3/gns3-server` Docker container handling the heavy lifting of Cisco IOL/IOS routing emulation silently in the background.

## 🚀 Quick Start (Installation)

To get started, you only need to have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine (Mac, Windows, or Linux).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DiptanshuDhawan/NetSimX.git
   cd NetSimX
   ```

2. **Provide your Cisco Images:**
   Because Cisco IOS/IOL images are copyrighted, they are not included in this repository. 
   - Obtain your `.bin` or `.image` file for a Cisco router/switch.
   - Drop the file(s) into the `/images` folder inside this repository.

3. **Launch the Platform:**
   ```bash
   docker-compose up -d
   ```
   *Docker will automatically build the web app, build the grading engine, and boot the GNS3 server. This will take a few minutes the very first time.*

4. **Start Learning:**
   Open your browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

## 🛑 Shutting Down
When you are finished with your labs, simply run:
```bash
docker-compose down
```
All of your lab progress and grading history is safely stored in local Docker volumes, so it will be there the next time you boot up!

---
*Built with ❤️ to make network engineering accessible.*
