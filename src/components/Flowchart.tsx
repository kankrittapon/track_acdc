import { ArrowLeft, Database, Globe, Server, Shield, Smartphone } from "lucide-react";

export default function Flowchart() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center">

            {/* Header */}
            <div className="w-full max-w-6xl flex items-center justify-between mb-12 border-b border-slate-800 pb-6">
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
            <div className="relative w-full max-w-6xl bg-slate-900/50 rounded-3xl p-12 border border-slate-800 shadow-2xl overflow-hidden">

                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]"></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-stretch justify-between">

                    {/* Step 1: Source */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 relative group">
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-4 ring-slate-950">1</div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                    <Smartphone className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Field Unit App</h3>
                                    <p className="text-xs text-slate-400">Android (Kotlin)</p>
                                </div>
                            </div>
                            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                                <li><strong>FusedLocationProvider</strong> รับค่า GPS (Lat/Lon)</li>
                                <li>แปลง Speed (m/s → Knots)</li>
                                <li>ส่งตรงขึ้น Firebase RTDB ผาน Internet</li>
                            </ul>
                        </div>
                        <div className="flex-1 min-h-[40px] border-l-2 border-dashed border-slate-700 ml-8 lg:hidden"></div>
                    </div>

                    {/* Arrow 1 */}
                    <div className="hidden lg:flex flex-col items-center justify-center text-slate-600">
                        <div className="text-xs font-mono mb-2">JSON via Internet</div>
                        <div className="w-12 h-0.5 bg-slate-700 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
                        </div>
                    </div>

                    {/* Step 2: Database */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 relative group">
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-4 ring-slate-950">2</div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                    <Database className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Firebase RTDB</h3>
                                    <p className="text-xs text-slate-400">Google Cloud (Singapore)</p>
                                </div>
                            </div>
                            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                                <li>Path: <code>devices/&#123;id&#125;/location</code></li>
                                <li>เก็บ Lat, Lon, Speed, Heading, Timestamp</li>
                                <li>รองรับ Real-time Listener (WebSocket)</li>
                            </ul>
                        </div>
                        <div className="flex-1 min-h-[40px] border-l-2 border-dashed border-slate-700 ml-8 lg:hidden"></div>
                    </div>

                    {/* Arrow 2 */}
                    <div className="hidden lg:flex flex-col items-center justify-center text-slate-600">
                        <div className="text-xs font-mono mb-2">Sync Event</div>
                        <div className="w-12 h-0.5 bg-slate-700 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
                        </div>
                    </div>

                    {/* Step 3: Processing */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 relative group">
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-4 ring-slate-950">3</div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                                    <Server className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Client Engine</h3>
                                    <p className="text-xs text-slate-400">Browser / App</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="p-2 bg-slate-900/50 rounded border border-slate-700/50 text-xs">
                                    <span className="text-cyan-400 font-bold">Smart Filter (SMA):</span>
                                    <br />กรอง Noise ข้อมูล GPS ให้นิ่ง
                                </div>
                                <div className="p-2 bg-slate-900/50 rounded border border-slate-700/50 text-xs">
                                    <span className="text-cyan-400 font-bold">Heading Lock:</span>
                                    <br />ล็อคทิศเมื่อหยุดนิ่ง
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[40px] border-l-2 border-dashed border-slate-700 ml-8 lg:hidden"></div>
                    </div>

                    {/* Arrow 3 */}
                    <div className="hidden lg:flex flex-col items-center justify-center text-slate-600">
                        <div className="text-xs font-mono mb-2">Render</div>
                        <div className="w-12 h-0.5 bg-slate-700 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-700 rotate-45"></div>
                        </div>
                    </div>

                    {/* Step 4: Display */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl relative group shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-4 ring-slate-950">4</div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-emerald-100">Tactical Map</h3>
                                    <p className="text-xs text-emerald-400/70">Command Center</p>
                                </div>
                            </div>
                            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                                <li>แสดงผลบนแผนที่ CartoDB Tiles</li>
                                <li>Soldier Markers (หมุนตามทิศจริง)</li>
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
