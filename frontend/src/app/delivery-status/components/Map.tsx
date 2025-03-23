'use client';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type MealItem from '../../../models/mealItem.model';
import type { DeliveryStatus } from '../types';

interface MapProps {
    userLocation: [number, number] | null;
    mealPlan: MealItem[];
    deliveryStatuses: DeliveryStatus[];
}

export default function Map({ userLocation, mealPlan, deliveryStatuses }: MapProps) {
    useEffect(() => {
        if (!userLocation || !mealPlan.length) return;

        // Fix for Leaflet's icon path issues in Next.js
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize map
        const map = L.map('delivery-map').setView(userLocation, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add user marker
        const userIcon = L.divIcon({
            className: 'bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        L.marker(userLocation, { icon: userIcon })
            .bindPopup('Your Location')
            .addTo(map);

        // Add restaurant markers
        mealPlan.forEach((meal, index) => {
            if (meal.latitude && meal.longitude) {
                const isDelivered = deliveryStatuses[index]?.status === 'Delivered';
                const restaurantIcon = L.divIcon({
                    className: `relative ${isDelivered ? 'bg-green-500' : 'bg-yellow-500'} w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center`,
                    html: isDelivered 
                        ? `<div class="absolute inset-0 flex items-center justify-center">
                             <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                             </svg>
                           </div>`
                        : '',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                
                L.marker([meal.latitude, meal.longitude], { icon: restaurantIcon })
                    .bindPopup(`
                        <div class="text-sm">
                            <p class="font-semibold">${meal.storeName}</p>
                            <p>${meal.name}</p>
                            <p class="text-${isDelivered ? 'green' : 'yellow'}-600 font-medium">
                                ${deliveryStatuses[index]?.status || 'Connecting...'}
                            </p>
                        </div>
                    `)
                    .addTo(map);
            }
        });

        // Fit bounds to include all markers
        const bounds = L.latLngBounds([userLocation]);
        mealPlan.forEach(meal => {
            if (meal.latitude && meal.longitude) {
                bounds.extend([meal.latitude, meal.longitude]);
            }
        });
        map.fitBounds(bounds, { padding: [50, 50] });

        return () => {
            map.remove();
        };
    }, [userLocation, mealPlan, deliveryStatuses]);

    return (
        <div 
            id="delivery-map" 
            className="w-full h-[300px] rounded-lg shadow-md mb-6"
        />
    );
} 