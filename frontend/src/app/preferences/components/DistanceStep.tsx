"use client";
import { useEffect, useState, useRef } from 'react';
import type Preferences from '../../../models/preferences.model';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function DistanceStep({ preferences, updatePreferences }: StepProps) {
    const mapRef = useRef<L.Map | null>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        // Get user's current position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setCurrentPosition(pos);
                    updatePreferences('latitude', pos[0]);
                    updatePreferences('longitude', pos[1]);
                },
                () => {
                    console.error("Error getting location");
                }
            );
        }
    }, []);

    useEffect(() => {
        if (!currentPosition) return;

        // Fix for Leaflet's icon path issues in Next.js
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
                radius: (preferences.maxDistance || 0.2) * 1000 // Convert km to meters
            }).addTo(map);

            mapRef.current = map;
            circleRef.current = circle;
        }

        // Update circle radius when distance changes
        if (circleRef.current && preferences.maxDistance) {
            circleRef.current.setRadius(preferences.maxDistance * 1000);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                circleRef.current = null;
            }
        };
    }, [currentPosition, preferences.maxDistance]);

    return (
        <div className="space-y-4 text-center">
            <h2 className="text-6xl font-crazy">Distance</h2>
            <p className="text-xl font-nunito text-black mt-2 p-4">
                How far are you willing to travel?
            </p>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <span className="text-6xl">🚗</span>
            </div>

            {/* Map Container */}
            <div 
                id="map" 
                className="w-full h-[300px] rounded-lg shadow-md"
            />

            <div className="transition-all duration-200 p-4">
                <label className="block text-xl font-nunito mb-2">
                    Maximum distance
                </label>
                <input
                    type="range"
                    min="0.2"
                    max="20"
                    step="0.1"
                    value={preferences.maxDistance}
                    onChange={(e) => updatePreferences('maxDistance', Number(e.target.value))}
                    className="w-full transition-all duration-200 accent-green-500 hover:accent-green-600"
                />
                <div className="text-center text-xl font-nunito mt-2 transition-all duration-200">
                    {preferences.maxDistance && preferences.maxDistance < 1 
                        ? `${(preferences.maxDistance * 1000).toFixed(0)}m` 
                        : `${preferences.maxDistance || 0}km`}
                </div>
            </div>
        </div>
    );
} 