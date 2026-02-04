import { create } from 'zustand';

interface RulerState {
    isActive: boolean;
    points: { lat: number; lon: number }[];
    distance: number | null; // in meters

    toggleRuler: () => void;
    addPoint: (lat: number, lon: number) => void;
    clearPoints: () => void;
    setDistance: (d: number | null) => void;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export const useRulerStore = create<RulerState>((set, get) => ({
    isActive: false,
    points: [],
    distance: null,

    toggleRuler: () => set((state) => ({
        isActive: !state.isActive,
        points: [],
        distance: null,
    })),

    addPoint: (lat, lon) => {
        const { points } = get();
        const newPoints = [...points, { lat, lon }];

        // Calculate distance if we have 2 points
        let distance: number | null = null;
        if (newPoints.length === 2) {
            distance = haversineDistance(
                newPoints[0].lat,
                newPoints[0].lon,
                newPoints[1].lat,
                newPoints[1].lon
            );
        }

        // Reset if more than 2 points
        if (newPoints.length > 2) {
            set({ points: [{ lat, lon }], distance: null });
        } else {
            set({ points: newPoints, distance });
        }
    },

    clearPoints: () => set({ points: [], distance: null }),

    setDistance: (d) => set({ distance: d }),
}));
