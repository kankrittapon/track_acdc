import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { database } from '../../lib/firebase';
import { ref, get } from 'firebase/database';
import { X, Video, Clock } from 'lucide-react';

interface RoomInfo {
    id: string;
    name: string;
    createdAt: number;
}

export default function RoomListModal() {
    const showRoomList = useSettingsStore((s) => s.showRoomList);
    const toggleRoomList = useSettingsStore((s) => s.toggleRoomList);

    const [rooms, setRooms] = useState<RoomInfo[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter logic
    const isTestMode = new URLSearchParams(window.location.search).get('test') === 'true';
    const rootPath = isTestMode ? 'test/' : '';

    useEffect(() => {
        if (showRoomList) {
            setTimeout(() => setLoading(true), 0);
            const roomsRef = ref(database, `${rootPath}rooms`);
            get(roomsRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const list: RoomInfo[] = Object.entries(data).map(([key, val]: [string, unknown]) => {
                        const v = val as { name?: string; createdAt?: number };
                        return {
                            id: key,
                            name: v.name || 'Unnamed Room',
                            createdAt: v.createdAt || 0
                        };
                    });
                    // Sort descending by date
                    list.sort((a, b) => b.createdAt - a.createdAt);
                    setRooms(list);
                } else {
                    setRooms([]);
                }
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [showRoomList, rootPath]);

    const handleSelectRoom = (roomId: string | null) => {
        const url = new URL(window.location.href);
        if (roomId) {
            url.searchParams.set('room', roomId);
        } else {
            url.searchParams.delete('room'); // Auto mode
        }
        window.history.pushState({}, '', url.toString());
        // Forcing a reload because DataController relies on initial mount (mostly) or we can listen to popstate?
        // DataController DOES listen to params changes?
        // Actually DataController uses `window.location.search` inside useEffect.
        // It depends on dependency array. `useEffect(..., [])` runs ONCE.
        // So we MUST reload to apply new room.
        window.location.reload();
    };

    if (!showRoomList) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Video size={20} className="text-blue-400" />
                        {new URLSearchParams(window.location.search).get('room') ? 'Switch Room' : 'Select Race Room'}
                    </h2>
                    {/* Only show close button if a room is already selected (allow closing to stay in current room) */}
                    {new URLSearchParams(window.location.search).get('room') && (
                        <button onClick={toggleRoomList} className="text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading && <div className="p-4 text-center text-slate-400">Loading rooms...</div>}

                    {!loading && (
                        <>
                            <div
                                onClick={() => handleSelectRoom(null)}
                                className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-lg cursor-pointer border border-dashed border-slate-600 transition-colors group"
                            >
                                <div className="font-semibold text-blue-400 group-hover:text-blue-300">Auto (Latest Live)</div>
                                <div className="text-xs text-slate-400">Automatically follow the active race</div>
                            </div>

                            <div className="h-px bg-slate-700 my-2" />

                            {rooms.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">No rooms found in {rootPath || 'production'}</div>
                            ) : (
                                rooms.map(room => (
                                    <div
                                        key={room.id}
                                        onClick={() => handleSelectRoom(room.id)}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer border border-slate-700 transition-colors flex justify-between items-center group"
                                    >
                                        <div>
                                            <div className="font-medium text-slate-200 group-hover:text-white">{room.name}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock size={10} />
                                                {new Date(room.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        {/* <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-500">ID: {room.id.slice(0,4)}...</span> */}
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-700 bg-slate-800/50 text-xs text-center text-slate-500">
                    {isTestMode ? '🔴 TEST MODE' : '🟢 LIVE MODE'}
                </div>
            </div>
        </div>
    );
}
