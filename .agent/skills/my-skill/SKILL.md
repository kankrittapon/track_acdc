name: antigravity-gps-tracker description: A specialized framework for building high-stability, real-time GPS tracking systems. It focuses on hardware data ingestion (ESP32), noise filtering (Kalman/SMA), and smooth, directional soldier-themed icon rendering on a Leaflet-based map.
Antigravity GPS Tracker
This skill provides the mandatory operational framework for the "Antigravity" project. It ensures that the GPS tracking system remains stable, visually fluid, and resilient to the harsh conditions of marine racing.

MANDATORY PROTOCOL
THE AGENT MUST READ THIS SKILL IN ITS ENTIRETY BEFORE TAKING ANY ACTION. Every response, code snippet, or architectural advice must align with the "Antigravity" principles defined below.

STRICT RULES
Read-Before-Act: Every task must be cross-referenced with this skill to maintain system integrity.

Visual Smoothness (No Teleporting): Markers must never "jump" or "teleport" on the map. All movement must be interpolated using CSS transitions or client-side smoothing algorithms.

Heading Integrity: Soldier icons must point North (0°) in their source file. Directional rotation must be locked to the last valid heading if the speed drops below 0.5 knots to prevent erratic spinning.

Hardware Resilience: All hardware-related advice must prioritize protection against salt, moisture (IP67), and extreme solar heat.

Data Efficiency: Implement a "Dynamic Heartbeat"—high-frequency updates during movement, low-frequency during idle states.

Language Consistency: While this skill is documented in English, all communication with the user must be in Thai as per the established preference.

When to use this skill
Use when developing or debugging the real-time tracking dashboard for the Antigravity project.

Use when integrating ESP32 or other GPS-capable hardware with the Next.js/Leaflet stack.

Use when optimizing map performance or marker animations for sailing competitions.

How to use it
1. Hardware & Ingestion Layer
Hardware: Utilize ESP32 with GPS (NEO-6M/8M) and IMU (MPU6050) for stabilized heading.

Communication: Send JSON payloads containing id, lat, lng, speed, and bearing.

Protection: Always recommend conformal coating and waterproof housing for marine use.

2. The "Antigravity" Smoothing Logic
Coordinate Filtering: Apply a Simple Moving Average (SMA) over the last 3-5 coordinates to remove GPS noise.

Client-Side Interpolation: Use CSS transition properties on .leaflet-marker-icon to ensure the "tiny soldier" glides across the map.

3. Map Implementation (Leaflet.js)
Library: Use Leaflet.js with the leaflet-rotatedmarker plugin.

Anchor Points: Ensure the iconAnchor is set to the center of the icon [width/2, height/2] for accurate rotation.

Base Map: Use OpenStreetMap (OSM) tiles for a cost-effective, high-performance solution.