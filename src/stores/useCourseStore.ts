import { create } from 'zustand';
import type { CourseData } from '../lib/courseGenerator';
import { generateCourse } from '../lib/courseGenerator';
import { DEFAULT_ORIGIN } from '../lib/coordinates';

interface CourseStore {
    course: CourseData | null;
    activeLegIndex: number; // Index of the current leg/mark we are heading towards
    raceName: string | null;
    generate: (windDir: number) => void;
    setCourse: (course: CourseData) => void;
    setRaceName: (name: string) => void;
    nextLeg: () => void;
    prevLeg: () => void;
    setLeg: (index: number) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
    course: null,
    activeLegIndex: 0,
    raceName: null,
    /**
     * Generates a new course based on wind direction
     * Uses DEFAULT_ORIGIN as center (Sattahip Bay)
     */
    generate: (windDir: number) => {
        // Generate around DEFAULT_ORIGIN for now
        const courseData = generateCourse(DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon, windDir, 3000);
        set({ course: courseData });
    },
    setCourse: (course) => set({ course }),
    setRaceName: (name) => set({ raceName: name }),
    nextLeg: () => set((state) => {
        const max = state.course?.marks.length || 0;
        return { activeLegIndex: Math.min(state.activeLegIndex + 1, max) };
    }),
    prevLeg: () => set((state) => ({ activeLegIndex: Math.max(state.activeLegIndex - 1, 0) })),
    setLeg: (index) => set({ activeLegIndex: index })
}));
