import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useBoatStore } from '../../stores/useBoatStore';
import { useCourseStore } from '../../stores/useCourseStore';
import { latLonToXZ, DEFAULT_ORIGIN } from '../../lib/coordinates';
import * as THREE from 'three';

export default function CameraController() {
    const { camera, controls } = useThree();
    const { setFollowingBoat, followingBoatId } = useBoatStore();

    // Ref to track previous boat position to calculate delta
    const prevBoatPos = useRef<THREE.Vector3 | null>(null);

    // 1. Keyboard Shortcuts & Snap Logic
    useEffect(() => {
        // Keyboard Handler
        const handleKeyDown = (e: KeyboardEvent) => {
            // 1-9 to follow boats
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                const currentBoats = useBoatStore.getState().boats;
                const boatIds = Object.keys(currentBoats);

                if (boatIds[index]) setFollowingBoat(boatIds[index]);
            }
            if (e.key === 'Escape') setFollowingBoat(null);
        };

        const handleFitBounds = () => {
            const currentBoats = useBoatStore.getState().boats;
            const boatIds = Object.keys(currentBoats);
            if (boatIds.length === 0) return;

            let minX = Infinity, maxX = -Infinity;
            let minZ = Infinity, maxZ = -Infinity;

            boatIds.forEach(id => {
                const b = currentBoats[id];
                const pos = latLonToXZ(b.lat, b.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
                if (pos.x < minX) minX = pos.x;
                if (pos.x > maxX) maxX = pos.x;
                if (pos.z < minZ) minZ = pos.z;
                if (pos.z > maxZ) maxZ = pos.z;
            });

            const centerX = (minX + maxX) / 2;
            const centerZ = (minZ + maxZ) / 2;
            const sizeX = maxX - minX;
            const sizeZ = maxZ - minZ;
            const maxDim = Math.max(sizeX, sizeZ);

            // Calculate distance needed (approximate FOV logic)
            // FOV 50 deg ~ 0.87 rad. tan(25) = 0.46
            // Dist = (size / 2) / 0.46
            const fovFactor = 0.6; // Tune this to fit padding
            const distance = (maxDim / 2) / fovFactor + 200; // +200 min distance

            const glControls = controls as any;
            if (glControls) {
                glControls.target.set(centerX, 0, centerZ);
                camera.position.set(centerX, distance, centerZ + distance * 0.8); // Angled view
                glControls.update();
            }
        };

        const handleZoom = (e: Event) => {
            const glControls = controls as any;
            if (!glControls) return;

            const isZoomIn = e.type === 'map-zoom-in';
            const vec = new THREE.Vector3().subVectors(camera.position, glControls.target);
            const scale = isZoomIn ? 0.8 : 1.25;

            // Limit zoom
            const newLen = vec.length() * scale;
            if (newLen > 50 && newLen < 5000) {
                vec.multiplyScalar(scale);
                camera.position.copy(glControls.target).add(vec);
                glControls.update();
            }
        };

        const handleReset = () => {
            // Reset to 45 degree angle looking at current target (or 0,0,0 if none)
            const glControls = controls as any;
            if (!glControls) return;

            const currentTarget = glControls.target.clone();
            camera.position.set(currentTarget.x, 500, currentTarget.z + 500);
            glControls.update();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('camera-fit-bounds', handleFitBounds);
        window.addEventListener('map-zoom-in', handleZoom);
        window.addEventListener('map-zoom-out', handleZoom);
        window.addEventListener('camera-reset', handleReset);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('camera-fit-bounds', handleFitBounds);
            window.removeEventListener('map-zoom-in', handleZoom);
            window.removeEventListener('map-zoom-out', handleZoom);
            window.removeEventListener('camera-reset', handleReset);
        };
    }, [setFollowingBoat, camera, controls]);

    // 2. Zoom & Snap Effect when boat changes
    useEffect(() => {
        const storeState = useBoatStore.getState();
        const glControls = controls as any; // controls from useThree is the instance, not a ref
        const targetId = storeState.followingBoatId;

        if (targetId && storeState.boats[targetId] && glControls) {
            const boat = storeState.boats[targetId];
            const pos = latLonToXZ(boat.lat, boat.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
            const targetVec = new THREE.Vector3(pos.x, 0, pos.z);

            // Safety Check for NaN/Infinity
            if (!Number.isFinite(targetVec.x) || !Number.isFinite(targetVec.z)) {
                console.warn("CameraController: Invalid boat position for", targetId, pos);
                return;
            }

            console.log("Snapping to:", targetId, targetVec);

            // SNAP LOGIC:
            // 1. Center camera on boat
            glControls.target.copy(targetVec);

            // 2. Zoom in (Set standard tactical view height)
            // Maintain current rotation? Or force top-down?
            // Let's force a nice angle: Behind and Up
            // Offset: { x: 0, y: 300, z: 300 } -> 45 degree top down

            camera.position.set(targetVec.x, 300, targetVec.z + 300);

            glControls.update();
            prevBoatPos.current = targetVec; // Reset prev pos to avoid jumps
        } else {
            prevBoatPos.current = null;
        }

    }, [setFollowingBoat, followingBoatId, controls, camera]); // Trigger when ID changes

    // Ref for throttling logs
    const frameCounter = useRef(0);


    // 3. Follow Logic (Frame Update)
    useFrame((_state, delta) => {
        const glControls = controls as any;
        frameCounter.current += 1;
        // const shouldLog = frameCounter.current % 60 === 0;

        if (!glControls) return;

        // Course Bounds Constraint Helper
        const constrainTarget = () => {
            const course = useCourseStore.getState().course;
            if (!course || course.marks.length === 0) return;

            // Calculate bounds (Cache this in ref for perf? iterating 4 points is fast enough)
            let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
            // Include Marks
            course.marks.forEach((m: any) => {
                const p = latLonToXZ(m.lat, m.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
                minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
                minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
            });
            // Include Start/Finish
            [...course.startLine, ...course.finishLine].forEach((m: any) => {
                const p = latLonToXZ(m.lat, m.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
                minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
                minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
            });

            const PADDING = 1000; // Allow some buffer
            glControls.target.x = THREE.MathUtils.clamp(glControls.target.x, minX - PADDING, maxX + PADDING);
            glControls.target.z = THREE.MathUtils.clamp(glControls.target.z, minZ - PADDING, maxZ + PADDING);
        };

        // Read state directly
        const storeState = useBoatStore.getState();
        const currentFollowingId = storeState.followingBoatId;
        const currentBoats = storeState.boats;

        if (currentFollowingId) {
            // ... (Keep existing Follow Logic)
            const boat = currentBoats[currentFollowingId];
            if (!boat) return;

            const pos = latLonToXZ(boat.lat, boat.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
            const rawTargetVec = new THREE.Vector3(pos.x, 0, pos.z);

            if (!prevBoatPos.current) {
                prevBoatPos.current = rawTargetVec.clone();
                return;
            }

            const alpha = delta * 5;
            prevBoatPos.current.lerp(rawTargetVec, alpha);

            const oldTarget = glControls.target.clone();
            glControls.target.lerp(rawTargetVec, alpha);

            // Apply Constraint
            constrainTarget();

            const deltaMovement = new THREE.Vector3().subVectors(glControls.target, oldTarget);
            camera.position.add(deltaMovement);
            glControls.update();

            prevBoatPos.current = glControls.target.clone();

        } else if (storeState.isOverviewMode) {
            // ... (Keep existing Overview Logic)
            // Overview mode usually fits bounds anyway, maybe minimal constraint needed?
            // But let's apply constraint just in case user pans?
            // Actually overview handles position setting explicitly.
            // Let's assume overview is safe.
            // Just copy the block but maybe skip constraint if it interferes with auto-fit.
            // existing logic... (I will copy paste existing logic for safety)
            // Since I'm replacing the whole useFrame, I must include Overview logic.
            const boatIds = Object.keys(currentBoats);

            if (boatIds.length > 0) {
                let minX = Infinity, maxX = -Infinity;
                let minZ = Infinity, maxZ = -Infinity;

                boatIds.forEach(id => {
                    const b = currentBoats[id];
                    const pos = latLonToXZ(b.lat, b.lon, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
                    if (pos.x < minX) minX = pos.x;
                    if (pos.x > maxX) maxX = pos.x;
                    if (pos.z < minZ) minZ = pos.z;
                    if (pos.z > maxZ) maxZ = pos.z;
                });

                const padding = 100;
                minX -= padding; maxX += padding;
                minZ -= padding; maxZ += padding;

                const centerX = (minX + maxX) / 2;
                const centerZ = (minZ + maxZ) / 2;
                const sizeX = maxX - minX;
                const sizeZ = maxZ - minZ;
                const maxDim = Math.max(sizeX, sizeZ);

                const fovFactor = 0.6;
                const distance = (maxDim / 2) / fovFactor + 200;

                const desiredTarget = new THREE.Vector3(centerX, 0, centerZ);
                const desiredPos = new THREE.Vector3(centerX, distance, centerZ + distance * 0.8);

                const alpha = delta * 2.0;

                glControls.target.lerp(desiredTarget, alpha);
                camera.position.lerp(desiredPos, alpha);

                // No constraint needed for overview as it's auto-calculated
                glControls.update();
            }
        } else {
            // Free Cam Mode - Constrain here!
            constrainTarget();
            glControls.update();
            prevBoatPos.current = null;
        }
    });

    return null;
}
