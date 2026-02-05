import { useBoatStore } from '../../stores/useBoatStore';

const TEAM_COLORS: Record<string, string> = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    white: 'bg-white',
    green: 'bg-green-500',
};

export default function Sidebar() {
    const { boats, selectedBoatId, setSelectedBoat, setFollowingBoat, followingBoatId } = useBoatStore();

    // Sort boats by ID (or rank if available)
    const sortedBoats = Object.values(boats).sort((a, b) => a.id.localeCompare(b.id));

    return (
        <div className="absolute top-4 left-4 w-80 bg-slate-900/90 text-white rounded-lg shadow-xl overflow-hidden backdrop-blur-sm border border-slate-700 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>📡</span> Tactical Operation Center
                </h2>
                <div className="text-xs text-slate-400 mt-1">
                    {sortedBoats.length} Units Online
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {sortedBoats.map((boat) => {
                    const isSelected = selectedBoatId === boat.id;
                    const isFollowing = followingBoatId === boat.id;
                    const colorClass = TEAM_COLORS[boat.team] || 'bg-gray-400';

                    // Check Offline Status (> 10 seconds silence)
                    const timeSinceLastPacket = Date.now() - (boat.lastPacketTime || boat.lastUpdated);
                    const isOffline = timeSinceLastPacket > 10000;

                    return (
                        <div
                            key={boat.id}
                            onClick={() => setSelectedBoat(boat.id)}
                            className={`
                                p-3 border-b border-slate-700/50 cursor-pointer transition-colors relative
                                ${isSelected ? 'bg-slate-700' : 'hover:bg-slate-800'}
                            `}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-slate-500' : colorClass}`} />
                                    <span className={`font-bold ${isOffline ? 'text-slate-500' : 'text-white'}`}>
                                        {boat.id}
                                        {isOffline && <span className="ml-2 text-[10px] uppercase text-red-500 bg-red-500/10 px-1 rounded">Offline</span>}
                                    </span>
                                </div>
                                <span className="font-mono text-sm text-cyan-400">
                                    {boat.speed.toFixed(1)} kn
                                </span>
                            </div>

                            {/* Details visible when selected */}
                            {isSelected && (
                                <div className="mt-2 text-xs text-slate-300 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                                    <div>HDG: {boat.heading.toFixed(0)}°</div>
                                    <div>LAT: {boat.lat.toFixed(4)}</div>

                                    {/* Action Buttons */}
                                    <div className="col-span-2 mt-2 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newId = isFollowing ? null : boat.id;
                                                setFollowingBoat(newId);
                                                // Identify if we should snap? CameraController will handle 'first frame' logic if improved.
                                            }}
                                            className={`
                                                flex-1 py-1.5 rounded font-bold text-center transition-all
                                                ${isFollowing
                                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'}
                                            `}
                                        >
                                            {isFollowing ? '⛔ Stop Tracking' : '🎯 Track Camera'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Active Tracking Indicator */}
                            {isFollowing && !isSelected && (
                                <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
