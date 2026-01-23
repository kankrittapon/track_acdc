import type { ThreeEvent } from '@react-three/fiber';
import { useTestStore } from '../../stores/useTestStore';
import { DEFAULT_ORIGIN } from '../../lib/coordinates';
import { ref, set } from 'firebase/database';
import { database } from '../../lib/firebase';

export default function Ocean() {
    const { isPlacementMode, placementRole, togglePlacementMode } = useTestStore();

    const handleClick = async (e: ThreeEvent<MouseEvent>) => {
        console.log('[Ocean] Click detected', isPlacementMode, placementRole);
        if (!isPlacementMode || !placementRole) return;

        e.stopPropagation(); // Stop raycast passing through

        const point = e.point; // Local 3D point (Vector3)
        // Convert X,Z back to Lat,Lon
        // X = (lon - originLon) * ...
        // Z = -(lat - originLat) * ...

        const mToLat = 1 / 111111;
        const mToLon = 1 / (111111 * Math.cos(DEFAULT_ORIGIN.lat * Math.PI / 180));

        const lat = DEFAULT_ORIGIN.lat - (point.z * mToLat);
        const lon = DEFAULT_ORIGIN.lon + (point.x * mToLon);

        const id = `manual-${Date.now()}`;
        const data = {
            id,
            role: placementRole,
            lat,
            lon,
            heading: 0,
            speed: 0,
            manualLabel: 'Manual Pin'
        };

        console.log(`[Ocean] Attempting to save to devices/${id}:`, data);

        try {
            await set(ref(database, `devices/${id}`), data);

            console.log(`[Ocean] Successfully saved ${placementRole} to Firebase!`);
            togglePlacementMode(null); // Exit mode after placement
            document.body.style.cursor = 'auto';

        } catch (err: any) {
            console.error('[Ocean] Firebase Save Error:', err);
            alert(`Failed to save buoy: ${err.message || err}`);
        }
    };

    const handlePointerMove = () => {
        if (isPlacementMode) {
            document.body.style.cursor = 'crosshair';
        }
    };

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1, 0]}
            onPointerDown={handleClick}
            onPointerMove={handlePointerMove}
        >
            <planeGeometry args={[100000, 100000]} />
            <meshStandardMaterial color="#006994" roughness={0.1} />
        </mesh>
    );
}

