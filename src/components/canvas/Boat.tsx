import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { latLonToXZ, DEFAULT_ORIGIN } from '../../lib/coordinates';
import { useBoatStore } from '../../stores/useBoatStore';
import { useCourseStore } from '../../stores/useCourseStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { getClosestGate } from '../../lib/dynamicGateLogic';

import BoatTrail from './BoatTrail';

// Define TEAM_COLORS here again or move if necessary, it was deleted too?
const TEAM_COLORS: Record<string, string> = {
    blue: '#3b82f6',
    red: '#ef4444',
    yellow: '#eab308',
    orange: '#f97316',
    white: '#ffffff',
    green: '#22c55e',
};

export default function Boat({ id }: { id: string }) {
    const boatRef = useRef<THREE.Group>(null);
    const { selectedBoatId, setSelectedBoat } = useBoatStore();
    const data = useBoatStore((s) => s.boats[id]);

    // Safety check if boat is removed - BUT we must call hooks first!
    // const data = useBoatStore((s) => s.boats[id]); 
    // ^ definition moved to top, but usage below must be safe

    // Settings
    const iconSize = useSettingsStore(s => s.iconSize);
    const showTeamName = useSettingsStore(s => s.showTeamName);
    const showFlag = useSettingsStore(s => s.showFlag);
    const showSailingDetails = useSettingsStore(s => s.showSailingDetails);

    // State
    const [hovered, setHover] = useState(false);

    // Calculate target position from Lat/Lon
    const targetPos = useMemo(() => {
        if (!data) return new THREE.Vector3(0, 0, 0);
        return latLonToXZ(data.lat, data.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
    }, [data?.lat, data?.lon]);

    // Interpolate position and rotation for smoothness
    useFrame((_state, delta) => {
        // If no data, do nothing
        if (!data || !boatRef.current) return;

        // Position Lerp
        boatRef.current.position.x = THREE.MathUtils.lerp(boatRef.current.position.x, targetPos.x, delta * 5);
        boatRef.current.position.z = THREE.MathUtils.lerp(boatRef.current.position.z, targetPos.z, delta * 5);

        // Rotation (Heading) - Convert degrees to radians
        const targetRot = (data.heading * Math.PI) / 180;
        boatRef.current.rotation.y = -targetRot;
    });

    const isSelected = data ? selectedBoatId === data.id : false;

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
    }, [hovered]);

    // Target Line Logic
    const { course, activeLegIndex } = useCourseStore();
    const targetLinePoints = useMemo(() => {
        if (!data || !course || !course.sequence || activeLegIndex >= course.sequence.length) return null;

        const targetId = course.sequence[activeLegIndex];
        let tLat = 0, tLon = 0;

        if (targetId === 'Finish Line') {
            tLat = (course.finishLine[0].lat + course.finishLine[1].lat) / 2;
            tLon = (course.finishLine[0].lon + course.finishLine[1].lon) / 2;
        } else if (targetId === 'GATE') {
            // Dynamic Gate Selection
            // Need to find 4S or 4P, whichever is closer
            // Since Boat.tsx has access to boat data:
            const currentPos = { lat: data.lat, lng: data.lon };
            const marks = course.marks.map(m => ({
                id: m.id,
                name: m.label,
                pos: { lat: m.lat, lng: m.lon },
                radius: 24, // simplified
                role: m.type === 'gate' ? 'gate' : 'other'
            }));

            // Need to cast to Mark type roughly
            const closest = getClosestGate(currentPos, marks as any[]);
            if (closest) {
                tLat = closest.pos.lat;
                tLon = closest.pos.lng;
            } else {
                return null;
            }
        } else {
            const mark = course.marks.find(m => m.id === targetId);
            if (!mark) return null;
            tLat = mark.lat;
            tLon = mark.lon;
        }

        const tPos = latLonToXZ(tLat, tLon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);

        // Start: Boat Position (targetPos is already computed above as XZ)
        // End: Mark Position
        return [
            new THREE.Vector3(targetPos.x, 2, targetPos.z), // Boat (slightly raised)
            new THREE.Vector3(tPos.x, 2, tPos.z)           // Mark
        ];
    }, [course, activeLegIndex, targetPos, DEFAULT_ORIGIN, data?.lat, data?.lon]);

    // Final safety check before render
    if (!data) return null;

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
                        <boxGeometry args={[0.015, 3, 1.5]} />
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

            {/* Target Line - Only for selected boat to avoid clutter, or all? User implies for 'this boat'. Let's show for Selected only for now to be clean, or all if sailing details on? */}
            {/* User said "Focus on dashed line between boat and buoy to tell where this boat is heading". Usually all boats. */}
            {targetLinePoints && (
                <BoatTargetLine points={targetLinePoints} color={TEAM_COLORS[data.team] || 'white'} />
            )}

            <BoatTrail target={boatRef as React.RefObject<THREE.Group>} />
        </>
    );
}

function BoatTargetLine({ points, color }: { points: THREE.Vector3[], color: string }) {
    return (
        <primitive object={new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineDashedMaterial({
                color: color,
                dashSize: 10,
                gapSize: 5,
                opacity: 0.4,
                transparent: true
            })
        )} />
    );
}
