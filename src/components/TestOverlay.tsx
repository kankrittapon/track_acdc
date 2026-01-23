import { ref, set } from 'firebase/database';
import { database } from '../lib/firebase';
import { DEFAULT_ORIGIN } from '../lib/coordinates';
import { useTestStore } from '../stores/useTestStore';

export default function TestOverlay() {
    const { isPlacementMode, placementRole, togglePlacementMode } = useTestStore();

    const injectTestCourse = () => {
        const mToLat = 1 / 111111;
        const mToLon = 1 / (111111 * Math.cos(DEFAULT_ORIGIN.lat * Math.PI / 180));
        const getPos = (dx: number, dy: number) => ({
            lat: DEFAULT_ORIGIN.lat + dy * mToLat,
            lon: DEFAULT_ORIGIN.lon + dx * mToLon
        });

        const devices = {
            'test-s_left': { id: 'test-s_left', role: 'start_buoy_left', ...getPos(-100, 0), heading: 0, speed: 0 },
            'test-s_right': { id: 'test-s_right', role: 'start_buoy_right', ...getPos(100, 0), heading: 0, speed: 0 },
            'test-m1': { id: 'test-m1', role: 'buoy_1', ...getPos(0, 1000), heading: 0, speed: 0 },
            'test-boat-1': { id: 'test-boat-1', role: 'racing_boat', teamId: 'THA-Test', ...getPos(0, -50), heading: 0, speed: 5 }
        };
        console.log('[TestOverlay] Spawning standard course...');
        set(ref(database, 'devices'), devices)
            .then(() => console.log('[TestOverlay] Spawn Success!'))
            .catch(err => console.error('[TestOverlay] Spawn Error:', err));
    };

    const clearDevices = () => {
        console.log('[TestOverlay] Clearing all devices...');
        set(ref(database, 'devices'), {})
            .then(() => console.log('[TestOverlay] Clear Success!'))
            .catch(err => console.error('[TestOverlay] Clear Error:', err));
    };

    const handleDragStart = (role: string) => {
        console.log('[TestOverlay] Selected Role:', role);
        togglePlacementMode(role);
    };

    return (
        <div className="absolute top-20 left-4 bg-slate-900/90 text-white p-4 rounded-lg border border-slate-700 w-64 pointer-events-auto backdrop-blur-md shadow-2xl z-50">
            <h2 className="text-xl font-bold mb-4 text-purple-400">🛠️ Builder Mode</h2>

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
                    <button
                        onClick={() => handleDragStart('buoy_1')}
                        className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'buoy_1' ? 'bg-yellow-900/50 border-yellow-500' : 'bg-slate-800'}`}
                    >
                        🟡 Mark 1
                    </button>
                    <button
                        onClick={() => handleDragStart('buoy_2')}
                        className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'buoy_2' ? 'bg-yellow-900/50 border-yellow-500' : 'bg-slate-800'}`}
                    >
                        🟡 Mark 2
                    </button>
                    <button
                        onClick={() => handleDragStart('buoy_3')}
                        className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'buoy_3' ? 'bg-orange-900/50 border-orange-500' : 'bg-slate-800'}`}
                    >
                        🟠 Mark 3
                    </button>
                    <button
                        onClick={() => handleDragStart('buoy_4')}
                        className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'buoy_4' ? 'bg-yellow-900/50 border-yellow-500' : 'bg-slate-800'}`}
                    >
                        🟡 Mark 4
                    </button>
                    <button
                        onClick={() => handleDragStart('start_buoy_left')}
                        className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'start_buoy_left' ? 'bg-orange-900/50 border-orange-500' : 'bg-slate-800'}`}
                    >
                        🚩 Start Pin
                    </button>
                    <button
                        onClick={() => handleDragStart('start_buoy_right')}
                        className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'start_buoy_right' ? 'bg-green-900/50 border-green-500' : 'bg-slate-800'}`}
                    >
                        🚤 Start Boat
                    </button>
                    <button
                        onClick={() => handleDragStart('finish_buoy_left')}
                        className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'finish_buoy_left' ? 'bg-blue-900/50 border-blue-500' : 'bg-slate-800'}`}
                    >
                        🏁 Finish Pin
                    </button>

                    {/* Semi Finish */}
                    <button
                        onClick={() => handleDragStart('semi_finish_left')}
                        className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'semi_finish_left' ? 'bg-purple-900/50 border-purple-500' : 'bg-slate-800'}`}
                    >
                        🟣 Semi-Fin L
                    </button>
                    <button
                        onClick={() => handleDragStart('semi_finish_right')}
                        className={`p-2 rounded border border-slate-600 hover:bg-slate-800 text-xs flex items-center justify-center gap-2 ${placementRole === 'semi_finish_right' ? 'bg-purple-900/50 border-purple-500' : 'bg-slate-800'}`}
                    >
                        🟣 Semi-Fin R
                    </button>
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
                    onClick={clearDevices}
                    className="w-full bg-red-700/50 hover:bg-red-600 py-2 rounded text-xs font-bold border border-red-600"
                >
                    🗑️ Clear All
                </button>
            </div>

            <p className="mt-4 text-[10px] text-slate-500 text-center">
                ?test=true active
            </p>
        </div>
    );
}
