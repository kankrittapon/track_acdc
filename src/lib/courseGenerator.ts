import { destinationPoint, DEFAULT_ORIGIN } from "./coordinates";
import type { LatLon } from "./coordinates";

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
    semiFinishLine?: [CoursePoint, CoursePoint];
    marks: CoursePoint[];
}

const EARTH_RADIUS = 6371000;


/**
 * Generates a standard Windward-Leeward course
 */
export function generateCourse(
    centerLat: number,
    centerLon: number,
    windDirection: number,
    legLength: number = 2000
): CourseData {
    // Layout based on user sketch:
    // S (Top Left)    1 (Top Right)
    // 3 (Mid Left)    4 (Mid Right) -- F (Finish)
    //                 2 (Bottom Right)

    const scale = legLength / 2; // ~1000m radius

    // Helper for offsets (approximation for visual layout)
    // dLat ~ meters / 111111
    // dLon ~ meters / (111111 * cos(lat))
    const mToLat = 1 / 111111;
    const mToLon = 1 / (111111 * Math.cos(centerLat * Math.PI / 180));

    const offset = (dx: number, dy: number) => ({
        lat: centerLat + dy * mToLat,
        lon: centerLon + dx * mToLon
    });

    // Positions (x=East, y=North) relative to center
    const posS = offset(-scale * 0.8, scale * 0.8); // Top Left
    const pos1 = offset(scale * 0.8, scale * 0.8);  // Top Right
    const pos2 = offset(scale * 0.8, -scale * 0.8); // Bottom Right
    const pos3 = offset(-scale * 0.4, 0);           // Mid Left
    const pos4 = offset(scale * 0.4, 0);            // Mid Right
    const posF = offset(scale * 0.8, 0);            // Right of 4

    // Directions for pins/boats (static for simplicity or relative to course flow)
    // Start Line - Make Vertical like Finish (0, 180)
    const startPin = destinationPoint(posS.lat, posS.lon, 0, 80);
    const startBoat = destinationPoint(posS.lat, posS.lon, 180, 80);

    // Gate 3 (3S/3P) - Vertical Gate?
    const gate3S = destinationPoint(pos3.lat, pos3.lon, 180, 50);
    const gate3P = destinationPoint(pos3.lat, pos3.lon, 0, 50);

    // Finish Line
    const finishPin = destinationPoint(posF.lat, posF.lon, 0, 80);
    const finishBoat = destinationPoint(posF.lat, posF.lon, 180, 80);


    return {
        startLine: [
            { id: 'start-pin', label: 'Start Pin', ...startPin, type: 'pin', color: 'orange' },
            { id: 'start-boat', label: 'Start Boat', ...startBoat, type: 'boat', color: 'green' }
        ],
        finishLine: [
            { id: 'finish-pin', label: 'Finish Pin', ...finishPin, type: 'pin', color: 'blue' },
            { id: 'finish-boat', label: 'Finish Boat', ...finishBoat, type: 'boat', color: 'blue' }
        ],
        marks: [
            { id: 'mark-1', label: '1', ...pos1, type: 'mark', color: 'red' },      // Red in sketch
            { id: 'mark-2', label: '2', ...pos2, type: 'mark', color: 'yellow' },   // Yellow in sketch
            // Gate 3 - Green in sketch
            { id: 'mark-3s', label: '3S', ...gate3S, type: 'gate', color: 'green' },
            { id: 'mark-3p', label: '3P', ...gate3P, type: 'gate', color: 'green' },
            // Mark 4 - Purple in sketch
            { id: 'mark-4', label: '4', ...pos4, type: 'mark', color: 'purple' }
        ]
    };
}

interface DeviceInput {
    id: string;
    lat: number;
    lon: number;
    role?: string;
}

/**
 * Builds CourseData from a map of raw devices based on their roles.
 * SSL R5 Roles: start_buoy_*, finish_buoy_*, buoy_1, buoy_2, buoy_3 (gate), buoy_4
 */
export function buildCourseFromDevices(devices: Record<string, DeviceInput>): CourseData | null {
    const startLeft = Object.values(devices).find(d => d.role === 'start_buoy_left');
    const startRight = Object.values(devices).find(d => d.role === 'start_buoy_right');
    const finishLeft = Object.values(devices).find(d => d.role === 'finish_buoy_left');
    const finishRight = Object.values(devices).find(d => d.role === 'finish_buoy_right');

    // Semi-Finish (Inner Gate)
    const semiFinishLeft = Object.values(devices).find(d => d.role === 'semi_finish_left');
    const semiFinishRight = Object.values(devices).find(d => d.role === 'semi_finish_right');

    // Marks
    // Gate 3 (Find all buoy_3)
    // const gate3Devices = Object.values(devices).filter(d => d.role === 'buoy_3'); 
    // Commented out as we do this inline now or logic changed? 
    // Actually I used the filter calls inline in previous step, so these vars are truly unused.
    // Let's just delete the block of unused vars.

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
    // But realistically we return what we have.
    // If no devices, return null
    if (Object.keys(devices).length === 0) return null;

    // Start Line
    const startLine: [CoursePoint, CoursePoint] = [
        startLeft ? toPoint(startLeft, 'Start Pin', 'pin', 'orange') : { id: 's1', label: 'Start Left', ...DEFAULT_ORIGIN, type: 'pin', color: 'gray' },
        startRight ? toPoint(startRight, 'Start Boat', 'boat', 'green') : { id: 's2', label: 'Start Right', ...DEFAULT_ORIGIN, type: 'boat', color: 'gray' }
    ];

    // Finish Line
    const finishLine: [CoursePoint, CoursePoint] = [
        finishLeft ? toPoint(finishLeft, '4P', 'pin', 'blue') : { id: 'f1', label: 'Finish Left', ...DEFAULT_ORIGIN, type: 'pin', color: 'gray' },
        finishRight ? toPoint(finishRight, '4S', 'boat', 'blue') : { id: 'f2', label: 'Finish Right', ...DEFAULT_ORIGIN, type: 'boat', color: 'gray' }
    ];

    let semiFinishLine: [CoursePoint, CoursePoint] | undefined;
    if (semiFinishLeft && semiFinishRight) {
        semiFinishLine = [
            toPoint(semiFinishLeft, 'Semi-Finish L', 'gate', 'purple'),
            toPoint(semiFinishRight, 'Semi-Finish R', 'gate', 'purple')
        ];
    }

    const marks: CoursePoint[] = [];

    // Generic Helper to process Marks or Gates
    const processMarkOrGate = (devices: DeviceInput[], labelPrefix: string, color: string) => {
        if (devices.length >= 2) {
            // Found multiple devices -> Gate
            // Use A, B, C... suffixes for clarity avoiding "11" confusion
            devices.forEach((d, i) => {
                const suffix = String.fromCharCode(65 + i); // A, B, C...
                marks.push(toPoint(d, `${labelPrefix}${suffix}`, 'gate', color));
            });
        } else if (devices.length === 1) {
            // Single -> Mark
            marks.push(toPoint(devices[0], labelPrefix, 'mark', color));
        }
    };

    // Mark 1
    const m1Devices = Object.values(devices).filter(d => d.role === 'buoy_1');
    processMarkOrGate(m1Devices, '1', 'yellow');

    // Mark 2
    const m2Devices = Object.values(devices).filter(d => d.role === 'buoy_2');
    processMarkOrGate(m2Devices, '2', 'yellow');

    // Mark 3 (Gate)
    const m3Devices = Object.values(devices).filter(d => d.role === 'buoy_3');
    processMarkOrGate(m3Devices, '3', 'orange'); // Often Orange? Or Green as per schema

    // Mark 4
    const m4Devices = Object.values(devices).filter(d => d.role === 'buoy_4');
    processMarkOrGate(m4Devices, '4', 'yellow');

    return {
        startLine,
        finishLine,
        semiFinishLine,
        marks
    };
}
