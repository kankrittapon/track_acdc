import { useBoatStore } from '../../stores/useBoatStore';

export default function Dashboard() {
    const boats = useBoatStore((state) => state.boats);
    const boatList = Object.values(boats).sort((a, b) => b.speed - a.speed);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 flex justify-between items-start z-10">
            {/* Leaderboard */}
            <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl text-white pointer-events-auto min-w-[200px] border border-white/10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    ⛵ Leaderboard
                </h2>
                <div className="space-y-2">
                    {boatList.map((boat, index) => (
                        <div key={boat.id} className="flex items-center justify-between text-sm py-1 border-b border-white/10 last:border-0">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold w-5 ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                    #{index + 1}
                                </span>
                                <span>{boat.id}</span>
                            </div>
                            <span className="font-mono text-cyan-400">{boat.speed?.toFixed(1) || 0} kn</span>
                        </div>
                    ))}
                    {boatList.length === 0 && <div className="text-gray-400 text-sm italic">Waiting for signal...</div>}
                </div>
            </div>

            {/* Controls / Info */}
            <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl text-white pointer-events-auto border border-white/10">
                <div className="text-xs text-gray-400">SailTrace 3D v0.1</div>
            </div>
        </div>
    );
}
