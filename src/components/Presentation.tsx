import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Target,
    Zap,
    Shield,
    Layout,
    MousePointer2,
    Lock,
    Eye,
    CheckCircle2,
    Map as MapIcon,
    History,
    Users
} from 'lucide-react';

type SlideType = 'title' | 'grid' | 'list';

interface SlideContent {
    mission?: string;
    tags?: string[];
}

interface SlideItem {
    icon?: React.ReactNode;
    label: string;
    description?: string;
}

interface SlideSection {
    label: string;
    items: string[];
}

interface Slide {
    title: string;
    subtitle: string;
    type: SlideType;
    content?: SlideContent;
    items?: SlideItem[];
    sections?: SlideSection[];
}

const slides: Slide[] = [
    {
        title: "Track ACDC",
        subtitle: "ระบบอำนวยการยุทธ์และติดตามพิกัดทางทหาร",
        type: "title",
        content: {
            mission: "ระบบติดตามตำแหน่งแบบ Real-time ที่ออกแบบมาเพื่อความแม่นยำทางยุทธวิธี สูงสุดเห็นทุกความเคลื่อนไหวในสนามรบอย่างชัดเจน",
            tags: ["Real-time Tracking", "Tactical Precision", "Secure Command"]
        }
    },
    {
        title: "Why Track ACDC?",
        subtitle: "ทำไมต้องระบบนี้?",
        type: "grid",
        items: [
            {
                icon: <MapIcon className="w-8 h-8 text-blue-400" />,
                label: "Tactical Map",
                description: "แผนที่ยุทธวิธีแสดงตำแหน่งกำลังพลทุกหน่วยพร้อมกัน อัปเดตสถานะวินาทีต่อวินาที"
            },
            {
                icon: <Zap className="w-8 h-8 text-yellow-400" />,
                label: "Signal Stabilization",
                description: "ระบบกรองสัญญาณอัจฉริยะ พิกัดนิ่ง แม่นยำ ไม่กระโดดแม้ในพื้นที่อับสัญญาณ"
            },
            {
                icon: <History className="w-8 h-8 text-green-400" />,
                label: "Mission Replay",
                description: "บันทึกและเล่นย้อนหลังเส้นทางการเคลื่อนทัพ เพื่อการวิเคราะห์หลังจบภารกิจ (AAR)"
            },
            {
                icon: <Shield className="w-8 h-8 text-purple-400" />,
                label: "Central Command",
                description: "ศูนย์ควบคุมสั่งการส่วนกลาง จัดการข้อมูลและสิทธิ์การเข้าถึงจากจุดเดียว"
            }
        ]
    },
    {
        title: "System Capability",
        subtitle: "ขีดความสามารถของระบบ",
        type: "list",
        sections: [
            {
                label: "Speed & Performance",
                items: ["Real-time Data Sync", "Zero-Latency Display", "High Concurrency Support"]
            },
            {
                label: "Reliability",
                items: ["24/7 Operation", "Offline Data Resilience", "Auto-Redundancy"]
            },
            {
                label: "Accessibility",
                items: ["Cross-Platform (Web/Mobile)", "No Installation Required", "Tactical Edge Ready"]
            }
        ]
    },
    {
        title: "Operational Interface",
        subtitle: "หน้าจอปฏิบัติการ",
        type: "grid",
        items: [
            {
                icon: <Users className="w-8 h-8 text-blue-300" />,
                label: "Unit Identification",
                description: "สัญลักษณ์ทางทหารมาตรฐาน ระบุประเภทหน่วยและทิศทาง (Heading) ชัดเจน"
            },
            {
                icon: <Layout className="w-8 h-8 text-blue-300" />,
                label: "Smart Listing",
                description: "แถบสถานะอัจฉริยะ แสดงรายชื่อหน่วยพร้อมสถานะการรบและการเชื่อมต่อ"
            },
            {
                icon: <MousePointer2 className="w-8 h-8 text-blue-300" />,
                label: "Grid Measurement",
                description: "เครื่องมือวัดระยะทางทางยุทธวิธี ความละเอียดสูง ช่วยวางแผนการเคลื่อนพล"
            }
        ]
    },
    {
        title: "Security Protocols",
        subtitle: "มาตรฐานความปลอดภัยระดับสูง",
        type: "grid",
        items: [
            {
                icon: <Lock className="w-8 h-8 text-red-400" />,
                label: "Role-Based Access",
                description: "จำกัดสิทธิ์การเข้าถึงข้อมูลตามลำดับชั้นการบังคับบัญชา"
            },
            {
                icon: <Eye className="w-8 h-8 text-red-400" />,
                label: "Encrypted Data",
                description: "เข้ารหัสข้อมูลพิกัดและการสื่อสารทั้งหมด ป้องกันการดักจับข้อมูล"
            },
            {
                icon: <CheckCircle2 className="w-8 h-8 text-red-400" />,
                label: "Isolated Environment",
                description: "ทำงานในระบบปิด (On-Premises/Private Cloud) ตัดขาดจากความเสี่ยงภายนอก"
            }
        ]
    },
    {
        title: "Future Development",
        subtitle: "แนวทางการพัฒนาในอนาคต",
        type: "list",
        sections: [
            {
                label: "AI Integration",
                items: ["Predictive Movement Analysis", "Anomaly Detection (แจ้งเตือนความผิดปกติ)", "Automated Threat Assessment"]
            },
            {
                label: "Advanced Visualization",
                items: ["3D Terrain Integration", "AR / VR Command Center", "Heatmap & Pattern Analysis"]
            },
            {
                label: "Connectivity",
                items: ["Tactical Radio Link Integration", "Drone Feed Overlay", "Satellite Link Backup"]
            }
        ]
    }
];

export default function Presentation() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const slide = slides[currentSlide];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 font-sans p-4 overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            {/* Slide Container */}
            <div className="relative z-10 w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl h-[650px] flex flex-col transition-all duration-500">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 rounded-t-3xl overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                    ></div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col p-12 overflow-y-auto">
                    {slide.type === 'title' ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-semibold tracking-widest uppercase">
                                <Target className="w-4 h-4" /> Tactical Operations
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                {slide.title}
                            </h1>
                            <p className="text-3xl text-blue-400 font-light mt-4">
                                {slide.subtitle}
                            </p>
                            <div className="max-w-3xl py-8 border-y border-slate-800/50 mt-8">
                                <p className="text-slate-300 leading-relaxed text-xl">
                                    {slide.content?.mission}
                                </p>
                            </div>
                            <div className="flex gap-4 mt-6">
                                {slide.content?.tags && slide.content.tags.map((tag: string) => (
                                    <span key={tag} className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-400 border border-slate-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="space-y-2 border-b border-slate-800 pb-6">
                                <h2 className="text-4xl font-bold text-white tracking-tight">{slide.title}</h2>
                                <p className="text-blue-400 text-xl font-light">{slide.subtitle}</p>
                            </div>

                            {slide.type === 'grid' && slide.items && (
                                <div className="grid grid-cols-2 gap-6 pt-2">
                                    {slide.items.map((item: any, idx: number) => (
                                        <div key={idx} className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex gap-5 hover:border-blue-500/30 transition-all group hover:bg-slate-800/80">
                                            <div className="shrink-0 p-4 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center h-fit">
                                                {item.icon}
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-slate-100">{item.label}</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {slide.type === 'list' && slide.sections && (
                                <div className="grid grid-cols-3 gap-8 pt-4">
                                    {slide.sections.map((section: any, idx: number) => (
                                        <div key={idx} className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                                                {section.label}
                                            </h3>
                                            <ul className="space-y-3">
                                                {section.items.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-colors">
                                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                                        <span className="text-sm">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Bar */}
                <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-900/50 rounded-b-3xl">
                    <div className="text-slate-500 text-sm font-mono tracking-wider">
                        SECURE LINK // SLIDE {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={prevSlide}
                            className="p-3 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white border border-transparent hover:border-slate-700"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-3 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white border border-transparent hover:border-slate-700"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Shortcuts Help */}
            <div className="mt-8 text-slate-600 text-xs flex gap-6 font-mono opacity-50">
                <span className="flex items-center gap-1">NAVIGATE: [ARROW KEYS] / [SPACE]</span>
                <span className="flex items-center gap-1">MODE: PRESENTATION</span>
            </div>
        </div>
    );
}
