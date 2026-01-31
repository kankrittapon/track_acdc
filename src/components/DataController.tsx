import { useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';
import { useBoatStore } from '../stores/useBoatStore';
import { useReplayStore } from '../stores/useReplayStore';
import type { BoatData } from '../stores/useBoatStore';
import { useCourseStore } from '../stores/useCourseStore';
import { buildCourseFromDevices } from '../lib/courseGenerator';
import type { DeviceInput } from '../lib/courseGenerator';
import { DEFAULT_ORIGIN } from '../lib/coordinates';

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
    roomId?: string; // Added field
    // ... other raw fields
}

interface RoomData {
    name: string;
    createdAt: number;
    [key: string]: unknown;
}

// ... (keep FirebasePoint/FirebaseCourse if we want to keep legacy support, 
// but we can remove them if we fully switch. Let's keep for safety if I don't delete useEffect 2)


export default function DataController() {
    const setBoats = useBoatStore((state) => state.setBoats);
    const setCourse = useCourseStore((state) => state.setCourse);

    // 2. Fetch Active Race/Room Info
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isTestMode = params.get('test') === 'true';

        // In Test Mode, we don't sync Rooms from Firebase
        if (isTestMode) return;

        // const rootPath = ''; // Always production in live mode, test mode is offline

        const roomIdParam = params.get('room');
        const setRaceName = useCourseStore.getState().setRaceName;

        let roomsRef;
        if (roomIdParam) {
            // Specific Room Mode
            roomsRef = ref(database, `rooms/${roomIdParam}`);
            const unsubscribe = onValue(roomsRef, (snapshot) => {
                const data = snapshot.val();
                if (data && data.name) {
                    setRaceName(data.name);
                }
            });
            return () => unsubscribe();
        } else {
            // Auto-Latest Mode (Default)
            roomsRef = ref(database, 'rooms');
            const unsubscribe = onValue(roomsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    let latestRoom: RoomData | undefined = undefined;
                    const roomsMap = data as Record<string, RoomData>;

                    Object.values(roomsMap).forEach((r) => {
                        if (!latestRoom || (r.createdAt > latestRoom.createdAt)) {
                            latestRoom = r;
                        }
                    });

                    if (latestRoom) {
                        setRaceName(latestRoom.name);
                    }
                }
            });
            return () => unsubscribe();
        }
    }, []);

    // 1. Fetch Boat Telemetry (Devices) & Dynamic Course
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isTestMode = params.get('test') === 'true';

        // In Test Mode, we don't sync Devices from Firebase
        if (isTestMode) return;

        const devicesRef = ref(database, 'devices');
        const roomIdParam = params.get('room');

        const unsubscribe = onValue(devicesRef, (snapshot) => {
            const rawData = snapshot.val() as Record<string, FirebaseDevice>;

            if (rawData) {
                const mappedBoats: Record<string, BoatData> = {};
                // markDevices acts as raw input for course generator, usage depends on impl.
                // Assuming it takes objects with role, lat, lon.
                const markDevices: Record<string, DeviceInput> = {};


                Object.entries(rawData).forEach(([id, device]) => {
                    // Filter by Room ID if provided
                    if (roomIdParam && device.roomId && device.roomId !== roomIdParam) {
                        return;
                    }

                    // Handle nested location object if present, otherwise fallback to root fields
                    const lat = device.location?.lat ?? device.lat ?? DEFAULT_ORIGIN.lat;
                    const lon = device.location?.lon ?? device.lon ?? DEFAULT_ORIGIN.lon;
                    const speed = device.location?.speed ?? device.speed ?? 0;
                    const heading = device.location?.heading ?? device.heading ?? 0;

                    const role = device.role || 'racing_boat';

                    if (role === 'racing_boat') {
                        mappedBoats[id] = {
                            id,
                            lat,
                            lon,
                            speed,
                            heading,
                            team: device.teamId || id,
                            lastUpdated: Date.now()
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

                // 1. Update Boats
                useReplayStore.getState().addHistoryFrame(mappedBoats, Date.now());

                if (!useReplayStore.getState().showReplayUI) {
                    setBoats(mappedBoats);
                }

                // 2. Update Course dynamically
                const dynamicCourse = buildCourseFromDevices(markDevices);
                if (dynamicCourse) {
                    setCourse(dynamicCourse);
                }
            } else {
                // Clear everything if data is null (wiped from Firebase)
                setBoats({});
                useCourseStore.setState({ course: null });
            }
        });

        return () => unsubscribe();
    }, [setBoats, setCourse]);

    return null;
}
