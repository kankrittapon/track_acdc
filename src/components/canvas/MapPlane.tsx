import { useLoader } from '@react-three/fiber';
import { TextureLoader, DoubleSide } from 'three';
import raceMap from '../../assets/race_map_vector.png';

import { useSettingsStore } from '../../stores/useSettingsStore';

// Configuration for the map plane
// Adjust these to match the real-world scale of the image area
// This is an approximation for Sattahip Bay based on the screenshot
const MAP_SIZE = 15000; // meters (approximate width)
const MAP_OPACITY = 1.0;

export default function MapPlane() {
    const colorMap = useLoader(TextureLoader, raceMap);
    const colorInvert = useSettingsStore(s => s.colorInvert);

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.05, 0]} // Slightly above y=0 to avoid z-fighting with water if we keep water
            receiveShadow
        >
            <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
            <meshBasicMaterial
                map={colorMap}
                side={DoubleSide}
                transparent
                opacity={MAP_OPACITY}
                color={colorInvert ? '#222' : 'white'} // Dark mode simulation
            />
        </mesh>
    );
}
