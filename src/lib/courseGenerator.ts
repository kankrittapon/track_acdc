import { DEFAULT_ORIGIN } from "./coordinates";
// import type { LatLon } from "./coordinates";

export interface CoursePoint {
    id: string;
    label: string;
    lat: number;
    lon: number;
    type: 'pin' | 'boat' | 'mark' | 'gate';
    color: string;
}

export interface CourseData {
    startLine: [CoursePoint, CoursePoint];
    finishLine: [CoursePoint, CoursePoint];
    // semiFinishLine?: [CoursePoint, CoursePoint];
    marks: CoursePoint[];
    sequence: string[]; // Ordered list of Target IDs (e.g. "mark-1", "gate-4")
}

// ... existing code ...

/**
 * Builds CourseData from a map of raw devices based on their roles.
 * SSL R5 Roles: start_buoy_*, finish_buoy_*, buoy_1, buoy_2, buoy_3 (gate), buoy_4
 * Now supports laps config.
 */
export interface DeviceInput {
    id: string;
    lat: number;
    lon: number;
    role?: string;
    teamId?: string;
}

/**
 * Builds CourseData from a map of raw devices based on their roles.
 * SSL R5 Roles: start_buoy_*, finish_buoy_*, buoy_1, buoy_2, buoy_3 (gate), buoy_4
 * Now supports laps config.
 */
export function buildCourseFromDevices(devices: Record<string, DeviceInput>, laps: number = 2): CourseData | null {
    // Start Line
    const startLeft = Object.values(devices).find(d => d.role === 'start_pin' || d.role === 'start_buoy_left');
    const startRight = Object.values(devices).find(d => d.role === 'start_boat' || d.role === 'start_buoy_right');

    // Finish Line
    const finishLeft = Object.values(devices).find(d => d.role === 'finish_pin' || d.role === 'finish_buoy_left');
    const finishRight = Object.values(devices).find(d => d.role === 'finish_boat' || d.role === 'finish_buoy_right');

    // Helper to map device to CoursePoint
    const toPoint = (d: DeviceInput, label: string, type: CoursePoint['type'], color: string): CoursePoint => ({
        id: d.id,
        label,
        lat: d.lat,
        lon: d.lon,
        type,
        color
    });

    // We need at least some marks to form a course
    if (Object.keys(devices).length === 0) return null;

    // Start Line
    const startLine: [CoursePoint, CoursePoint] = [
        startLeft ? toPoint(startLeft, 'Start Pin', 'pin', 'orange') : { id: 's1', label: 'Start Left', ...DEFAULT_ORIGIN, type: 'pin', color: 'gray' },
        startRight ? toPoint(startRight, 'Start Boat', 'boat', 'green') : { id: 's2', label: 'Start Right', ...DEFAULT_ORIGIN, type: 'boat', color: 'gray' }
    ];

    // Finish Line
    const finishLine: [CoursePoint, CoursePoint] = [
        finishLeft ? toPoint(finishLeft, 'Finish Pin', 'pin', 'blue') : { id: 'f1', label: 'Finish Pin', ...DEFAULT_ORIGIN, type: 'pin', color: 'gray' },
        finishRight ? toPoint(finishRight, 'Finish Boat', 'boat', 'blue') : { id: 'f2', label: 'Finish Boat', ...DEFAULT_ORIGIN, type: 'boat', color: 'gray' }
    ];

    const marks: CoursePoint[] = [];

    // 1. Mark 1
    const m1 = Object.values(devices).find(d => d.role === 'buoy_1');
    const m1Id = m1?.id;
    if (m1) marks.push(toPoint(m1, '1', 'mark', 'yellow'));

    // 2. Mark 1A (Offset)
    const m1a = Object.values(devices).find(d => d.role === 'buoy_1a');
    const m1aId = m1a?.id;
    if (m1a) marks.push(toPoint(m1a, '1A', 'mark', 'orange'));

    // 3. Gate 4 (4S / 4P)
    const g4s = Object.values(devices).find(d => d.role === 'gate_4s');
    const g4p = Object.values(devices).find(d => d.role === 'gate_4p');
    const gateId = g4s?.id || g4p?.id;

    if (g4s) marks.push(toPoint(g4s, '4S', 'gate', 'green'));
    if (g4p) marks.push(toPoint(g4p, '4P', 'gate', 'green'));

    // Sequence Generation
    // Standard W/L: Start -> 1 -> 1A -> 4 -> 1 -> 1A -> Finish
    const sequence: string[] = [];

    // Check if we have main marks
    if (m1Id && m1aId && gateId) {
        for (let i = 0; i < laps; i++) {
            // Upwind
            sequence.push(m1Id);
            sequence.push(m1aId);

            // Downwind
            if (i < laps - 1) {
                // To Gate (if not last lap)
                sequence.push(gateId);
            } else {
                // To Finish (last lap)
                sequence.push('finish-line');
            }
        }
    }

    return {
        startLine,
        finishLine,
        marks,
        sequence
    };
}
