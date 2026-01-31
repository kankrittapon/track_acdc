import { Fragment, useState } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { X, Settings as SettingsIcon, Map as MapIcon, Flag, Anchor, Activity, LayoutTemplate } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useCourseStore } from '../../stores/useCourseStore';

export default function SettingsModal() {
    const { isSettingsOpen, setSettings, updateSetting, ...settings } = useSettingsStore();

    const tabs = [
        { name: 'ทั่วไป', icon: SettingsIcon, key: 'general' },
        { name: 'แผนที่', icon: MapIcon, key: 'map' },
        { name: 'การแข่งขัน', icon: Flag, key: 'race' },
        { name: 'ไอคอน', icon: Anchor, key: 'icon' },
        { name: 'การติดตาม', icon: Activity, key: 'tracking' },
        { name: 'เส้นอ้างอิง', icon: LayoutTemplate, key: 'ref' },
    ];

    const [selectedIndex, setSelectedIndex] = useState(0);

    // Helpers
    interface ToggleProps {
        label: string;
        value: boolean;
        onChange: (value: boolean) => void;
    }
    const Toggle = ({ label, value, onChange }: ToggleProps) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-300'}`}
                onClick={() => onChange(!value)}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    interface SliderProps {
        label: string;
        value: number;
        onChange: (value: number) => void;
        min?: number;
        max?: number;
        step?: number;
        unit?: string;
    }
    const Slider = ({ label, value, onChange, min = 0, max = 10, step = 1, unit = '' }: SliderProps) => (
        <div className="py-3 border-b border-slate-100 last:border-0">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className="text-xs text-slate-500 font-mono">{value}{unit}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );

    interface SelectProps {
        label: string;
        value: string;
        onChange: (value: string) => void;
        options: { value: string; label: string }[];
    }
    const Select = ({ label, value, onChange, options }: SelectProps) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white py-1"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <Transition show={isSettingsOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={() => setSettings(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all h-[600px]">
                                <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex} vertical>
                                    <div className="flex h-full">
                                        {/* Sidebar Tabs */}
                                        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col">
                                            <Dialog.Title className="text-lg font-bold text-slate-800 mb-6 px-2">การตั้งค่า (Settings)</Dialog.Title>
                                            <Tab.List className="flex flex-col gap-1">
                                                {tabs.map((tab) => (
                                                    <Tab key={tab.key} className={({ selected }) => `
                                                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-left transition-all outline-none
                                                    ${selected ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}
                                                `}>
                                                        <tab.icon size={18} />
                                                        {tab.name}
                                                    </Tab>
                                                ))}
                                            </Tab.List>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col">
                                            {/* Header */}
                                            <div className="flex items-center justify-between p-4 border-b border-slate-100">
                                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    {(() => {
                                                        const CurrentIcon = tabs[selectedIndex].icon;
                                                        return CurrentIcon ? <CurrentIcon className="text-blue-600" size={20} /> : null;
                                                    })()}
                                                    {tabs[selectedIndex].name}
                                                </h3>
                                                <button onClick={() => setSettings(false)} className="text-slate-400 hover:text-slate-600">
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            {/* Scrollable Panel */}
                                            <div className="flex-1 overflow-y-auto p-6">
                                                <Tab.Panels>
                                                    {/* 1. General */}
                                                    <Tab.Panel className="space-y-4">
                                                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Configuration</h4>
                                                            <Select label="ภาษา (Language)" value={settings.language} onChange={(v) => updateSetting('language', v)}
                                                                options={[{ value: 'TH', label: 'ไทย' }, { value: 'EN', label: 'English' }]} />
                                                            <Select label="รูปแบบเวลา (Time Keeping)" value={settings.timeKeepingMode} onChange={(v) => updateSetting('timeKeepingMode', v)}
                                                                options={[{ value: 'elapsed', label: 'จับเวลาเดินหน้า (Elapsed)' }, { value: 'countdown', label: 'นับถอยหลัง (Countdown)' }]} />
                                                            <Toggle label="เล่นซ้ำวนลูป (Loop Playback)" value={settings.loopPlayback} onChange={(v) => updateSetting('loopPlayback', v)} />
                                                        </div>
                                                    </Tab.Panel>

                                                    {/* 2. Map */}
                                                    <Tab.Panel className="space-y-4">
                                                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Map Setting</h4>
                                                            <Toggle label="ซูมนุ่มนวล (Smooth Zoom)" value={settings.smoothZoom} onChange={(v) => updateSetting('smoothZoom', v)} />
                                                            <Toggle label="กลับสี (Color Invert)" value={settings.colorInvert} onChange={(v) => updateSetting('colorInvert', v)} />
                                                            <Toggle label="แสดงชื่อสถานที่ (Show Place Names)" value={settings.showPlaceNames} onChange={(v) => updateSetting('showPlaceNames', v)} />
                                                        </div>
                                                    </Tab.Panel>

                                                    {/* 3. Race */}
                                                    <Tab.Panel className="space-y-4">
                                                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Race Setting</h4>
                                                            <Toggle label="เซ็นเซอร์ลม (Wind Sensors)" value={settings.showWindSensors} onChange={(v) => updateSetting('showWindSensors', v)} />
                                                            <Toggle label="ผู้เข้าแข่งขัน (Competitors)" value={settings.showCompetitors} onChange={(v) => updateSetting('showCompetitors', v)} />
                                                            <Slider label="ทิศทางลม (Wind Direction)" value={settings.windDirection} onChange={(v) => updateSetting('windDirection', v)} min={0} max={360} unit="°" />

                                                            <div className="h-px bg-slate-200 my-2" />

                                                            <Slider label="Layline Angle" value={settings.laylineAngle} onChange={(v) => updateSetting('laylineAngle', v)} min={30} max={60} unit="°" />
                                                            <Toggle label="Layline" value={settings.showLaylines} onChange={(v) => updateSetting('showLaylines', v)} />

                                                            <div className="h-px bg-slate-200 my-2" />

                                                            <Toggle label="Leading Line" value={settings.showLeadingLine} onChange={(v) => updateSetting('showLeadingLine', v)} />
                                                            <Toggle label="Leader Line Arc" value={settings.showLeaderLineArc} onChange={(v) => updateSetting('showLeaderLineArc', v)} />
                                                            <Toggle label="Ladder Line" value={settings.showLadderLine} onChange={(v) => updateSetting('showLadderLine', v)} />

                                                            <div className="h-px bg-slate-200 my-2" />
                                                            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                                                <span className="text-sm font-medium text-slate-700">Sequence Control</span>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => useCourseStore.getState().prevLeg()}
                                                                        className="px-3 py-1 bg-slate-200 rounded text-slate-600 hover:bg-slate-300 text-sm"
                                                                    >
                                                                        Prev
                                                                    </button>
                                                                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-500 text-sm font-mono">
                                                                        {useCourseStore.getState().activeLegIndex}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => useCourseStore.getState().nextLeg()}
                                                                        className="px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
                                                                    >
                                                                        Next Leg
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Tab.Panel>

                                                    {/* 4. Icon */}
                                                    <Tab.Panel className="space-y-4">
                                                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Icon Setting</h4>
                                                            <Toggle label="ชื่อทีม (Team Name)" value={settings.showTeamName} onChange={(v) => updateSetting('showTeamName', v)} />
                                                            <Toggle label="แสดงเฉพาะเลขใบ (Only Sail Number)" value={settings.onlySailNumber} onChange={(v) => updateSetting('onlySailNumber', v)} />
                                                            <Toggle label="ธงชาติ (Flag)" value={settings.showFlag} onChange={(v) => updateSetting('showFlag', v)} />
                                                            <Toggle label="สถานะเรือ (Boat Condition)" value={settings.showBoatCondition} onChange={(v) => updateSetting('showBoatCondition', v)} />
                                                            <Toggle label="รายละเอียดการแล่น (Sailing Details)" value={settings.showSailingDetails} onChange={(v) => updateSetting('showSailingDetails', v)} />

                                                            <div className="h-px bg-slate-200 my-2" />

                                                            <Slider label="ขนาดไอคอน (Icon Size)" value={settings.iconSize} onChange={(v) => updateSetting('iconSize', v)} min={1} max={5} step={0.5} />
                                                            <Toggle label="Default Display Rib" value={settings.defaultDisplayRib} onChange={(v) => updateSetting('defaultDisplayRib', v)} />
                                                        </div>
                                                    </Tab.Panel>

                                                    {/* 5. Tracking */}
                                                    <Tab.Panel className="space-y-4">
                                                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tracking Setting</h4>
                                                            <Select label="จุดติดตาม (Tracking Point)" value={settings.trackingPoint} onChange={(v) => updateSetting('trackingPoint', v)}
                                                                options={[{ value: 'center', label: 'Center' }, { value: 'bow', label: 'Bow' }, { value: 'stern', label: 'Stern' }]} />
                                                            <Select label="โหมดติดตาม (Tracking Mode)" value={settings.trackingMode} onChange={(v) => updateSetting('trackingMode', v)}
                                                                options={[{ value: 'fixed', label: 'Fixed' }, { value: 'relative', label: 'Relative' }]} />

                                                            <div className="h-px bg-slate-200 my-2" />

                                                            <Slider label="ความยาวหาง (Tracking Length)" value={settings.trailLength} onChange={(v) => updateSetting('trailLength', v)} min={0} max={300} unit="s" />
                                                            <Slider label="ความกว้าง (Width)" value={settings.trailWidth} onChange={(v) => updateSetting('trailWidth', v)} min={1} max={10} />
                                                            <Slider label="ความสว่าง (Brightness)" value={settings.trailBrightness} onChange={(v) => updateSetting('trailBrightness', v)} min={0.1} max={2} step={0.1} />

                                                            <Toggle label="Data Smoothing" value={settings.dataSmoothing} onChange={(v) => updateSetting('dataSmoothing', v)} />
                                                        </div>
                                                    </Tab.Panel>

                                                    {/* 6. Reference Line */}
                                                    <Tab.Panel className="space-y-4">
                                                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reference Line Setting</h4>
                                                            <Toggle label="พื้นที่ทุ่น (Mark Area)" value={settings.markArea} onChange={(v) => updateSetting('markArea', v)} />
                                                            <Slider label="รัศมี (Radius)" value={settings.markAreaRadius} onChange={(v) => updateSetting('markAreaRadius', v)} min={10} max={200} unit="m" />
                                                            <Toggle label="เส้นกลาง (Middle Line)" value={settings.middleLine} onChange={(v) => updateSetting('middleLine', v)} />
                                                            <Toggle label="พื้นที่สามเหลี่ยม (Triangle Area)" value={settings.triangleArea} onChange={(v) => updateSetting('triangleArea', v)} />
                                                            <Toggle label="พื้นที่จุดสตาร์ท (Start Area)" value={settings.startArea} onChange={(v) => updateSetting('startArea', v)} />
                                                        </div>
                                                    </Tab.Panel>
                                                </Tab.Panels>
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Group>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
