import { useEffect } from 'react';
import type { BoatData } from '../stores/useBoatStore';
import { useBoatStore } from '../stores/useBoatStore';
import { useCourseStore } from '../stores/useCourseStore';
import { useReplayStore } from '../stores/useReplayStore';

export default function SimulationController() {
    const setBoats = useBoatStore((state) => state.setBoats);
    const { generate, course } = useCourseStore();

    useEffect(() => {
        // 1. Generate Course (Wind from North-East)
        if (!course) {
            generate(45);
        }
    }, [generate, course]);

    useEffect(() => {
        if (!course || !course.startLine) return;

        // Find Start Pin and Boat (Start Line endpoints)
        // The generator now returns an array of 2 points for startLine
        const p1 = course.startLine[0];
        const p2 = course.startLine[1];

        if (!p1 || !p2) return;

        // 2. Initial Boats - Line them up at Start Line
        const teams = [
            { id: 'THA-1', team: 'blue' },
        ];

        // Lerp between p1 and p2 to place boats
        const boatCount = teams.length;
        let currentBoats: Record<string, BoatData> = {};

        teams.forEach((team, index) => {
            const t = (index + 1) / (boatCount + 1); // Distribute evenly 
            const lat = p1.lat + (p2.lat - p1.lat) * t;
            const lon = p1.lon + (p2.lon - p1.lon) * t;

            currentBoats[team.id] = {
                id: team.id,
                lat: lat - 0.002, // Start slightly below line
                lon: lon - 0.002,
                speed: 0, // Stopped at start
                heading: 45, // Facing wind/mark
                team: team.team,
                lastUpdated: Date.now()
            };
        });

        setBoats(currentBoats);

        // 3. Race Start Simulation
        // Wait 0.5 seconds then start moving
        setTimeout(() => {
            // Start Loop
            const interval = setInterval(() => {
                const nextBoats: Record<string, BoatData> = {};

                Object.keys(currentBoats).forEach((key) => {
                    const boat = currentBoats[key];

                    // Accel to speed
                    const targetSpeed = 10 + Math.random() * 5;
                    const newSpeed = boat.speed < targetSpeed ? boat.speed + 0.5 : boat.speed;

                    const speedFactor = 0.000003 * newSpeed;

                    // Wiggle
                    const wiggle = (Math.random() - 0.5) * 1;

                    nextBoats[key] = {
                        ...boat,
                        lat: boat.lat + speedFactor * Math.cos(boat.heading * Math.PI / 180),
                        lon: boat.lon + speedFactor * Math.sin(boat.heading * Math.PI / 180),
                        heading: boat.heading + wiggle,
                        speed: newSpeed,
                        lastUpdated: Date.now()
                    };
                });

                // Record history for Simulation too
                useReplayStore.getState().addHistoryFrame(nextBoats, Date.now());

                // Only update view if Live Mode
                if (!useReplayStore.getState().showReplayUI) {
                    setBoats(nextBoats);
                }

                currentBoats = nextBoats; // Update local ref
            }, 100);

            return () => clearInterval(interval);
        }, 500);

    }, [course, setBoats]);

    return null;
}
