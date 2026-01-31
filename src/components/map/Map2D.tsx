import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useBoatStore } from '../../stores/useBoatStore';
import { useCourseStore } from '../../stores/useCourseStore';
import { useEffect } from 'react';

// Fix for default marker icon in Leaflet + Global import issue
// See https://github.com/PaulLeCam/react-leaflet/issues/453
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Custom component to center map on boats or course
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const BoatMarker = ({ lat, lon, heading, team, color }: { lat: number, lon: number, heading: number, team: string, color: string }) => {
    // Enhanced Boat Icon
    // - Rotated boat shape
    // - Label (Team Name)
    const icon = L.divIcon({
        className: 'custom-boat-icon',
        html: `
            <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <div style="
                    transform: rotate(${heading}deg);
                    width: 14px;
                    height: 30px;
                    background-color: ${color};
                    clip-path: polygon(50% 0%, 100% 85%, 50% 100%, 0% 85%);
                    border: 1.5px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
                <div style="
                    position: absolute;
                    top: -15px;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 1px 4px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: bold;
                    white-space: nowrap;
                    border: 1px solid #ccc;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                ">${team}</div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    return <Marker position={[lat, lon]} icon={icon} />;
};

const MarkMarker = ({ lat, lon, label, color }: { lat: number, lon: number, label: string, color: string }) => {
    // Enhanced Mark Icon
    // - Rounded Rectangle
    // - Clear Text
    const icon = L.divIcon({
        className: 'custom-mark-icon',
        html: `
            <div style="
                background-color: ${color};
                min-width: 24px;
                height: 20px;
                padding: 0 4px;
                border-radius: 4px;
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 11px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
                ${label}
            </div>
        `,
        iconSize: [30, 20],
        iconAnchor: [15, 10],
    });

    return <Marker position={[lat, lon]} icon={icon} />;
}


export default function Map2D() {
    const boats = useBoatStore((state) => state.boats);
    const course = useCourseStore((state) => state.course);

    // Default center (Sattahip)
    const defaultCenter: [number, number] = [12.65, 100.86];

    // Calculate center based on boats or course if available
    // Priority: Course Center -> Boats -> Default
    let mapCenter: [number, number] = defaultCenter;

    if (course && course.marks && course.marks.length > 0) {
        // Calculate center of all marks
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        course.marks.forEach(mark => {
            if (mark.lat < minLat) minLat = mark.lat;
            if (mark.lat > maxLat) maxLat = mark.lat;
            if (mark.lon < minLon) minLon = mark.lon;
            if (mark.lon > maxLon) maxLon = mark.lon;
        });

        // Add start/finish lines if they exist
        if (course.startLine) {
            course.startLine.forEach(p => {
                if (p.lat < minLat) minLat = p.lat;
                if (p.lat > maxLat) maxLat = p.lat;
                if (p.lon < minLon) minLon = p.lon;
                if (p.lon > maxLon) maxLon = p.lon;
            });
        }

        if (course.finishLine) {
            course.finishLine.forEach(p => {
                if (p.lat < minLat) minLat = p.lat;
                if (p.lat > maxLat) maxLat = p.lat;
                if (p.lon < minLon) minLon = p.lon;
                if (p.lon > maxLon) maxLon = p.lon;
            });
        }

        mapCenter = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
    } else {
        const firstBoat = Object.values(boats)[0];
        if (firstBoat) {
            mapCenter = [firstBoat.lat, firstBoat.lon];
        }
    }

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer center={defaultCenter} zoom={15} scrollWheelZoom={true} className="w-full h-full">
                <MapUpdater center={mapCenter} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* Render Boats */}
                {Object.values(boats).map((boat) => (
                    <BoatMarker
                        key={boat.id}
                        lat={boat.lat}
                        lon={boat.lon}
                        heading={boat.heading}
                        team={boat.team}
                        color={boat.role?.includes('buoy') ? '#999' : (boat.team === 'THA' ? '#EF4444' : '#3B82F6')}
                    />
                ))}

                {/* Render Course Marks */}
                {course?.marks.map((mark, index) => (
                    <MarkMarker
                        key={index}
                        lat={mark.lat}
                        lon={mark.lon}
                        label={mark.label}
                        color={mark.color === 'yellow' ? '#EAB308' : (mark.color === 'orange' ? '#F97316' : '#22C55E')}
                    />
                ))}
                {/* Render Start/Finish Lines */}
                {course?.startLine && (
                    <>
                        <MarkMarker lat={course.startLine[0].lat} lon={course.startLine[0].lon} label="S1" color="#F97316" />
                        <MarkMarker lat={course.startLine[1].lat} lon={course.startLine[1].lon} label="S2" color="#22C55E" />
                        <Polyline positions={[[course.startLine[0].lat, course.startLine[0].lon], [course.startLine[1].lat, course.startLine[1].lon]]} pathOptions={{ color: '#F97316', dashArray: '5, 5' }} />
                    </>
                )}
                {course?.finishLine && (
                    <>
                        <MarkMarker lat={course.finishLine[0].lat} lon={course.finishLine[0].lon} label="F1" color="#3B82F6" />
                        <MarkMarker lat={course.finishLine[1].lat} lon={course.finishLine[1].lon} label="F2" color="#3B82F6" />
                        <Polyline positions={[[course.finishLine[0].lat, course.finishLine[0].lon], [course.finishLine[1].lat, course.finishLine[1].lon]]} pathOptions={{ color: '#3B82F6', dashArray: '5, 5' }} />
                    </>
                )}

                {/* Optional: Add a path for the boat trail if needed */}

            </MapContainer>
        </div>
    );
}
