import { useCourseStore } from '../../stores/useCourseStore';

export default function RaceControlBoard() {
    const raceName = useCourseStore((s) => s.raceName);

    if (!raceName) return null;

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-6 py-2 rounded-full border border-slate-700 shadow-xl backdrop-blur-md z-50 pointer-events-auto flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <div className="flex flex-col items-center leading-tight">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tactical Operation Center</span>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {raceName}
                </span>
            </div>
        </div>
    );
}
