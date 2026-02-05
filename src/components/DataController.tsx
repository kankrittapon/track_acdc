import { useEffect, useRef, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';
import { useBoatStore } from '../stores/useBoatStore';
import { useReplayStore } from '../stores/useReplayStore';
import type { BoatData } from '../stores/useBoatStore';
import { useCourseStore } from '../stores/useCourseStore';
import { buildCourseFromDevices } from '../lib/courseGenerator';
import type { DeviceInput } from '../lib/courseGenerator';
import { DEFAULT_ORIGIN } from '../lib/coordinates';
import { smoothGPSData } from '../lib/gpsSmoothing';

// Raw data interfaces from Firebase
interface FirebaseDevice {
    lat?: number;
    lon?: number;
    heading?: number;
    speed?: number;
    location?: {
        lat: number;
        lon: number;
        speed?: number;
        heading?: number;
        accuracy?: number;
        timestamp?: number;
    };
    teamId?: string;
    role?: string;
    roomId?: string;
    timestamp?: number;
    // ... other raw fields
}

interface RoomData {
    name: string;
    createdAt: number;
    assignedDevices?: string[]; // List of device IDs assigned to this room
    [key: string]: unknown;
}

export default function DataController() {
    const setBoats = useBoatStore((state) => state.setBoats);
    const setCourse = useCourseStore((state) => state.setCourse);
    const setRaceName = useCourseStore((state) => state.setRaceName);

    // Refs to hold latest data (avoid stale closures in separate listeners)
    const latestRooms = useRef<Record<string, RoomData> | null>(null);
    const latestDevices = useRef<Record<string, FirebaseDevice> | null>(null);
    const activeRoomIdRef = useRef<string | null>(null);

    // Main Synchronization Logic
    const syncState = useCallback(() => {
        const rooms = latestRooms.current;
        const devices = latestDevices.current;
        const targetRoomId = activeRoomIdRef.current;

        // 1. Determine Active Room Data
        let activeRoom: RoomData | null = null;

        if (rooms) {
            if (targetRoomId) {
                // Case A: Specific Room ID from URL
                activeRoom = rooms[targetRoomId] || null;
            } else {
                // Case B: Auto-Latest Room
                activeRoom = Object.values(rooms).reduce((prev, curr) => {
                    return (!prev || curr.createdAt > prev.createdAt) ? curr : prev;
                }, undefined as RoomData | undefined) || null;
            }
        }

        // Update Race Name
        if (activeRoom && activeRoom.name) {
            setRaceName(activeRoom.name);
        }

        // 2. Filter and Process Devices
        if (devices) {
            const mappedBoats: Record<string, BoatData> = {};
            const markDevices: Record<string, DeviceInput> = {};

            // Get assigned devices list if available
            // Check keys in assignedDevices object if it's an object-like array in Firebase, or array
            // Firebase arrays can be tricky, safest is to handle both or assume standard array if formatted correctly
            // Based on user screenshot: 0: "ACDC01", 1: "ACDC02"... so it's a standard list/array structure in JSON
            const assignedList = activeRoom?.assignedDevices ? Object.values(activeRoom.assignedDevices) : [];

            Object.entries(devices).forEach(([id, device]) => {
                // --- STRICT FILTERING LOGIC ---
                // If the room has an assigned devices list, ONLY show devices in that list.
                // If the room does NOT have an assigned list, fall back to checking device.roomId (legacy behavior)
                // or just show all if no filtering is possible (though arguably we should hide all if not assigned).

                let isAllowed = false;

                if (assignedList.length > 0) {
                    // Strict Mode: Must be in the list
                    if (assignedList.includes(id)) {
                        isAllowed = true;
                    }
                } else {
                    // Legacy/Fallback Mode: Check if device points to this room
                    // If targetRoomId is set, device must match it.
                    // If no targetRoomId (auto-latest), we might be lenient or strict.
                    // Given the user issue, let's be smarter:

                    if (targetRoomId) {
                        if (device.roomId === targetRoomId) {
                            isAllowed = true;
                        }
                    } else {
                        // No room context? Show everything (default dashboard mode)
                        isAllowed = true;
                    }
                }

                if (!isAllowed) return;

                // --- DATA MAPPING ---
                const lat = device.location?.lat ?? device.lat ?? DEFAULT_ORIGIN.lat;
                const lon = device.location?.lon ?? device.lon ?? DEFAULT_ORIGIN.lon;
                const speed = device.location?.speed ?? device.speed ?? 0;
                const heading = device.location?.heading ?? device.heading ?? 0;

                const role = device.role || 'racing_boat';

                if (role === 'racing_boat') {
                    const smoothed = smoothGPSData({
                        id,
                        lat,
                        lon,
                        speed,
                        heading,
                    });

                    mappedBoats[id] = {
                        id,
                        lat: smoothed.lat,
                        lon: smoothed.lon,
                        speed,
                        heading: smoothed.heading,
                        team: device.teamId || id,
                        lastUpdated: Date.now(),
                        lastPacketTime: device.location?.timestamp || device.timestamp || 0,
                        trail: smoothed.trail,
                        isStationary: smoothed.isStationary,
                    };
                } else {
                    markDevices[id] = {
                        id,
                        lat,
                        lon,
                        role: role
                    };
                }
            });

            // Update Stores
            useReplayStore.getState().addHistoryFrame(mappedBoats, Date.now());
            if (!useReplayStore.getState().showReplayUI) {
                setBoats(mappedBoats);
            }

            const dynamicCourse = buildCourseFromDevices(markDevices);
            if (dynamicCourse) {
                setCourse(dynamicCourse);
            }
        } else {
            // No devices data
            setBoats({});
        }

    }, [setBoats, setCourse, setRaceName]);

    // Listener: Rooms
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('test') === 'true') return;

        const roomIdParam = params.get('room');
        activeRoomIdRef.current = roomIdParam; // Store for syncState

        // Always fetch all rooms to support auto-latest logic correctly or specific room lookup
        // Or if optimization is needed, only fetch specific room.
        // Existing logic fetched specific room OR all rooms.
        // To support "Assigned Devices" which is inside the room object, we need that room object.

        let roomsRef;
        if (roomIdParam) {
            roomsRef = ref(database, 'rooms'); // Fetch all to be safe? Or just one?
            // Actually, fetching just one is efficient, but struct might be different.
            // Let's stick to previous pattern: If param, fetch specific. Else fetch all.
            // WAIT: If we fetch specific `rooms/{id}`, the snapshot val is the RoomData directly.
            // If we fetch `rooms`, the snapshot val is Record<string, RoomData>.
            // We need to normalize for `latestRooms` ref.

            const specificRoomRef = ref(database, `rooms/${roomIdParam}`);
            const unsub = onValue(specificRoomRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Normalize to map structure for consistent syncState logic
                    latestRooms.current = { [roomIdParam]: data };
                } else {
                    latestRooms.current = null;
                }
                syncState();
            });
            return () => unsub();

        } else {
            roomsRef = ref(database, 'rooms');
            const unsub = onValue(roomsRef, (snapshot) => {
                const data = snapshot.val() as Record<string, RoomData>;
                latestRooms.current = data || null;
                syncState();
            });
            return () => unsub();
        }

    }, [syncState]);


    // Listener: Devices
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('test') === 'true') return;

        const devicesRef = ref(database, 'devices');
        const unsub = onValue(devicesRef, (snapshot) => {
            const data = snapshot.val() as Record<string, FirebaseDevice>;
            latestDevices.current = data || null;
            syncState();
        });

        return () => unsub();
    }, [syncState]);

    return null;
}
