import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { latLonToXZ, DEFAULT_ORIGIN } from '../../lib/coordinates';
import { useBoatStore } from '../../stores/useBoatStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import type { BoatData } from '../../stores/useBoatStore';

const TEAM_COLORS: Record<string, string> = {
    blue: '#3b82f6',
    red: '#ef4444',
    yellow: '#eab308',
    orange: '#f97316',
    white: '#ffffff',
    green: '#22c55e',
};

import BoatTrail from './BoatTrail';

export default function Boat({ data }: { data: BoatData }) {
    const boatRef = useRef<THREE.Group>(null);
    const { selectedBoatId, setSelectedBoat } = useBoatStore();

    // Settings
    const iconSize = useSettingsStore(s => s.iconSize);
    const showTeamName = useSettingsStore(s => s.showTeamName);
    const showFlag = useSettingsStore(s => s.showFlag);
    const showSailingDetails = useSettingsStore(s => s.showSailingDetails);

    // Calculate target position from Lat/Lon
    const targetPos = useMemo(() => {
        return latLonToXZ(data.lat, data.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
    }, [data.lat, data.lon]);

    // Interpolate position and rotation for smoothness
    useFrame((_state, delta) => {
        if (boatRef.current) {
            // Position Lerp
            boatRef.current.position.x = THREE.MathUtils.lerp(boatRef.current.position.x, targetPos.x, delta * 5);
            boatRef.current.position.z = THREE.MathUtils.lerp(boatRef.current.position.z, targetPos.z, delta * 5);

            // Rotation (Heading) - Convert degrees to radians
            // Heading 0 = North (Negative Z in 3D?) - Need to calibrate. 
            // Usually 0 deg = North. In 3D engine, -Z is forward often.
            // Let's assume standard compass: 0=N, 90=E.
            // In 3D: N = -Z, E = +X. 
            // Rotation Y: 0 looks at +Z (South). So we need to rotate 180 deg?
            // Actually let's just use negation for now.
            const targetRot = (data.heading * Math.PI) / 180;
            // Smooth rotation is tricky with 360 wrap, just snap for now to avoid spinning
            boatRef.current.rotation.y = -targetRot;
        }
    });

    const isSelected = selectedBoatId === data.id;

    const [hovered, setHover] = useState(false);

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
    }, [hovered]);

    return (
        <>
            <group
                ref={boatRef}
                position={[targetPos.x, 0, targetPos.z]}
                onClick={(e) => {
                    e.stopPropagation();
                    console.log("Boat Clicked:", data.id);
                    setSelectedBoat(data.id);
                }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                {/* Hit Box (Invisible large area for easier clicking) */}
                <mesh visible={true}>
                    <boxGeometry args={[4, 10, 8]} />
                    <meshBasicMaterial color="white" transparent opacity={0} depthWrite={false} />
                </mesh>

                {/* Selection Ring */}
                {isSelected && (
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
                        <ringGeometry args={[6, 7, 32]} />
                        <meshBasicMaterial color="#ffff00" opacity={0.8} transparent />
                    </mesh>
                )}

                {/* Boat Model (Procedural Low-Poly Sailboat) */}
                <group scale={[2 * (iconSize / 3), 2 * (iconSize / 3), 2 * (iconSize / 3)]}>
                    {/* Hull Main */}
                    <mesh position={[0, 0.5, 0]}>
                        <boxGeometry args={[1.2, 0.8, 4]} />
                        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
                    </mesh>
                    {/* Bow (Front) */}
                    <mesh position={[0, 0.5, -2.5]} rotation={[0, 0, 0]}>
                        <coneGeometry args={[0.6, 2, 4]} /> {/* Pointy front by rotating cone? No, let's use a simple cone nose */}
                        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
                    </mesh>
                    {/* Stern (Back) */}
                    <mesh position={[0, 0.7, 2]}>
                        <boxGeometry args={[1.2, 0.4, 0.5]} />
                        <meshStandardMaterial color="#94a3b8" />
                    </mesh>

                    {/* Deck Detail */}
                    <mesh position={[0, 0.95, 0]}>
                        <boxGeometry args={[1, 0.1, 3.5]} />
                        <meshStandardMaterial color="#cbd5e1" />
                    </mesh>

                    {/* Mast */}
                    <mesh position={[0, 4, -0.5]}>
                        <cylinderGeometry args={[0.05, 0.08, 7]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>

                    {/* Main Sail */}
                    <mesh position={[0, 4, 1]}>
                        <boxGeometry args={[0.05, 6, 2.5]} /> {/* Thick sail for visibility */}
                        <meshStandardMaterial color={TEAM_COLORS[data.team] || 'white'} />
                    </mesh>
                    {/* Jib Sail (Small front) */}
                    <mesh position={[0, 2.5, -1.8]} rotation={[0.2, 0, 0]}>
                        <boxGeometry args={[0.02, 3, 1.5]} />
                        <meshStandardMaterial color="#e2e8f0" />
                    </mesh>
                </group>

                {/* Label Overlay - Raised to 25 to clear mast height (approx 15) */}
                <Html position={[0, 25, 0]} center zIndexRange={[100, 0]} distanceFactor={200 / (iconSize / 3)}>
                    <div
                        className={`
                        px-3 py-1.5 rounded-md text-sm font-bold whitespace-nowrap transition-all duration-200 border
                        ${isSelected
                                ? 'bg-yellow-400 text-black scale-110 shadow-xl border-yellow-500 z-50'
                                : 'bg-slate-900/80 text-white/90 border-slate-700/50 hover:bg-slate-800'
                            }
                        flex flex-col items-center gap-1 backdrop-blur-sm select-none
                    `}
                        style={{ pointerEvents: 'none' }}
                    >
                        <div className="flex items-center gap-2">
                            {showFlag && data.flagUrl && (
                                <img src={data.flagUrl} className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm" alt="flag" />
                            )}
                            {showTeamName && (
                                <span className="tracking-wide drop-shadow-sm">{data.team || data.id}</span>
                            )}
                            {!showTeamName && <span className="tracking-wide drop-shadow-sm">{data.id}</span>}
                        </div>

                        {(isSelected || showSailingDetails) && (
                            <div className="flex flex-col items-center w-full pt-1 mt-0.5 border-t border-black/10">
                                <div className="text-xs font-semibold">{data.speed.toFixed(1)} kn</div>
                            </div>
                        )}
                    </div>
                </Html>
            </group>
            <BoatTrail target={boatRef as React.RefObject<THREE.Group>} />
        </>
    );
}
