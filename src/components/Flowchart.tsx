import { ArrowLeft, Database, Globe, Server, Shield, Smartphone } from "lucide-react";

export default function Flowchart() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center">

            {/* Header */}
            <div className="w-full max-w-[95%] xl:max-w-7xl flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                    <a href="/presentation" className="p-2 hover:bg-slate-900 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </a>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                            System Data Flow
                        </h1>
                        <p className="text-slate-500 text-sm">การไหลของข้อมูลในระบบ Track ACDC</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-mono uppercase">
                    Architecture Overview
                </div>
            </div>

            {/* Diagram Container */}
            <div className="relative w-full max-w-[95%] xl:max-w-7xl bg-slate-900/50 rounded-3xl p-6 lg:p-12 border border-slate-800 shadow-2xl overflow-x-auto">

                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]"></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-4 items-stretch justify-between min-w-[1000px] lg:min-w-0">

                    {/* Step 1: Source */}
                    <div className="flex-1 flex flex-col gap-4 min-w-[200px]">
                        <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 relative group h-full flex flex-col shadow-lg hover:shadow-blue-900/20 transition-all hover:-translate-y-1">
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-4 ring-slate-950 z-10">1</div>
                            <div className="flex items-center gap-4 mb-4 border-b border-slate-700/50 pb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                    <Smartphone className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Field Unit App</h3>
                                    <p className="text-xs text-slate-400 mt-1">Android (Kotlin)</p>
                                </div>
                            </div>
                            <ul className="text-sm text-slate-300 space-y-3 list-disc list-inside flex-1">
                                <li><strong>FusedLocationProvider</strong><br /><span className="text-xs text-slate-500 ml-4">รับค่า GPS (Lat/Lon)</span></li>
                                <li>แปลง Speed (m/s → Knots)</li>
                                <li>ส่งตรงขึ้น Firebase RTDB</li>
                            </ul>
                        </div>
                        <div className="flex-1 min-h-[40px] border-l-2 border-dashed border-slate-700 ml-8 lg:hidden"></div>
                    </div>

                    {/* Arrow 1 */}
                    <div className="hidden lg:flex flex-col items-center justify-center text-slate-600 px-2 shrink-0">
                        <div className="text-[10px] font-mono mb-2 uppercase tracking-wider text-slate-500">JSON / Internet</div>
                        <div className="w-16 h-0.5 bg-slate-700 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
                        </div>
                    </div>

                    {/* Step 2: Database */}
                    <div className="flex-1 flex flex-col gap-4 min-w-[200px]">
                        <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 relative group h-full flex flex-col shadow-lg hover:shadow-purple-900/20 transition-all hover:-translate-y-1">
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-4 ring-slate-950 z-10">2</div>
                            <div className="flex items-center gap-4 mb-4 border-b border-slate-700/50 pb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                    <Database className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Firebase RTDB</h3>
                                    <p className="text-xs text-slate-400 mt-1">Google Cloud (SG)</p>
                                </div>
                            </div>
                            <ul className="text-sm text-slate-300 space-y-3 list-disc list-inside flex-1">
                                <li>Path: <code className="bg-slate-900 px-1 py-0.5 rounded text-xs">devices/&#123;id&#125;/location</code></li>
                                <li>เก็บ Lat, Lon, Speed, Heading</li>
                                <li>รองรับ Real-time Listener</li>
                            </ul>
                        </div>
                        <div className="flex-1 min-h-[40px] border-l-2 border-dashed border-slate-700 ml-8 lg:hidden"></div>
                    </div>

                    {/* Arrow 2 */}
                    <div className="hidden lg:flex flex-col items-center justify-center text-slate-600 px-2 shrink-0">
                        <div className="text-[10px] font-mono mb-2 uppercase tracking-wider text-slate-500">Sync Event</div>
                        <div className="w-16 h-0.5 bg-slate-700 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
                        </div>
                    </div>

                    {/* Step 3: Processing */}
                    <div className="flex-1 flex flex-col gap-4 min-w-[200px]">
                        <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 relative group h-full flex flex-col shadow-lg hover:shadow-cyan-900/20 transition-all hover:-translate-y-1">
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-4 ring-slate-950 z-10">3</div>
                            <div className="flex items-center gap-4 mb-4 border-b border-slate-700/50 pb-4">
                                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                                    <Server className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Client Engine</h3>
                                    <p className="text-xs text-slate-400 mt-1">Browser / App</p>
                                </div>
                            </div>
                            <div className="space-y-3 flex-1">
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-xs">
                                    <div className="text-cyan-400 font-bold mb-1">Smart Filter (SMA)</div>
                                    <div className="text-slate-400">กรอง Noise ข้อมูล GPS ให้นิ่ง</div>
                                </div>
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-xs">
                                    <div className="text-cyan-400 font-bold mb-1">Heading Lock</div>
                                    <div className="text-slate-400">ล็อคทิศเมื่อหยุดนิ่ง ({'<'} 0.5kts)</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[40px] border-l-2 border-dashed border-slate-700 ml-8 lg:hidden"></div>
                    </div>

                    {/* Arrow 3 */}
                    <div className="hidden lg:flex flex-col items-center justify-center text-slate-600 px-2 shrink-0">
                        <div className="text-[10px] font-mono mb-2 uppercase tracking-wider text-slate-500">Render</div>
                        <div className="w-16 h-0.5 bg-slate-700 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
                        </div>
                    </div>

                    {/* Step 4: Display */}
                    <div className="flex-1 flex flex-col gap-4 min-w-[200px]">
                        <div className="p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl relative group shadow-[0_0_30px_rgba(16,185,129,0.1)] h-full flex flex-col hover:shadow-emerald-900/40 transition-all hover:-translate-y-1">
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-4 ring-slate-950 z-10">4</div>
                            <div className="flex items-center gap-4 mb-4 border-b border-emerald-500/20 pb-4">
                                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight text-emerald-100">Tactical Map</h3>
                                    <p className="text-xs text-emerald-400/70 mt-1">Command Center</p>
                                </div>
                            </div>
                            <ul className="text-sm text-emerald-100/70 space-y-3 list-disc list-inside flex-1">
                                <li>แสดงผลบนแผนที่ CartoDB Tiles</li>
                                <li>Soldier Markers <span className="text-xs opacity-50">(หมุนตามทิศจริง)</span></li>
                                <li>ระบบวัดระยะและ Replay</li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Additional Context - Legend or Note */}
                <div className="mt-12 pt-8 border-t border-slate-800 flex items-start gap-4">
                    <Shield className="w-6 h-6 text-slate-500 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-slate-300 mb-1">Security Layer</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">ข้อมูลทั้งหมดในขั้นตอนที่ 2 และ 3 จะถูกเข้ารหัสและตรวจสอบสิทธิ์ (Authentication) ก่อนจะถูกส่งไปยังหน้าจอผู้ใช้งาน เพื่อป้องกันการเข้าถึงจากผู้ไม่มีส่วนเกี่ยวข้อง (Unauthorized Access)</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
