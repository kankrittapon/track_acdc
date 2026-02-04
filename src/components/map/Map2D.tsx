import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useBoatStore } from '../../stores/useBoatStore';
import { useCourseStore } from '../../stores/useCourseStore';
import { useRulerStore } from '../../stores/useRulerStore';
import { useEffect } from 'react';
import { normalizeHeading } from '../../lib/gpsSmoothing';

// Fix for default marker icon in Leaflet + Global import issue
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

// Handle zoom events from RightMenu
function ZoomHandler() {
    const map = useMap();

    useEffect(() => {
        const handleZoomIn = () => map.zoomIn();
        const handleZoomOut = () => map.zoomOut();
        const handleCameraReset = () => {
            // Fit bounds to include all boats
            const boats = useBoatStore.getState().boats;
            const course = useCourseStore.getState().course;
            const bounds: [number, number][] = [];

            Object.values(boats).forEach(boat => {
                bounds.push([boat.lat, boat.lon]);
            });

            course?.marks.forEach(mark => {
                bounds.push([mark.lat, mark.lon]);
            });

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        };

        window.addEventListener('map-zoom-in', handleZoomIn);
        window.addEventListener('map-zoom-out', handleZoomOut);
        window.addEventListener('camera-reset', handleCameraReset);

        return () => {
            window.removeEventListener('map-zoom-in', handleZoomIn);
            window.removeEventListener('map-zoom-out', handleZoomOut);
            window.removeEventListener('camera-reset', handleCameraReset);
        };
    }, [map]);

    return null;
}

// Ruler click handler component
function RulerHandler() {
    const isActive = useRulerStore((s) => s.isActive);
    const addPoint = useRulerStore((s) => s.addPoint);

    useMapEvents({
        click: (e) => {
            if (isActive) {
                addPoint(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    return null;
}

// Ruler line display
function RulerDisplay() {
    const points = useRulerStore((s) => s.points);
    const distance = useRulerStore((s) => s.distance);
    const isActive = useRulerStore((s) => s.isActive);

    if (!isActive || points.length === 0) return null;

    const positions = points.map(p => [p.lat, p.lon] as [number, number]);

    // Distance label at midpoint
    const midPoint = points.length === 2
        ? [(points[0].lat + points[1].lat) / 2, (points[0].lon + points[1].lon) / 2]
        : null;

    const distanceIcon = midPoint && distance ? L.divIcon({
        className: 'ruler-distance-label',
        html: `<div style="
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
        ">${distance >= 1000 ? (distance / 1000).toFixed(2) + ' km' : distance.toFixed(0) + ' m'}</div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
    }) : undefined;

    return (
        <>
            {/* Ruler line */}
            <Polyline
                positions={positions}
                pathOptions={{
                    color: '#FF6B6B',
                    weight: 3,
                    dashArray: '10, 5'
                }}
            />
            {/* Point markers */}
            {points.map((p, i) => (
                <Marker
                    key={i}
                    position={[p.lat, p.lon]}
                    icon={L.divIcon({
                        className: 'ruler-point',
                        html: `<div style="
                            width: 12px;
                            height: 12px;
                            background: #FF6B6B;
                            border: 2px solid white;
                            border-radius: 50%;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        "></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                    })}
                />
            ))}
            {/* Distance label */}
            {midPoint && distanceIcon && (
                <Marker
                    position={midPoint as [number, number]}
                    icon={distanceIcon}
                />
            )}
        </>
    );
}

// Soldier Icon Marker with rotation
const SoldierMarker = ({ lat, lon, heading, team }: {
    lat: number,
    lon: number,
    heading: number,
    team: string
}) => {
    const normalizedHeading = normalizeHeading(heading);


    const icon = L.divIcon({
        className: 'soldier-marker',
        html: `
            <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
                <div style="
                    width: 24px;
                    height: 24px;
                    transform: rotate(${normalizedHeading}deg);
                    transition: transform 0.3s ease-out;
                    position: relative;
                ">
                    <!-- Helmet (circle) -->
                    <div style="
                        position: absolute;
                        width: 20px;
                        height: 20px;
                        background: linear-gradient(135deg, #5B8C51 0%, #3D5C38 100%);
                        border-radius: 50%;
                        border: 2px solid #2D4228;
                        top: 0;
                        left: 2px;
                    "></div>
                    <!-- Star on helmet -->
                    <div style="
                        position: absolute;
                        top: 6px;
                        left: 8px;
                        color: #FFD700;
                        font-size: 8px;
                    ">★</div>
                    <!-- Body (arrow pointing north) -->
                    <div style="
                        position: absolute;
                        width: 0;
                        height: 0;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-bottom: 10px solid #3D5C38;
                        top: -8px;
                        left: 6px;
                    "></div>
                </div>
                <div style="
                    position: absolute;
                    top: -12px;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: bold;
                    white-space: nowrap;
                    border: 1px solid #ccc;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                ">${team}</div>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });

    return <Marker position={[lat, lon]} icon={icon} />;
};

// Boat Trail (Wake) Component
const BoatTrail = ({ trail }: { trail: { lat: number; lon: number }[] }) => {
    if (!trail || trail.length < 2) return null;

    const positions = trail.map(p => [p.lat, p.lon] as [number, number]);

    return (
        <Polyline
            positions={positions}
            pathOptions={{
                color: '#3B82F6',
                weight: 2,
                opacity: 0.5,
                dashArray: '2, 4'
            }}
        />
    );
};

const MarkMarker = ({ lat, lon, label, color }: { lat: number, lon: number, label: string, color: string }) => {
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
    let mapCenter: [number, number] = defaultCenter;

    if (course && course.marks && course.marks.length > 0) {
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        course.marks.forEach(mark => {
            if (mark.lat < minLat) minLat = mark.lat;
            if (mark.lat > maxLat) maxLat = mark.lat;
            if (mark.lon < minLon) minLon = mark.lon;
            if (mark.lon > maxLon) maxLon = mark.lon;
        });

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
                <ZoomHandler />
                <RulerHandler />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* Render Boat Trails (Wake) */}
                {Object.values(boats).map((boat) => (
                    boat.trail && <BoatTrail key={`trail-${boat.id}`} trail={boat.trail} />
                ))}

                {/* Render Soldiers (formerly Boats) */}
                {Object.values(boats).map((boat) => (
                    <SoldierMarker
                        key={boat.id}
                        lat={boat.lat}
                        lon={boat.lon}
                        heading={boat.heading}
                        team={boat.team}
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

                {/* Ruler Display */}
                <RulerDisplay />

            </MapContainer>
        </div>
    );
}
