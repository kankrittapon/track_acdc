import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCourseStore } from '../../stores/useCourseStore';
import { useBoatStore } from '../../stores/useBoatStore';
import { latLonToXZ, DEFAULT_ORIGIN } from '../../lib/coordinates';
import * as THREE from 'three';

// Constants
const SPEED = 5.0; // 5 units/frame
const TURN_RADIUS = 30; // 30 meters

export default function RaceSimulator() {
    const { course, setLeg } = useCourseStore();
    const updateBoat = useBoatStore(s => s.updateBoat);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const progress = useRef(0);
    const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

    // Generate Path when course changes
    useEffect(() => {
        if (!course) return;

        const getV3 = (pt: { lat: number, lon: number }) => {
            const p = latLonToXZ(pt.lat, pt.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
            return new THREE.Vector3(p.x, 0, p.z);
        };

        const pts: THREE.Vector3[] = [];

        // 0. Start (Green Boat) - Robust Find
        const startBoat = course.startLine.find((p: any) => p.color === 'green' || p.type === 'boat')
            || course.startLine[1];
        pts.push(getV3(startBoat));

        // --- Mark 1 Rounding ---
        const m1 = getV3(course.marks[0]);
        pts.push(new THREE.Vector3(m1.x + TURN_RADIUS, 0, m1.z + TURN_RADIUS));
        pts.push(new THREE.Vector3(m1.x + TURN_RADIUS, 0, m1.z - TURN_RADIUS));
        pts.push(new THREE.Vector3(m1.x - TURN_RADIUS, 0, m1.z - TURN_RADIUS));
        pts.push(new THREE.Vector3(m1.x - TURN_RADIUS, 0, m1.z + TURN_RADIUS));

        // --- Mark 2 Rounding ---
        const m2 = getV3(course.marks[1]);
        pts.push(new THREE.Vector3(m2.x + TURN_RADIUS, 0, m2.z - TURN_RADIUS));
        pts.push(new THREE.Vector3(m2.x - TURN_RADIUS, 0, m2.z + TURN_RADIUS));

        // --- Gate 3 Passage ---
        const gateMarks = course.marks.filter((m: any) => m.type === 'gate');
        if (gateMarks.length >= 2) {
            const g1 = getV3(gateMarks[0]);
            const g2 = getV3(gateMarks[1]);
            const gateMid = g1.clone().add(g2).multiplyScalar(0.5);
            pts.push(gateMid);

            const gTarget = g2;
            pts.push(new THREE.Vector3(gTarget.x - TURN_RADIUS, 0, gTarget.z + TURN_RADIUS));
        } else {
            pts.push(getV3(course.marks[2]));
        }

        // --- Mark 4 Rounding ---
        const m4 = getV3(course.marks[course.marks.length - 1]);
        pts.push(new THREE.Vector3(m4.x + TURN_RADIUS, 0, m4.z - TURN_RADIUS));
        pts.push(new THREE.Vector3(m4.x - TURN_RADIUS, 0, m4.z + TURN_RADIUS));

        // --- Finish ---
        const f1 = getV3(course.finishLine[0]);
        const f2 = getV3(course.finishLine[1]);
        const fMid = f1.clone().add(f2).multiplyScalar(0.5);
        pts.push(fMid);
        pts.push(fMid.clone().add(new THREE.Vector3(100, 0, 0)));

        const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
        curveRef.current = curve;
        setIsPlaying(true);
        progress.current = 0;

        // Reset Sim Boat to start
        const startPt = pts[0];
        const mToLat = 1 / 111111;
        const mToLon = 1 / (111111 * Math.cos(DEFAULT_ORIGIN.lat * Math.PI / 180));
        updateBoat('sim-boat', {
            id: 'sim-boat',
            lat: DEFAULT_ORIGIN.lat + startPt.z * mToLat,
            lon: DEFAULT_ORIGIN.lon + startPt.x * mToLon,
            heading: 0,
            speed: 0
        });

    }, [course]);

    useFrame(() => {
        if (!isPlaying || !curveRef.current) return;

        // Advance progress
        const totalLength = curveRef.current.getLength();
        const moveDist = SPEED;
        const moveFrac = moveDist / totalLength;

        progress.current += moveFrac;

        if (progress.current >= 1) {
            progress.current = 0;
        }

        const p = progress.current % 1;

        // Get Point
        const pt = curveRef.current.getPointAt(p);
        const tangent = curveRef.current.getTangentAt(p);

        let heading = Math.atan2(tangent.x, -tangent.z) * 180 / Math.PI;
        if (heading < 0) heading += 360;

        const mToLat = 1 / 111111;
        const mToLon = 1 / (111111 * Math.cos(DEFAULT_ORIGIN.lat * Math.PI / 180));

        const lat = DEFAULT_ORIGIN.lat + pt.z * mToLat;
        const lon = DEFAULT_ORIGIN.lon + pt.x * mToLon;

        updateBoat('sim-boat', {
            id: 'sim-boat',
            lat,
            lon,
            heading,
            speed: 15,
        });

        if (p < 0.32) setLeg(0);      // To Mark 1
        else if (p < 0.48) setLeg(1); // To Mark 2
        else if (p < 0.63) setLeg(2); // To Gate
        else if (p < 0.79) setLeg(4); // To Mark 4
        else setLeg(5);               // To Finish

    });

    return null;
}
