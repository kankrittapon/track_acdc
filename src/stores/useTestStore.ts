import { create } from 'zustand';

interface TestStore {
    isPlacementMode: boolean;
    placementRole: string | null;
    localDevices: Record<string, any>; // Persistent store for offline mode
    laps: number;
    togglePlacementMode: (role: string | null) => void;
    updateLocalDevice: (id: string, data: any | null) => void; // null to delete
    resetLocalDevices: (devices: Record<string, any>) => void;
    setLaps: (laps: number) => void;
}

export const useTestStore = create<TestStore>((set) => ({
    isPlacementMode: false,
    placementRole: null,
    localDevices: {},
    laps: 2,
    togglePlacementMode: (role) => set({
        isPlacementMode: !!role,
        placementRole: role
    }),
    updateLocalDevice: (id, data) => set((state) => {
        const newDevices = { ...state.localDevices };
        if (data === null) {
            delete newDevices[id];
        } else {
            newDevices[id] = data;
        }
        return { localDevices: newDevices };
    }),
    resetLocalDevices: (devices) => set({ localDevices: devices }),
    setLaps: (laps) => set({ laps })
}));
