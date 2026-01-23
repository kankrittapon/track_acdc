import Scene from './components/canvas/Scene';
import Sidebar from './components/ui/Sidebar';
import RightMenu from './components/ui/RightMenu';
import SettingsModal from './components/ui/SettingsModal';
import ReplayControl from './components/ui/ReplayControl';
// import SimulationController from './components/SimulationController'; // REMOVED
import DataController from './components/DataController';
import TestOverlay from './components/TestOverlay';
import { useBoatStore } from './stores/useBoatStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useReplayStore } from './stores/useReplayStore';
import { useEffect } from 'react';

import RaceControlBoard from './components/ui/RaceControlBoard';

// Component to drive playback
function PlaybackDriver() {
  const isPlaying = useReplayStore((s) => s.isPlaying);

  useEffect(() => {
    let frameId: number;
    let lastTick = performance.now();

    const loop = () => {
      const now = performance.now();
      const delta = now - lastTick;
      lastTick = now;

      const { currentTime, playbackSpeed, seek, history } = useReplayStore.getState();

      // Advance time
      const newTime = currentTime + (delta * playbackSpeed);
      seek(newTime);

      // Find frame
      const frame = history.find(curr => curr.timestamp >= newTime);

      if (frame) {
        useBoatStore.setState({ boats: frame.boats });
      }

      frameId = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      lastTick = performance.now();
      loop();
    }

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]); // Only re-run if play state changes

  // NEW: React to manual time seeking when PAUSED
  useEffect(() => {
    const unsub = useReplayStore.subscribe((state) => {
      if (!state.isPlaying && state.showReplayUI) {
        // Determine frame for current time
        const frame = state.history.find(curr => curr.timestamp >= state.currentTime);
        if (frame) {
          useBoatStore.setState({ boats: frame.boats });
        }
      }
    });
    return () => unsub();
  }, []);

  return null;
}

function App() {
  const showScoreboard = useSettingsStore((s) => s.showScoreboard);

  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden relative">
      {/* Logic & Controllers */}
      <DataController />
      <PlaybackDriver />
      {/* <SimulationController /> Removed */}

      {/* 3D Scene (Includes Canvas) */}
      <div className="absolute inset-0 z-0">
        <Scene />
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
        </div>
      </div>
    </div>
  );
}

export default App;
