// Basic Geodetic to Cartesian conversion
// Using Equirectangular approximation for small areas (like a race course)
// For larger areas, Mercator or UTM is better.

const EARTH_RADIUS = 6371000; // Meters

export interface LatLon {
    lat: number;
    lon: number;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

// Origin point of the map (Center of the scene)
// Defaults to a dummy location until set by config or first boat position
export const DEFAULT_ORIGIN: LatLon = {
    lat: 12.65, // Sattahip Bay
    lon: 100.86
};

/**
 * Converts functionality Latitude/Longitude to Local 3D Coordinates (X, Z)
 * @param lat Latitude of the target
 * @param lon Longitude of the target
 * @param originLat Latitude of reference point (0,0 in 3D)
 * @param originLon Longitude of reference point (0,0 in 3D)
 * @returns {x, z} in meters
 */
export function latLonToXZ(lat: number, lon: number, originLat: number, originLon: number) {
    const radLat = (originLat * Math.PI) / 180;

    const x = (lon - originLon) * (Math.PI / 180) * EARTH_RADIUS * Math.cos(radLat);
    const z = -(lat - originLat) * (Math.PI / 180) * EARTH_RADIUS; // -Z is North

    return { x, z };
}

/**
 * Calculates distance between two coordinates in meters
 */
export function haversineDistance(coords1: LatLon, coords2: LatLon): number {
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS * c;
}

/**
 * Calculates bearing between two points
 */
export function calculateBearing(start: LatLon, dest: LatLon): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const startLat = toRad(start.lat);
    const startLon = toRad(start.lon);
    const destLat = toRad(dest.lat);
    const destLon = toRad(dest.lon);

    const y = Math.sin(destLon - startLon) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLon - startLon);

    let brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
}

/**
 * Calculates a destination point given a distance and bearing from start point
 */
export function destinationPoint(lat: number, lon: number, brng: number, dist: number): LatLon {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const toDeg = (rad: number) => rad * 180 / Math.PI;

    const lat1 = toRad(lat);
    const lon1 = toRad(lon);
    const angDist = dist / EARTH_RADIUS; // angular distance in radians
    const brngRad = toRad(brng);

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angDist) +
        Math.cos(lat1) * Math.sin(angDist) * Math.cos(brngRad));
    const lon2 = lon1 + Math.atan2(Math.sin(brngRad) * Math.sin(angDist) * Math.cos(lat1),
        Math.cos(angDist) - Math.sin(lat1) * Math.sin(lat2));

    return { lat: toDeg(lat2), lon: toDeg(lon2) };
}
