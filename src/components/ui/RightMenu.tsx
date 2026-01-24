import {
    Trophy,
    ZoomIn,
    ZoomOut,
    Maximize,
    Ruler,
    Users,
    Crosshair,
    Video, // Auto View?
    Settings,
    History,
    Navigation,
    FolderOpen // New
} from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useBoatStore } from '../../stores/useBoatStore';
import { useReplayStore } from '../../stores/useReplayStore';

export default function RightMenu() {
    const toggleScoreboard = useSettingsStore((s) => s.toggleScoreboard);
    const toggleSettings = useSettingsStore((s) => s.toggleSettings);
    const setFollowingBoat = useBoatStore((s) => s.setFollowingBoat);
    const selectedBoatId = useBoatStore((s) => s.selectedBoatId);
    const followingBoatId = useBoatStore((s) => s.followingBoatId);
    const isOverviewMode = useBoatStore((s) => s.isOverviewMode);
    const setOverviewMode = useBoatStore((s) => s.setOverviewMode);

    // Replay Selectors
    const showReplayUI = useReplayStore((s) => s.showReplayUI);
    const enableReplayMode = useReplayStore((s) => s.enableReplayMode);
    const disableReplayMode = useReplayStore((s) => s.disableReplayMode);

    // Helper for buttons
    const Btn = ({ icon: Icon, label, onClick, active = false }: any) => (
        <button
            onClick={onClick}
            className={`
                relative group flex items-center justify-center w-10 h-10 mb-2 rounded-md shadow-sm transition-all
                ${active
                    ? 'bg-blue-600 text-white shadow-blue-500/30'
                    : 'bg-white/90 text-slate-700 hover:bg-white hover:text-blue-600'
                }
                backdrop-blur-sm border border-white/20
            `}
            title={label}
        >
            <Icon size={20} strokeWidth={2} />

            {/* Tooltip (Left side) */}
            <span className="absolute right-full mr-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {label}
            </span>
        </button>
    );

    return (
        <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center z-50">
            <Btn icon={Trophy} label="ตารางคะแนน" onClick={toggleScoreboard} />

            <div className="h-px w-6 bg-slate-300/50 my-2" />

            <Btn icon={ZoomIn} label="ซูมเข้า" onClick={() => {
                // TODO: Dispatch zoom event or generic handler
                window.dispatchEvent(new CustomEvent('map-zoom-in'));
            }} />
            <Btn icon={ZoomOut} label="ซูมออก" onClick={() => {
                window.dispatchEvent(new CustomEvent('map-zoom-out'));
            }} />
            <Btn icon={Maximize} label="เต็มจอ" onClick={() => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }} />

            <div className="h-px w-6 bg-slate-300/50 my-2" />

            <Btn icon={Ruler} label="ไม้บรรทัด" onClick={() => { }} />
            <Btn
                icon={Users}
                label="ทุกทีม"
                active={isOverviewMode}
                onClick={() => {
                    setOverviewMode(!isOverviewMode);
                }}
            />
            <Btn
                icon={Crosshair}
                label="ติดตามเป้าหมาย"
                active={selectedBoatId !== null && followingBoatId === selectedBoatId}
                onClick={() => {
                    if (selectedBoatId) {
                        if (followingBoatId === selectedBoatId) {
                            setFollowingBoat(null);
                        } else {
                            setFollowingBoat(selectedBoatId);
                        }
                    } else {
                        // Maybe reset if nothing selected?
                        setFollowingBoat(null);
                    }
                }}
            />
            <Btn icon={Video} label="มุมมองอัตโนมัติ" onClick={() => {
                setFollowingBoat(null);
                window.dispatchEvent(new CustomEvent('camera-reset'));
            }} />

            <Btn icon={FolderOpen} label="เลือกห้อง" onClick={useSettingsStore.getState().toggleRoomList} />

            <Btn
                icon={History}
                label="ดูย้อนหลัง"
                active={showReplayUI}
                onClick={() => {
                    if (showReplayUI) {
                        disableReplayMode();
                    } else {
                        enableReplayMode();
                    }
                }}
            />

            <div className="h-px w-6 bg-slate-300/50 my-2" />

            {/* Wind Widget */}
            <div className={`
                relative group flex items-center justify-center w-10 h-10 mb-2 rounded-md shadow-sm transition-all
                bg-white/90 text-slate-700 backdrop-blur-sm border border-white/20
                hover:bg-white hover:text-blue-600 cursor-help
            `} title={`Wind: ${useSettingsStore.getState().windDirection}°`}>
                <div style={{ transform: `rotate(${useSettingsStore((s) => s.windDirection)}deg)` }}>
                    <Navigation size={20} strokeWidth={2} className="rotate-180" />
                </div>
                {/* Tooltip */}
                <span className="absolute right-full mr-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Wind: {useSettingsStore((s) => s.windDirection)}°
                </span>
            </div>

            <Btn icon={Settings} label="ตั้งค่า" onClick={toggleSettings} />
        </div>
    );
}
