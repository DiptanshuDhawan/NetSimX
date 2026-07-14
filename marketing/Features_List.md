# Revelio Labs: Core Features & Value Proposition

## 1. Instant "One-Click" Auto-Provisioning
No more messing with VMware, Docker files, or GNS3 topology configs. Users select a lab from our beautiful UI, click "Play", and our backend instantly orchestrates the entire network in the background (spanning real Cisco routers, switches, and PCs).

## 2. Dynamic Interactive Topologies
We feature a stunning React-based canvas that draws the network map dynamically. It shows live IP addresses, subnet information, interface labels, and device states (Routers, Switches, End Hosts). It's aesthetically pleasing, using sleek styling and high-contrast dark modes to make learning easy on the eyes.

## 3. In-Browser Native Terminal
Say goodbye to PuTTY and external terminal apps. Revelio Labs features a lightning-fast, native web terminal built directly into the browser. Users simply click on a router in the topology map, and instantly get console access to type Cisco IOS commands.

## 4. Intelligent Auto-Grading Engine (The "Wow" Factor)
This is our flagship feature. As users configure the routers, they can click a blue "Grade" button. Our Python backend connects to the devices via Telnet/SSH, executes validation scripts against the running configurations, and provides instant, gamified feedback. Green checkmarks appear for completed tasks, helping users know exactly what they got right and what they still need to fix.

## 5. Lab Scenarios & Content
We provide a curated library of labs ranging from Beginner to Advanced:
* **Initial Device Configuration & SSH Hardening:** Teaches the basics of securing Cisco devices.
* **Router on a Stick (ROAS):** Inter-VLAN routing for connecting different networks.
* **NTP & Hub-and-Spoke Topologies:** Complex enterprise timing and routing designs.
