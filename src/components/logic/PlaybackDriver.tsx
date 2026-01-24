import { useEffect } from 'react';
import { useBoatStore } from '../../stores/useBoatStore';
import { useReplayStore } from '../../stores/useReplayStore';

// Component to drive playback
export default function PlaybackDriver() {
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
