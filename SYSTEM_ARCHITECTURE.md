# System Architecture Diagram

```mermaid
graph TD
    subgraph "Field Operations"
        Soldier[Soldier/Unit Device] -->|GPS Data (Lat/Lon/Heading)| Firebase[Firebase Realtime Database]
        Drone[Drone Feed] -.->|Future: Video Stream| CommandCenter
    end

    subgraph "Backend Services"
        Firebase -->|Sync Data| AppEngine[Application Engine (React)]
        AppEngine -->|Process| Smoothing[Signal Stabilization (SMA)]
        AppEngine -->|Process| HeadingLock[Heading Lock Algorithm]
        AppEngine -->|Process| TrailGen[Trail Generation]
    end

    subgraph "Command Center (Client)"
        Smoothing -->|Smoothed Coordinates| MapView[Tactical Map View (Leaflet)]
        HeadingLock -->|Stable Heading| SoldierIcon[Tactical Icon]
        TrailGen -->|History Path| WakeTrail[Tactical Trail]
        
        User[Commander] -->|Interact| UI[Mission Control UI]
        UI -->|Zoom/Select| MapView
        UI -->|Measure| Ruler[Ruler Tool]
        UI -->|Replay| History[Mission Replay]
    end

    subgraph "Security Layer"
        Auth[Authentication] -->|Verify| User
        Firebase -->|Rules| Auth
    end

    classDef military fill:#1e293b,stroke:#3b82f6,color:#fff;
    class Soldier,AppEngine,MapView,CommandCenter military;
```
