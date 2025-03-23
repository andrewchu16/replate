"use client";
import { useEffect, useState } from 'react';
import type Preferences from '../../../models/preferences.model';
import dynamic from 'next/dynamic';

// Dynamic import of the map component to avoid SSR issues
const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[300px] rounded-lg shadow-md bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
    )
});

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function DistanceStep({ preferences, updatePreferences }: StepProps) {
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
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
    }, [updatePreferences]);

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
            {currentPosition && (
                <Map 
                    currentPosition={currentPosition}
                    distance={preferences.maxDistance || 0.2}
                />
            )}

            <div className="transition-all duration-200 p-4">
                <label className="block text-xl font-nunito mb-2">
                    Maximum distance
                </label>
                <input
                    type="range"
                    min="0.2"
                    max="20"
                    step="0.1"
                    value={preferences.maxDistance || 0.2}
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