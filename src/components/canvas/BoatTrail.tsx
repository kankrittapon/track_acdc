import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

import { useSettingsStore } from '../../stores/useSettingsStore';
import { useReplayStore } from '../../stores/useReplayStore';

const MIN_DISTANCE = 2; // meters between points
const TELEPORT_THRESHOLD = 50; // Distance to consider as teleport/seek

export default function BoatTrail({ target }: { target: React.RefObject<THREE.Group> }) {
    const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const history = useRef<{ pos: THREE.Vector3; time: number }[]>([]);
    const lastPos = useRef<THREE.Vector3 | null>(null);

    // Settings
    const trailLength = useSettingsStore(s => s.trailLength); // seconds
    const trailWidth = useSettingsStore(s => s.trailWidth);
    const trailBrightness = useSettingsStore(s => s.trailBrightness);

    // Replay Context
    const showReplayUI = useReplayStore(s => s.showReplayUI);

    useFrame(() => {
        if (!target.current) return;

        const currentPos = target.current.position.clone();

        // Use Game Time instead of Clock Time
        // Live: Date.now()
        // Replay: useReplayStore.getState().currentTime
        const now = showReplayUI
            ? useReplayStore.getState().currentTime
            : Date.now();

        // 1. Check for movement
        if (!lastPos.current) {
            lastPos.current = currentPos;
            history.current.push({ pos: currentPos, time: now });
        } else {
            const dist = lastPos.current.distanceTo(currentPos);

            // Check for Teleport/Seek (Large Jump)
            if (dist > TELEPORT_THRESHOLD) {
                // Clear history to prevent long lines
                history.current = [];
                lastPos.current = currentPos;
                history.current.push({ pos: currentPos, time: now });
            }
            // Normal Movement
            else if (dist > MIN_DISTANCE) {
                history.current.push({ pos: currentPos, time: now });
                lastPos.current = currentPos;
            }
        }

        // 2. Prune old points based on Settings
        const maxAge = trailLength * 1000;

        // Filter history based on Game Time diff
        // Note: Math.abs used because replay Seeking backwards might cause negative diff if not careful, 
        // but generally we want "past" points.
        // If we seek backwards, 'now' is smaller than 'p.time'. 
        // We should clear future points? 
        // Yes, if we seek back, points with time > now are "future" and should be removed or hidden.
        // For simplicity, let's keep points where (now - time) is transparently positive.
        // If (now < time), it means we seeked back. We should really clear those points.

        const validHistory = history.current.filter(p => {
            const age = now - p.time;
            return age >= 0 && age < maxAge;
        });

        // Only update state if count changed
        if (validHistory.length !== history.current.length || (history.current.length > 0 && validHistory.length > 0)) {
            history.current = validHistory;
            setPoints(history.current.map(p => p.pos));
        }
    });

    if (points.length < 2) return null;

    return (
        <Line
            points={points}
            color="white"
            opacity={0.3 * trailBrightness}
            transparent
            lineWidth={trailWidth}
            dashed
            dashScale={2}
            dashSize={2}
            gapSize={1}
        />
    );
}
