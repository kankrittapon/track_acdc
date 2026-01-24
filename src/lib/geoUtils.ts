import type { Coordinate } from './raceTypes';

const EARTH_RADIUS_MERS = 6371000;

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

function toDeg(rad: number): number {
    return rad * (180 / Math.PI);
}

/**
 * Calculates the distance between two points in meters using Haversine formula
 */
export function getDistance(p1: Coordinate, p2: Coordinate): number {
    const dLat = toRad(p2.lat - p1.lat);
    const dLon = toRad(p2.lng - p1.lng);
    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_MERS * c;
}

/**
 * Calculates initial bearing from p1 to p2 in degrees (0-360)
 */
export function getBearing(p1: Coordinate, p2: Coordinate): number {
    const startLat = toRad(p1.lat);
    const startLng = toRad(p1.lng);
    const destLat = toRad(p2.lat);
    const destLng = toRad(p2.lng);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    
    let brng = Math.atan2(y, x);
    brng = toDeg(brng);
    return (brng + 360) % 360;
}

/**
 * Calculates a destination point given a start point, distance (meters) and bearing (degrees)
 */
export function computeDestinationPoint(start: Coordinate, distanceMeters: number, bearing: number): Coordinate {
    const distRatio = distanceMeters / EARTH_RADIUS_MERS;
    
    const lat1 = toRad(start.lat);
    const lon1 = toRad(start.lng);
    const brng = toRad(bearing);

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distRatio) + Math.cos(lat1) * Math.sin(distRatio) * Math.cos(brng));
    const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(distRatio) * Math.cos(lat1), Math.cos(distRatio) - Math.sin(lat1) * Math.sin(lat2));

    return {
        lat: toDeg(lat2),
        lng: toDeg(lon2)
    };
}

/**
 * Calculates the start and end points for Port and Starboard Laylines.
 * A Layline is a line from the Mark extending backwards at (WindDir +/- (180 - LaylineAngle)).
 * Usually we want to draw it *from* the Mark *out* to some distance.
 * Returns [PortLineStart, PortLineEnd] and [StbdLineStart, StbdLineEnd]
 */
export function computeLaylines(
    markPos: Coordinate, 
    windDir: number, 
    laylineAngle: number = 45, 
    lengthMeters: number = 2000
): { port: [Coordinate, Coordinate], starboard: [Coordinate, Coordinate] } {
    // Port Layline: Boat on Port Tack (Wind from left) approaching mark.
    // Course to steer ~ WindDir + 45.
    // The Line relative to Mark is Reciprocal of that.
    // Actually simplicity:
    // Port Layline Angle (from Mark outwards): WindDir + 180 - 45 (or +45 depending on convention)
    // User formula: 
    // Port Layline: Wind Direction + 180 - Layline Angle
    // Starboard Layline: Wind Direction + 180 + Layline Angle
    
    // Correction: "Port Layline" means the line you sail on Port Tack to fetch the mark.
    // Port Tack = Wind on Port (Left) side. You are sailing ~45 deg to the Right of the Wind (WindDir + 45).
    // So if you aim at Mark, the line extends FROM the mark at (WindDir + 45 + 180).
    
    // User Formula Check:
    // P_Line = Wind + 180 - 45. 
    // Ex: Wind 0 (N). Port Layline Dir = 180 - 45 = 135 (SE).
    // If I am at SE of Mark, and sail NW (315 = -45 = 0-45).
    // No, Port Tack means sailing *Right* of wind. 0+45 = 45 heading. 
    // Reciprocal (Mark -> Boat) would be 45+180 = 225 (SW).
    
    // User said: "Port Layline: Wind + 180 - Angle"
    // If Wind=0, P_Line = 180-45 = 135.
    // If Boat is at 135 (SE), it sails 315 (NW). 315 is LEFT of Wind (0).
    // That is STARBOARD TACK (Wind from Right, Boom on Left).
    // So there might be a naming confusion or I am confused.
    // Standard: 
    // Starboard Layline: The line you sail on Starboard Tack. (Right of course, Leaning Left).
    // Port Layline: The line you sail on Port Tack.
    
    // Let's stick to the User's Formula explicitly as requested:
    // Port Line Dir: Wind + 180 - Angle.
    // Starboard Line Dir: Wind + 180 + Angle.
    
    const pDir = (windDir + 180 - laylineAngle) % 360;
    const sDir = (windDir + 180 + laylineAngle) % 360;
    
    const portEnd = computeDestinationPoint(markPos, lengthMeters, pDir);
    const stbdEnd = computeDestinationPoint(markPos, lengthMeters, sDir);
    
    return {
        port: [markPos, portEnd],
        starboard: [markPos, stbdEnd]
    };
}

/**
 * Calculates a "Ladder Line" (Perpendicular to Wind) at a specific point.
 */
export function computeLadderLine(center: Coordinate, windDir: number, widthMeters: number = 2000): [Coordinate, Coordinate] {
    const leftDir = (windDir - 90) % 360;
    const rightDir = (windDir + 90) % 360;
    const halfWidth = widthMeters / 2;
    
    const p1 = computeDestinationPoint(center, halfWidth, leftDir);
    const p2 = computeDestinationPoint(center, halfWidth, rightDir);
    
    return [p1, p2];
}

/**
 * Checks if two line segments intersect.
 * P1-P2 is the first segment (e.g., boat movement)
 * A-B is the second segment (e.g., start line)
 */
export function isLineIntersection(p1: Coordinate, p2: Coordinate, a: Coordinate, b: Coordinate): boolean {
    // Simplified 2D projection check (sufficient for small scale race tracks)
    const ccw = (A: Coordinate, B: Coordinate, C: Coordinate) => {
        return (C.lat - A.lat) * (B.lng - A.lng) > (B.lat - A.lat) * (C.lng - A.lng);
    };

    return (ccw(p1, a, b) !== ccw(p2, a, b)) && (ccw(p1, p2, a) !== ccw(p1, p2, b));
}

/**
 * Calculates the change in heading (angle) ensuring minimal difference (short way around)
 */
export function getAngleDiff(angle1: number, angle2: number): number {
    let diff = Math.abs(angle1 - angle2) % 360;
    if (diff > 180) diff = 360 - diff;
    return diff;
}
