import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { CoursePoint } from '../../lib/courseGenerator';
import { latLonToXZ, DEFAULT_ORIGIN } from '../../lib/coordinates';
import * as THREE from 'three';

interface BuoyProps {
    mark: CoursePoint;
    isGate?: boolean;
}

export default function Buoy({ mark, isGate }: BuoyProps) {
    const pos = useMemo(() => {
        return latLonToXZ(mark.lat, mark.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
    }, [mark]);

    // Shorten label for circular display
    const displayLabel = useMemo(() => {
        if (mark.label.includes('Start')) return 'S';
        if (mark.label.includes('Finish')) return 'F';
        return mark.label;
    }, [mark.label]);

    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (ringRef.current) {
            ringRef.current.rotation.y += delta * 0.5; // Rotate
            // Optional: slight bobbing or scaling?
            // ringRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime) * 0.1;
        }
    });

    return (
        <group position={[pos.x, 0, pos.z]}>
            {/* Buoy Puck */}
            <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 0.4, 32]} />
                <meshStandardMaterial color={mark.color} roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Inner Ring/Detail */}
            <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 1.4, 32]} />
                <meshBasicMaterial color="white" opacity={0.3} transparent />
            </mesh>

            {/* Gate Indicator - Outer Rotating Ring */}
            {isGate && (
                <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.8, 2.2, 32]} />
                    <meshStandardMaterial
                        color="white"
                        opacity={0.6}
                        transparent
                        side={THREE.DoubleSide}
                        emissive="white"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            )}

            {/* Label - Circular Badge */}
            <Html position={[0, 2.5, 0]} center>
                <div
                    className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white font-bold text-sm"
                    style={{ backgroundColor: mark.color == 'yellow' ? '#ca8a04' : mark.color }}
                >
                    <span className="drop-shadow-sm">{displayLabel}</span>
                </div>
            </Html>
        </group>
    );
}
