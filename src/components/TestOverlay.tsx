import { DEFAULT_ORIGIN } from '../lib/coordinates';
import { useEffect } from 'react';
import { useTestStore } from '../stores/useTestStore';
import { useBoatStore } from '../stores/useBoatStore';
import type { BoatData } from '../stores/useBoatStore';
import { useCourseStore } from '../stores/useCourseStore';
import { buildCourseFromDevices } from '../lib/courseGenerator';

export default function TestOverlay() {
    const { isPlacementMode, placementRole, togglePlacementMode, localDevices, resetLocalDevices, laps, setLaps } = useTestStore();
    const setBoats = useBoatStore((s) => s.setBoats);
    const setCourse = useCourseStore((s) => s.setCourse);

    // Sync Local Devices to Stores (Reactive)
    useEffect(() => {
        // 1. Separate Marks & Boats
        const boatsOnly: Record<string, BoatData> = {};
        const markDevices: Record<string, any> = {};

        Object.values(localDevices).forEach((d: any) => {
            const role = d.role || 'racing_boat';
            if (role === 'racing_boat') {
                boatsOnly[d.id] = {
                    ...d,
                    id: d.id,
                    team: d.teamId || d.id,
                    lastUpdated: Date.now()
                } as BoatData;
            } else {
                markDevices[d.id] = d;
            }
        });

        // 2. Update Stores
        setBoats(boatsOnly);

        const dynamicCourse = buildCourseFromDevices(markDevices, laps);
        if (dynamicCourse) {
            setCourse(dynamicCourse);
        } else {
            setCourse(null);
        }
    }, [localDevices, setBoats, setCourse, laps]);

    const injectTestCourse = () => {
        const mToLat = 1 / 111111;
        const mToLon = 1 / (111111 * Math.cos(DEFAULT_ORIGIN.lat * Math.PI / 180));
        const getPos = (dx: number, dy: number) => ({
            lat: DEFAULT_ORIGIN.lat + dy * mToLat,
            lon: DEFAULT_ORIGIN.lon + dx * mToLon
        });

        const devices = {
            'test-start-pin': { id: 'test-start-pin', role: 'start_pin', ...getPos(-50, -500), heading: 0, speed: 0 },
            'test-start-boat': { id: 'test-start-boat', role: 'start_boat', ...getPos(50, -500), heading: 0, speed: 0 },
            
            'test-m1': { id: 'test-m1', role: 'buoy_1', ...getPos(0, 1000), heading: 0, speed: 0 },
            'test-m1a': { id: 'test-m1a', role: 'buoy_1a', ...getPos(-100, 1000), heading: 0, speed: 0 }, // Offset Left
            
            'test-g4s': { id: 'test-g4s', role: 'gate_4s', ...getPos(50, 0), heading: 0, speed: 0 },
            'test-g4p': { id: 'test-g4p', role: 'gate_4p', ...getPos(-50, 0), heading: 0, speed: 0 },

            'test-finish-pin': { id: 'test-finish-pin', role: 'finish_pin', ...getPos(-50, -600), heading: 0, speed: 0 },
            'test-finish-boat': { id: 'test-finish-boat', role: 'finish_boat', ...getPos(50, -600), heading: 0, speed: 0 },

            'test-boat-1': { id: 'test-boat-1', role: 'racing_boat', teamId: 'THA-Test', ...getPos(0, -50), heading: 0, speed: 5 }
        };
        console.log('[TestOverlay] Injecting local test course...');
        resetLocalDevices({ ...localDevices, ...devices });
    };

    const clearField = () => {
        console.log('[TestOverlay] Clearing FIELD marks only (Keep Boats)...');
        
        // Filter out marks
        const boatsOnly: Record<string, any> = {};
        Object.entries(localDevices).forEach(([id, d]: [string, any]) => {
            if (d.role === 'racing_boat') {
                boatsOnly[id] = d;
            }
        });

        resetLocalDevices(boatsOnly);
        console.log('[TestOverlay] Field Cleared (Local).');
    };

    const handleDragStart = (role: string) => {
        console.log('[TestOverlay] Selected Role:', role);
        togglePlacementMode(role);
    };

    return (
        <div className="absolute top-20 left-4 bg-slate-900/90 text-white p-4 rounded-lg border border-slate-700 w-64 pointer-events-auto backdrop-blur-md shadow-2xl z-50">
            <h2 className="text-xl font-bold mb-4 text-purple-400">🛠️ Builder Mode</h2>

            {/* Laps Control */}
            <div className="flex items-center justify-between bg-slate-800 p-2 rounded mb-4 border border-slate-700">
                <span className="text-xs font-bold text-slate-300">LAPS / LEGS</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setLaps(Math.max(1, laps - 1))} className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600">-</button>
                    <span className="font-mono font-bold w-4 text-center">{laps}</span>
                    <button onClick={() => setLaps(laps + 1)} className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600">+</button>
                </div>
            </div>
            
            {/* Status */}
            {isPlacementMode && (
                <div className="mb-4 bg-yellow-600/50 p-2 rounded text-sm text-center animate-pulse border border-yellow-500">
                    CLICK ON WATER TO PLACE
                    <div className="font-bold">{placementRole?.toUpperCase().replace('_', ' ')}</div>
                    <button onClick={() => togglePlacementMode(null)} className="text-xs underline mt-1">Cancel</button>
                </div>
            )}

            {/* Draggables (Clickable actually) */}
            <div className="space-y-2 mb-6">
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Click to Place:</p>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDragStart('buoy_1')} className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'buoy_1' ? 'bg-yellow-900/50 border-yellow-500' : 'bg-slate-800'}`}>🟡 Mark 1</button>
                    <button onClick={() => handleDragStart('buoy_1a')} className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'buoy_1a' ? 'bg-orange-900/50 border-orange-500' : 'bg-slate-800'}`}>🟠 Mark 1A</button>
                    
                    <button onClick={() => handleDragStart('gate_4s')} className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'gate_4s' ? 'bg-green-900/50 border-green-500' : 'bg-slate-800'}`}>🟢 Gate 4S</button>
                    <button onClick={() => handleDragStart('gate_4p')} className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'gate_4p' ? 'bg-green-900/50 border-green-500' : 'bg-slate-800'}`}>🟢 Gate 4P</button>

                    <button onClick={() => handleDragStart('start_pin')} className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'start_pin' ? 'bg-orange-900/50 border-orange-500' : 'bg-slate-800'}`}>🚩 Start Pin</button>
                    <button onClick={() => handleDragStart('start_boat')} className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'start_boat' ? 'bg-green-900/50 border-green-500' : 'bg-slate-800'}`}>🚤 Start Boat</button>
                    
                    <button onClick={() => handleDragStart('finish_pin')} className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'finish_pin' ? 'bg-blue-900/50 border-blue-500' : 'bg-slate-800'}`}>🏁 Finish Pin</button>
                    <button onClick={() => handleDragStart('finish_boat')} className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'finish_boat' ? 'bg-blue-900/50 border-blue-500' : 'bg-slate-800'}`}>🏁 Finish Boat</button>
                </div>
            </div>

            {/* Utilities */}
            <div className="border-t border-slate-700 pt-4 space-y-2">
                <button
                    onClick={injectTestCourse}
                    className="w-full bg-green-700/50 hover:bg-green-600 py-2 rounded text-xs font-bold border border-green-600"
                >
                    🚩 Spawn Std Course
                </button>
                <button
                    onClick={clearField}
                    className="w-full bg-red-700/50 hover:bg-red-600 py-2 rounded text-xs font-bold border border-red-600"
                >
                    🗑️ Clear Field
                </button>
            </div>

            <p className="mt-4 text-[10px] text-slate-500 text-center">
                ?test=true active (Offline)
            </p>
        </div>
    );
}
