import type { Coordinate, Mark } from './raceTypes';
import { getDistance } from './geoUtils';

/**
 * Resolves which gate (Starboard or Port) is closer to the boat.
 * Used when the boat's target is the generic 'GATE'.
 */
export function getClosestGate(
    boatPos: Coordinate,
    marks: Mark[]
): Mark | null {
    const gates = marks.filter(m => m.role === 'gate');
    if (gates.length === 0) return null;

    let closestGate: Mark | null = null;
    let minDist = Infinity;

    for (const gate of gates) {
        const dist = getDistance(boatPos, gate.pos);
        if (dist < minDist) {
            minDist = dist;
            closestGate = gate;
        }
    }

    return closestGate;
}

/**
 * Checks if a boat has rounded EITHER of the gates.
 * Returns the gate that was rounded, or null.
 */
// This will be used in the main loop to check if boat passed 4S OR 4P
