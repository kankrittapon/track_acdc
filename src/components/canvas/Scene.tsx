import { Canvas } from '@react-three/fiber';
import { MapControls, Sky, Environment } from '@react-three/drei';
import Ocean from './Ocean';
import Boat from './Boat';
import CourseManager from './CourseManager';

import CameraController from './CameraController';
import { Suspense, useRef } from 'react';
import { useBoatStore } from '../../stores/useBoatStore';
import { useTestStore } from '../../stores/useTestStore';



import { useShallow } from 'zustand/react/shallow';

function BoatsRenderer() {
    const boatIds = useBoatStore(useShallow((state) => Object.keys(state.boats)));
    return (
        <Suspense fallback={null}>
            {boatIds.map((id) => (
                <Boat key={id} id={id} />
            ))}
        </Suspense>
    );
}

export default function Scene() {
    const controlsRef = useRef<any>(null);
    const isPlacementMode = useTestStore((state) => state.isPlacementMode);

    return (
        <div className="w-full h-full bg-slate-900">
            <Canvas
                camera={{ position: [0, 800, 800], fov: 60, near: 1, far: 20000 }}
                shadows
                gl={{ antialias: true }}
            >
                <CameraController />
                <MapControls
                    ref={controlsRef}
                    enabled={!isPlacementMode} // Disable controls when placing
                    enableDamping={true}
                    dampingFactor={0.05}
                    screenSpacePanning={false}
                    minDistance={50}
                    maxDistance={5000}
                    maxPolarAngle={Math.PI / 2.1} // Prevent going below surface
                    makeDefault // Important for useThree().controls to work
                />

                <fog attach="fog" args={['#006994', 0, 10000]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[100, 100, 50]} intensity={1.5} castShadow />
                <Sky sunPosition={[100, 20, 100]} />
                <Environment preset="sunset" />

                {/* Course Markers */}
                <CourseManager />

                <Ocean />

                <BoatsRenderer />
            </Canvas>
        </div>
    );
}
