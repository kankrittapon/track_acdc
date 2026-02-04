/**
 * GPS Smoothing & Filtering Utilities
 * ตามหลัก Antigravity - ทำให้การเคลื่อนที่ลื่นไหล ไม่กระโดด
 */

// ค่าคงที่
const HISTORY_SIZE = 5; // จำนวนพิกัดที่เก็บสำหรับ SMA
const TRAIL_SIZE = 20; // จำนวนจุดสำหรับ trail
const STATIONARY_SPEED_THRESHOLD = 0.5; // knots - ต่ำกว่านี้ถือว่านิ่ง

// เก็บประวัติพิกัดของแต่ละเรือ
const positionHistory: Map<string, { lat: number; lon: number }[]> = new Map();
const lastValidHeading: Map<string, number> = new Map();
const trailHistory: Map<string, { lat: number; lon: number }[]> = new Map();

export interface RawGPSData {
    id: string;
    lat: number;
    lon: number;
    speed: number;
    heading: number;
}

export interface SmoothedGPSData {
    lat: number;
    lon: number;
    heading: number;
    isStationary: boolean;
    trail: { lat: number; lon: number }[];
}

/**
 * Normalize heading to 0-360 range
 */
export function normalizeHeading(heading: number): number {
    let h = heading % 360;
    if (h < 0) h += 360;
    return h;
}

/**
 * Calculate heading from two points (for when GPS doesn't provide heading)
 */
export function calculateHeading(
    prevLat: number,
    prevLon: number,
    currLat: number,
    currLon: number
): number {
    const dLon = currLon - prevLon;
    const dLat = currLat - prevLat;

    // atan2 returns radians, convert to degrees
    // Math: 0° = East, but we want 0° = North
    let heading = Math.atan2(dLon, dLat) * (180 / Math.PI);

    return normalizeHeading(heading);
}

/**
 * Simple Moving Average for coordinates
 */
function calculateSMA(history: { lat: number; lon: number }[]): { lat: number; lon: number } {
    if (history.length === 0) {
        return { lat: 0, lon: 0 };
    }

    const sum = history.reduce(
        (acc, pos) => ({ lat: acc.lat + pos.lat, lon: acc.lon + pos.lon }),
        { lat: 0, lon: 0 }
    );

    return {
        lat: sum.lat / history.length,
        lon: sum.lon / history.length,
    };
}

/**
 * Apply GPS smoothing and heading lock
 */
export function smoothGPSData(raw: RawGPSData): SmoothedGPSData {
    const { id, lat, lon, speed, heading } = raw;

    // 1. Get or initialize history
    if (!positionHistory.has(id)) {
        positionHistory.set(id, []);
        lastValidHeading.set(id, heading);
        trailHistory.set(id, []);
    }

    const history = positionHistory.get(id)!;
    const trail = trailHistory.get(id)!;

    // 2. Add current position to history
    history.push({ lat, lon });
    if (history.length > HISTORY_SIZE) {
        history.shift();
    }

    // 3. Calculate smoothed position using SMA
    const smoothedPos = calculateSMA(history);

    // 4. Handle heading
    let finalHeading = normalizeHeading(heading);
    const isStationary = speed < STATIONARY_SPEED_THRESHOLD;

    if (isStationary) {
        // Lock heading when stationary to prevent spinning
        finalHeading = lastValidHeading.get(id) || 0;
    } else {
        // If heading is 0 and we have history, calculate from movement
        if (heading === 0 && history.length >= 2) {
            const prev = history[history.length - 2];
            const curr = history[history.length - 1];
            finalHeading = calculateHeading(prev.lat, prev.lon, curr.lat, curr.lon);
        }
        // Save valid heading
        lastValidHeading.set(id, finalHeading);
    }

    // 5. Update trail
    trail.push({ lat: smoothedPos.lat, lon: smoothedPos.lon });
    if (trail.length > TRAIL_SIZE) {
        trail.shift();
    }

    return {
        lat: smoothedPos.lat,
        lon: smoothedPos.lon,
        heading: finalHeading,
        isStationary,
        trail: [...trail],
    };
}

/**
 * Clear history for a boat (e.g., when removed)
 */
export function clearBoatHistory(id: string): void {
    positionHistory.delete(id);
    lastValidHeading.delete(id);
    trailHistory.delete(id);
}

/**
 * Clear all history
 */
export function clearAllHistory(): void {
    positionHistory.clear();
    lastValidHeading.clear();
    trailHistory.clear();
}
