"use client";
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapProps {
    currentPosition: [number, number];
    distance: number;
}

export default function Map({ currentPosition, distance }: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const circleRef = useRef<L.Circle | null>(null);

    useEffect(() => {
        // Fix for Leaflet's icon path issues in Next.js
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize map if it doesn't exist
        if (!mapRef.current) {
            const map = L.map('map').setView(currentPosition, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Add marker for current position
            L.marker(currentPosition).addTo(map);

            // Add circle
            const circle = L.circle(currentPosition, {
                color: '#22c55e',
                fillColor: '#22c55e',
                fillOpacity: 0.2,
                radius: distance * 1000 // Convert km to meters
            }).addTo(map);

            mapRef.current = map;
            circleRef.current = circle;
        }

        // Update circle radius when distance changes
        if (circleRef.current) {
            circleRef.current.setRadius(distance * 1000);
            
            // Update map bounds to fit the circle
            if (mapRef.current) {
                const bounds = circleRef.current.getBounds();
                mapRef.current.fitBounds(bounds);
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                circleRef.current = null;
            }
        };
    }, [currentPosition, distance]);

    return (
        <div 
            id="map" 
            className="w-full h-[300px] rounded-lg shadow-md"
        />
    );
} 