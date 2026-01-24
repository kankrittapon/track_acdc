import { create } from "zustand";
import type { BoatData } from "./useBoatStore";

interface HistoryFrame {
  timestamp: number;
  boats: Record<string, BoatData>;
}

interface ReplayState {
  // Playback State
  isPlaying: boolean;
  currentTime: number; // Current playback timestamp
  playbackSpeed: number; // 1x, 2x, 4x, etc.
  showReplayUI: boolean; // Is Replay Mode Active? (Visible UI)

  // Data Helpers
  raceStartTime: number | null;
  raceFinishTime: number | null; // Auto-stop when reached

  // History Data (Client-side buffer)
  history: HistoryFrame[];

  // Actions
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  seek: (time: number) => void;
  reset: () => void;

  // Data Ingestion
  addHistoryFrame: (boats: Record<string, BoatData>, timestamp: number) => void;
  enableReplayMode: () => void; // Turn on UI
  disableReplayMode: () => void; // Return to Live
}

export const MAX_HISTORY_LENGTH = 100000; // Limit buffer size if needed

export const useReplayStore = create<ReplayState>((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  playbackSpeed: 1,
  showReplayUI: false, // Default hidden, user might need to toggle it or auto-show

  raceStartTime: null,
  raceFinishTime: null,
  history: [],

  setPlaying: (playing) => set({ isPlaying: playing }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSpeed: (speed) => set({ playbackSpeed: speed }),

  seek: (time) => set({ currentTime: time }),

  reset: () =>
    set({
      isPlaying: false,
      currentTime: get().raceStartTime || 0,
      history: [],
    }),

  addHistoryFrame: (boats, timestamp) =>
    set((state) => {
      const updates: Partial<ReplayState> = {};

      // 1. If it's the first frame, set start time
      if (state.history.length === 0) {
        updates.raceStartTime = timestamp;
        updates.currentTime = timestamp; // Sync current time to live if freshly started
      }

      // 2. Only add if timestamp > last timestamp (prevent dupes)
      const lastFrame = state.history[state.history.length - 1];
      if (lastFrame && timestamp <= lastFrame.timestamp) return {}; // No change

      // 3. PERFORMANCE FIX: Mutate array instead of creating new one
      // This avoids O(N) copy on every frame which causes GC pressure
      state.history.push({ timestamp, boats });

      // 4. Enforce Max Limit
      if (state.history.length > MAX_HISTORY_LENGTH) {
        state.history.shift(); // Remove oldest frame
      }

      // Return updates. Note: We return the SAME history array reference.
      // This is intentional for performance. Components needed granular updates
      // should subscribe to specific properties or we can use a version counter if needed.
      return {
        ...updates,
        history: state.history,
      };
    }),

  enableReplayMode: () => set({ showReplayUI: true, isPlaying: false }),
  disableReplayMode: () => set({ showReplayUI: false, isPlaying: false }),
}));
