import { create } from 'zustand';
import type { BoatData } from './useBoatStore';

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

    reset: () => set({
        isPlaying: false,
        currentTime: get().raceStartTime || 0,
        history: []
    }),

    addHistoryFrame: (boats, timestamp) => set((state) => {
        // If it's the first frame, set start time
        const updates: Partial<ReplayState> = {};
        if (state.history.length === 0) {
            updates.raceStartTime = timestamp;
            updates.currentTime = timestamp; // Sync current time to live if freshly started
        }

        // Only add if timestamp > last timestamp (prevent dupes)
        const lastTime = state.history[state.history.length - 1]?.timestamp || 0;
        if (timestamp <= lastTime) return {}; // No change

        const newHistory = [...state.history, { timestamp, boats }];

        return {
            ...updates,
            history: newHistory
        };
    }),

    enableReplayMode: () => set({ showReplayUI: true, isPlaying: false }),
    disableReplayMode: () => set({ showReplayUI: false, isPlaying: false })
}));
