# 🎖️ Track ACDC - Antigravity GPS Tracker

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)

**ระบบติดตาม GPS แบบ Real-time สำหรับการแข่งขันเรือใบ**

*"Antigravity" - การเคลื่อนที่ที่ลื่นไหลเหมือนไร้แรงโน้มถ่วง*

</div>

---

## ✨ Features

### 🗺️ แผนที่แบบ Real-time
- แสดงตำแหน่งเรือแข่งแบบ Live บนแผนที่ CartoDB
- ติดตามหลายลำพร้อมกันจาก Firebase

### 🎖️ ไอคอนทหารจิ๋ว (Soldier Icon)
- ไอคอนทหารสไตล์ Chibi แทนเรือแต่ละลำ
- หมุนตามทิศทาง (Heading) แบบ Real-time
- ป้ายชื่อทีมแสดงเหนือไอคอน

### 🌊 Antigravity Smoothing
- **GPS Noise Filter** - ใช้ Simple Moving Average กรอง noise
- **Heading Lock** - ล็อคทิศทางเมื่อความเร็วต่ำกว่า 0.5 knots
- **Smooth Transitions** - การเคลื่อนที่ลื่นไหลด้วย CSS animations

### 🚤 Boat Trail (Wake)
- แสดงเส้นทางเดินเรือย้อนหลัง
- เห็นภาพรวมการแข่งขันได้ชัดเจน

### 📏 Ruler Tool
- วัดระยะทางบนแผนที่
- แสดงผลเป็น เมตร/กิโลเมตร

### 🎬 Race Control
- ระบบ Replay ดูย้อนหลัง
- Auto Camera ซูมรวมทุกเรือ
- เลือกห้องแข่งขันจาก Firebase

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm หรือ pnpm

### Installation

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

### Test Mode
```
http://localhost:5173/?test=true
```
ใช้ทดสอบโดยไม่ต้องเชื่อมต่อ Firebase

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
| **3D** | React Three Fiber (optional) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── map/          # Map2D, SoldierMarker
│   ├── ui/           # Sidebar, RightMenu, Modals
│   └── logic/        # PlaybackDriver
├── lib/
│   ├── gpsSmoothing.ts   # Antigravity smoothing logic
│   ├── firebase.ts       # Firebase config
│   └── geoUtils.ts       # Geographic utilities
├── stores/
│   ├── useBoatStore.ts   # Boat state
│   ├── useRulerStore.ts  # Ruler tool state
│   └── useCourseStore.ts # Course/race state
└── App.tsx
```

---

## 🎯 The "Antigravity" Principle

ระบบนี้ถูกออกแบบตามหลัก **"Antigravity"** - ทำให้การแสดงผลการเคลื่อนที่ลื่นไหลที่สุด:

1. **ไม่กระโดด** - Markers ไม่ teleport แม้ GPS จะมี noise
2. **ไม่หมุนสุ่ม** - ล็อค heading เมื่อเรืออยู่นิ่ง
3. **Smooth Transitions** - ทุกการเคลื่อนไหวมี animation

---

## 📄 License

MIT License - Feel free to use and modify!

---

<div align="center">

**Made with ❤️ for Sailing Competitions**

</div>
