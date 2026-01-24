export interface Coordinate {
    lat: number;
    lng: number;
}

export interface LineSegment {
    p1: Coordinate;
    p2: Coordinate;
}

export interface Mark {
    id: string;
    name: string;
    pos: Coordinate;
    radius: number; // in meters
    role?: 'mark1' | 'mark1a' | 'gate' | 'other';
    rounding?: 'port' | 'starboard'; // Default port
}

export interface CourseLayout {
    start_line: LineSegment;
    finish_line: LineSegment;
    marks: Mark[];
}

export interface RaceConfig {
    laps: number;
    total_legs: number;
}

export interface RaceData {
    course_layout: CourseLayout;
    race_config: RaceConfig;
}
