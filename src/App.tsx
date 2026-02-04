import { useEffect } from 'react';
import Map2D from './components/map/Map2D';
import Sidebar from './components/ui/Sidebar';
import RightMenu from './components/ui/RightMenu';
import SettingsModal from './components/ui/SettingsModal';
import ReplayControl from './components/ui/ReplayControl';
import RoomListModal from './components/ui/RoomListModal';
import DataController from './components/DataController';
import TestOverlay from './components/TestOverlay';
import { useSettingsStore } from './stores/useSettingsStore';

import RaceControlBoard from './components/ui/RaceControlBoard';

import PlaybackDriver from './components/logic/PlaybackDriver';


import Presentation from './components/Presentation';

function App() {
  const showScoreboard = useSettingsStore((s) => s.showScoreboard);

  // Simple routing
  if (window.location.pathname === '/presentation') {
    return <Presentation />;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (!roomParam) {
      // If no room is selected (Dashboard mode), ensure the room list is open
      useSettingsStore.setState({ showRoomList: true });
    }
  }, []);

  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden relative">
      {/* Logic & Controllers */}
      <DataController />
      <PlaybackDriver />
      {/* <SimulationController /> Removed */}

      {/* 3D Scene (Includes Canvas) */}
      <div className="absolute inset-0 z-0">
        <Map2D />
      </div>

      {/* UI Layer (Z-Index > 0) */}
      <div className="relative z-10 pointer-events-none w-full h-full">
        {/* Builder Mode Overlay */}
        {window.location.search.includes('test=true') && <TestOverlay />}

        {/* Pointer events none for container, auto for children to click through */}

        {/* Left Sidebar */}
        {showScoreboard && (
          <div className="absolute left-0 top-0 h-full pointer-events-auto">
            <Sidebar />
          </div>
        )}

        {/* Top Center Race Control */}
        <RaceControlBoard />

        {/* Right Menu */}
        <div className="absolute right-0 top-0 h-full pointer-events-auto">
          <RightMenu />
        </div>

        {/* Bottom Replay Control */}
        <div className="absolute bottom-0 left-0 w-full pointer-events-auto">
          <ReplayControl />
        </div>

        {/* Modals */}
        <div className="pointer-events-auto">
          <SettingsModal />
          <RoomListModal />
        </div>
      </div>
    </div>
  );
}

export default App;
