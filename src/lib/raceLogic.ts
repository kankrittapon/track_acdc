import type { Coordinate, CourseLayout, Mark } from './raceTypes';
import { computeDestinationPoint, getAngleDiff, getDistance, isLineIntersection } from './geoUtils';

/**
 * Logic Class for Sailing Race Calculations
 */

// Logic 1 & 3: Start/Finish Line Check
export function checkLineCrossing(
    prevPos: Coordinate,
    currPos: Coordinate,
    lineP1: Coordinate,
    lineP2: Coordinate
): boolean {
    return isLineIntersection(prevPos, currPos, lineP1, lineP2);
}

// Logic 5: Geofencing / Mark Rounding Check
export function checkMarkRounding(
    boatPos: Coordinate,
    mark: Mark,
    entryHeading: number,
    exitHeading: number
): boolean {
    // 1. Distance Check
    const dist = getDistance(boatPos, mark.pos);
    if (dist > mark.radius) return false;

    // 2. Angle Change Check (Course Over Ground change > 90 degrees)
    // Theoretically, we should track the boat's cumulative angle change while in the zone.
    // For simplicity as per user request: check entry vs exit heading (or current heading vs entry).
    const angleChange = getAngleDiff(entryHeading, exitHeading);
    return angleChange > 90;
}

// Logic 2: Marks Placement (Course Setting)
export function generateWindwardLeewardCourse(
    startMidpoint: Coordinate,
    windDirection: number,
    legDistanceNM: number = 1.0, 
    gateWidthMeters: number = 40
): CourseLayout {
    const legDistanceMeters = legDistanceNM * 1852;

    // 1. Calculate Start Line (Perpendicular to wind)
    // Start line usually width of 1.5 * fleet size, roughly 100-300m. Let's say 200m total.
    const startHalfWidth = 100;
    const startP1 = computeDestinationPoint(startMidpoint, startHalfWidth, windDirection - 90);
    const startP2 = computeDestinationPoint(startMidpoint, startHalfWidth, windDirection + 90);

    // 2. Calculate Mark 1 (Windward) - Directly upwind
    const mark1Pos = computeDestinationPoint(startMidpoint, legDistanceMeters, windDirection);
    
    // 3. Calculate Mark 1A (Offset) - 90 degrees left (approx 100m) for port rounding
    // User said: "approx 50-100m, 90 degrees"
    const mark1APos = computeDestinationPoint(mark1Pos, 80, windDirection - 90);

    // 4. Calculate Gate (4S/4P) - Leeward
    // User said: "Usually slightly above Start Line". Let's put it 50m above start midpoint.
    const gateCenter = computeDestinationPoint(startMidpoint, 50, windDirection);
    const gateHalfWidth = gateWidthMeters / 2;
    
    // Gate is perpendicular to wind (same as start line)
    // 4P (Port Gate) - Left looking downwind? 
    // Usually looking UPWIND:
    // 4S (Starboard Mark of the gate) is on the right looking upwind.
    // 4P (Port Mark of the gate) is on the left looking upwind.
    const gate4S_Pos = computeDestinationPoint(gateCenter, gateHalfWidth, windDirection + 90);
    const gate4P_Pos = computeDestinationPoint(gateCenter, gateHalfWidth, windDirection - 90);

    // Finish Line - User said "Below Gate" or "Below Mark 1"
    // Let's place it slightly below Start Line (Downwind Finish)
    const finishMidpoint = computeDestinationPoint(startMidpoint, 50, windDirection + 180); // 50m below start
    const finishP1 = computeDestinationPoint(finishMidpoint, startHalfWidth, windDirection - 90);
    const finishP2 = computeDestinationPoint(finishMidpoint, startHalfWidth, windDirection + 90);

    return {
        start_line: { p1: startP1, p2: startP2 },
        finish_line: { p1: finishP1, p2: finishP2 },
        marks: [
            { id: "M1", name: "Mark 1", pos: mark1Pos, radius: 24, role: 'mark1', rounding: 'port' },
            { id: "M1A", name: "Mark 1A", pos: mark1APos, radius: 24, role: 'mark1a', rounding: 'port' },
            { id: "G4S", name: "Gate 4S", pos: gate4S_Pos, radius: 24, role: 'gate', rounding: 'starboard' },
            { id: "G4P", name: "Gate 4P", pos: gate4P_Pos, radius: 24, role: 'gate', rounding: 'port' }
        ]
    };
}
