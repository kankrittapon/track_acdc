import { create } from 'zustand';

interface TestStore {
    isPlacementMode: boolean;
    placementRole: string | null;
    togglePlacementMode: (role: string | null) => void;
}

export const useTestStore = create<TestStore>((set) => ({
    isPlacementMode: false,
    placementRole: null,
    togglePlacementMode: (role) => set({
        isPlacementMode: !!role,
        placementRole: role
    })
}));
