import { create } from 'zustand';

interface SettingsState {
    // UI State
    showScoreboard: boolean;
    isSettingsOpen: boolean;
    showRoomList: boolean; // New

    // General
    language: 'TH' | 'EN';
    timeKeepingMode: 'elapsed' | 'countdown';
    loopPlayback: boolean;

    // Map Config
    smoothZoom: boolean;
    colorInvert: boolean;
    showPlaceNames: boolean;

    // Race Config
    showWindSensors: boolean;
    showCompetitors: boolean;
    laylineAngle: number;
    showLeadingLine: boolean;
    showLeaderLineArc: boolean;
    showLaylines: boolean;
    showLadderLine: boolean;
    windDirection: number;

    // Icon Config
    showTeamName: boolean;
    onlySailNumber: boolean;
    showFlag: boolean;
    showBoatCondition: boolean;
    showSailingDetails: boolean;
    iconSize: number; // 1-5 scale
    defaultDisplayRib: boolean;

    // Tracking Config
    trackingPoint: 'center' | 'bow' | 'stern';
    trackingMode: 'fixed' | 'relative';
    trailLength: number; // seconds
    trailWidth: number;
    trailBrightness: number;
    dataSmoothing: boolean;

    // Reference Line
    markArea: boolean;
    markAreaRadius: number;
    middleLine: boolean;
    triangleArea: boolean;
    startArea: boolean;

    // Actions
    toggleScoreboard: () => void;
    setScoreboard: (v: boolean) => void;
    toggleSettings: () => void;
    setSettings: (v: boolean) => void;
    toggleRoomList: () => void; // New
    updateSetting: (key: keyof SettingsState, value: any) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    // Defaults matching user request/reasonable starts
    showScoreboard: false,
    isSettingsOpen: false,
    showRoomList: false,

    language: 'TH',
    timeKeepingMode: 'elapsed',
    loopPlayback: false,

    smoothZoom: true,
    colorInvert: false,
    showPlaceNames: true,

    showWindSensors: true,
    showCompetitors: true,
    laylineAngle: 45,
    showLeadingLine: true,
    showLeaderLineArc: false,
    showLaylines: false,
    showLadderLine: false,
    windDirection: 45,

    showTeamName: true,
    onlySailNumber: false,
    showFlag: true,
    showBoatCondition: false,
    showSailingDetails: false,
    iconSize: 3,
    defaultDisplayRib: false,

    trackingPoint: 'center',
    trackingMode: 'fixed',
    trailLength: 10,
    trailWidth: 2,
    trailBrightness: 1,
    dataSmoothing: true,

    markArea: true,
    markAreaRadius: 50,
    middleLine: false,
    triangleArea: false,
    startArea: true,

    // Actions
    toggleScoreboard: () => set((state) => ({ showScoreboard: !state.showScoreboard })),
    setScoreboard: (v) => set({ showScoreboard: v }),
    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
    setSettings: (v) => set({ isSettingsOpen: v }),
    toggleRoomList: () => set((state) => ({ showRoomList: !state.showRoomList })),
    updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
}));
