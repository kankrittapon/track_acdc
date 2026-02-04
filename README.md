# 🎖️ Track ACDC - Antigravity Military Tracker

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)

**ระบบติดตามพิกัดทางทหารแบบ Real-time (Military Tactical Tracking System)**

*"Antigravity" - การเคลื่อนพลที่ลื่นไหล แม่นยำ ไร้รอยต่อ*

</div>

---

## ✨ Features

### 🗺️ แผนที่ยุทธวิธี (Tactical Map)
- แสดงพิกัดกำลังพลแบบ Live บนแผนที่ CartoDB (Light Mode)
- ติดตามหน่วยปฏิบัติการหลายหน่วยพร้อมกันจาก Firebase Realtime Database
- รองรับการแสดงผลแบบ High Precision

### 🎖️ สัญลักษณ์ทางทหาร (Military Icons)
- **Soldier Icon:** ใช้สัญลักษณ์ทหารสไตล์ Modern Tactical แทนตำแหน่งบุคคล/หน่วย
- **Dynamic Heading:** หมุนตามทิศทางการเคลื่อนที่จริง (True Heading)
- **Team Labels:** ป้ายระบุสังกัดทีมเหนือหน่วยปฏิบัติการ

### 🌊 Antigravity Smoothing Technology
- **Signal Noise Filter:** กรองสัญญาณ GPS ที่คลาดเคลื่อนด้วยอัลกอริทึม SMA (Simple Moving Average)
- **Stationary Heading Lock:** ล็อคทิศทางเมื่อหยุดนิ่ง (ป้องกันเป้าหมายหมุนไปมา)
- **Smooth Animations:** การเคลื่อนที่ของเป้าหมายลื่นไหลด้วย CSS Transitions

### 🚤 Tactical Trail (เส้นทางเดินทัพ)
- แสดงเส้นทางการเคลื่อนที่ย้อนหลัง (Wake/Trail)
- วิเคราะห์รูปแบบการเคลื่อนพลได้ทันที

### 📏 Distance Measurement (Ruler Tool)
- เครื่องมือวัดระยะทางทางยุทธวิธี
- ความละเอียดระดับเมตร/กิโลเมตร

### 🎬 Mission Control Center
- **Access Control:** ควบคุมการเข้าถึงข้อมูลตามระดับสิทธิ์
- **Replay System:** ระบบดูภาพเหตุการณ์ย้อนหลัง (AAR - After Action Review)
- **Situation Awareness:** มุมมองภาพรวมสนามรบ (Zoom to Fit)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for deployment)

### Installation (Local Dev)

```bash
# Clone the repo
git clone https://github.com/kankrittapon/track_acdc.git
cd track_acdc

# Install dependencies
npm install

# Start dev server
npm run dev
```

เปิด **http://localhost:5173** ในเบราว์เซอร์

### Deployment (Docker)

```bash
# Build and Run with Docker Compose
docker compose up -d --build
```
ระบบจะทำงานที่ Port `8080` (ปรับได้ใน docker-compose.yml)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript |
| **Build** | Vite 7 |
| **Map** | Leaflet + react-leaflet |
| **State** | Zustand |
| **Styling** | TailwindCSS 4 |
| **Backend** | Firebase Realtime Database |
| **Deployment** | Docker + Nginx (SPA Config) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── map/          # Map Components (SoldierMarker, TacticalMap)
│   ├── ui/           # UI Overlay (Sidebar, Mission Control, Stats)
│   └── logic/        # Business Logic (Playback, Data Processing)
├── lib/
│   ├── gpsSmoothing.ts   # Core "Antigravity" algorithms
│   ├── firebase.ts       # Database Connection
│   └── geoUtils.ts       # Tactical Calculations
├── stores/
│   ├── useBoatStore.ts   # Unit State Management
│   ├── useRulerStore.ts  # Measurement Tools
│   └── useCourseStore.ts # Mission/Objective State
└── App.tsx
```

---

## 🎯 The "Antigravity" Standard

ระบบนี้ถูกออกแบบตามมาตรฐาน **"Antigravity"** เพื่อการแสดงผลข้อมูลทางยุทธวิธีที่แม่นยำที่สุด:

1. **Zero Jitter:** เป้าหมายไม่กระโดดไปมาแม้สัญญาณ GPS ไม่เสถียร
2. **Stable Orientation:** ทิศทางของหน่วยจะไม่หมุนมั่วเมื่อหยุดพัก
3. **Fluid Movement:** การแสดงผลต้องต่อเนื่อง เหมาะสำหรับ War Room Display

---

## 📄 License

Private / Restricted Use (Internal Only)

---

<div align="center">

**Developed for Advanced Tactical Monitoring**

</div>
