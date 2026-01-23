import { Play, Pause, FastForward, SkipBack } from 'lucide-react';
import { useReplayStore } from '../../stores/useReplayStore';

const formatTime = (ms: number) => {
    // Simple formatter HH:MM:SS
    const date = new Date(ms);
    return date.toLocaleTimeString('th-TH', { hour12: false });
};

export default function ReplayControl() {
    const {
        showReplayUI,
        isPlaying,
        togglePlay,
        currentTime,
        seek,
        raceStartTime,
        raceFinishTime,
        playbackSpeed,
        setSpeed
    } = useReplayStore();

    // Use current time as fallback if no range
    const start = raceStartTime || currentTime;
    const end = raceFinishTime || (currentTime + 60000 * 5); // Default +5 min if unknown
    const progress = Math.min(100, Math.max(0, ((currentTime - start) / (end - start)) * 100));

    // Internal loop to drive slider UI updates smoothly if needed, 
    // but effectively we rely on parent update loop to sync `currentTime` to store.

    // NOTE: The actual "Tick" logic will drive `currentTime` in the store, 
    // which will re-render this component.

    if (!showReplayUI) return null;

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-black/80 backdrop-blur-md rounded-xl p-3 text-white shadow-2xl z-50 flex flex-col gap-2">

            {/* Top Bar: Time Info */}
            <div className="flex justify-between text-xs text-gray-400 font-mono px-1">
                <span>START: {formatTime(start)}</span>
                <span className="text-white font-bold text-base">{formatTime(currentTime)}</span>
                <span>FINISH: {end > start ? formatTime(end) : '--:--:--'}</span>
            </div>

            {/* Slider */}
            <div className="relative w-full h-6 flex items-center group cursor-pointer">
                {/* Track Background */}
                <div className="absolute w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                    {/* Progress Fill */}
                    <div
                        className="h-full bg-cyan-500 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Thumb (Visual Only, real input is hidden on top) */}
                <div
                    className="absolute w-4 h-4 bg-white rounded-full shadow-lg border-2 border-cyan-500 transition-all duration-100 ease-linear"
                    style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                />

                {/* Input Range for Interaction */}
                <input
                    type="range"
                    min={start}
                    max={end}
                    value={currentTime}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-1 px-4">
                <div className="flex items-center gap-4">
                    <button className="hover:text-cyan-400 transition" onClick={() => seek(start)}><SkipBack size={20} /></button>
                    <button
                        className="w-12 h-12 flex items-center justify-center bg-cyan-600 rounded-full hover:bg-cyan-500 transition shadow-lg hover:shadow-cyan-500/50"
                        onClick={togglePlay}
                    >
                        {isPlaying ? <Pause fill="white" size={24} /> : <Play fill="white ml-1" size={24} />}
                    </button>
                    <button
                        className="hover:text-cyan-400 transition flex items-center gap-1 min-w-[3rem]"
                        onClick={() => {
                            const speeds = [1, 2, 4, 10];
                            const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                            setSpeed(speeds[nextIdx]);
                        }}
                    >
                        <FastForward size={20} />
                        <span className="text-xs font-bold font-mono">{playbackSpeed}x</span>
                    </button>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400">STATUS</span>
                        <span className="text-xs font-bold text-green-400">REPLAY LOG</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
