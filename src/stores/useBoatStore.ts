import { create } from 'zustand';

export interface BoatData {
    id: string;
    lat: number;
    lon: number;
    speed: number;
    heading: number;
    team: string;
    flagUrl?: string; // Optional URL for country flag
    role?: string; // e.g. 'racing_boat' or 'buoy_1'
    lastUpdated: number;
    lastPacketTime?: number; // Remote timestamp from device
    // Antigravity additions
    trail?: { lat: number; lon: number }[]; // Position history for wake
    isStationary?: boolean; // True if speed < 0.5 knots
}

interface BoatStore {
    boats: Record<string, BoatData>;
    selectedBoatId: string | null;
    followingBoatId: string | null;
    isOverviewMode: boolean; // Continuous "All Teams" view
    setBoats: (boats: Record<string, BoatData>) => void;
    updateBoat: (id: string, data: Partial<BoatData>) => void;
    setSelectedBoat: (id: string | null) => void;
    setFollowingBoat: (id: string | null) => void;
    setOverviewMode: (active: boolean) => void;
}

export const useBoatStore = create<BoatStore>((set) => ({
    boats: {},
    selectedBoatId: null,
    followingBoatId: null,
    isOverviewMode: false,
    setBoats: (boats) => set({ boats }),
    updateBoat: (id, data) => set((state) => ({
        boats: {
            ...state.boats,
            [id]: {
                ...(state.boats[id] || {}),
                ...data
            }
        }
    })),
    setSelectedBoat: (id) => set({ selectedBoatId: id }),
    setFollowingBoat: (id) => set({ followingBoatId: id, isOverviewMode: false }), // Disable overview if following
    setOverviewMode: (active) => set({ isOverviewMode: active, followingBoatId: null }) // Disable follow if overview
}));
