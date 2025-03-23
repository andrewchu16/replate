'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type MealItem from '../../models/mealItem.model';
import { io } from 'socket.io-client';          
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface DeliveryStatus {
    status: string;
    estimatedTime?: string;
    currentLocation?: {
        lat: number;
        lng: number;
    };
}

const deliveryStages = ['Order Received', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function DeliveryStatus() {
    const [mealPlan, setMealPlan] = useState<MealItem[]>([]);
    const [deliveryStatuses, setDeliveryStatuses] = useState<DeliveryStatus[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => {
                    setError('Failed to access location. Please enable location services.');
                }
            );
        }

        // Fix for Leaflet's icon path issues in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        try {
            const storedMealPlan = localStorage.getItem('orderedMealPlan');
            if (!storedMealPlan) {
                setError('No active order found.');
                return;
            }

            const domain = process.env.NEXT_PUBLIC_WS_DOMAIN;
            const port = process.env.NEXT_PUBLIC_WS_PORT;

            if (!domain || !port) {
                throw new Error('WebSocket configuration is missing');
            }

            const wsUrl = `${domain}:${port}`;
            const parsedMealPlan = JSON.parse(storedMealPlan);
            setMealPlan(parsedMealPlan);
            setDeliveryStatuses(new Array(parsedMealPlan.length).fill({ status: 'Connecting...' }));

            const socket = io(wsUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                console.log('Connected to Socket.IO server');
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setError('Failed to connect to delivery status service.');
            });
            parsedMealPlan.forEach((_: unknown, index: number) => {
                const channel = `/ws/delivery-status/${index}`;
                socket.on(channel, (data: DeliveryStatus) => {
                    setDeliveryStatuses(prev => {
                        
                        const newStatuses = [...prev];
                        console.log(`Updating status for index ${index}:`, data);
                        newStatuses[index] = data;
                        console.log('New statuses:', newStatuses);
                        return newStatuses;
                    });
                });
            });

            return () => {
                socket.disconnect();
            };
        } catch (err) {
            console.error('Error loading order status:', err);
            setError('Failed to load order status.');
        }
    }, []);

    useEffect(() => {
        if (!userLocation || !mealPlan.length) return;

        // Initialize map
        const map = L.map('delivery-map').setView(userLocation, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add user marker with custom icon
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

    const getStageProgress = (status: string) => {
        const index = deliveryStages.indexOf(status);
        return Math.max(0, index) / (deliveryStages.length - 1) * 100;
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Delivery Status</h1>
                
                {/* Map Container */}
                <div 
                    id="delivery-map" 
                    className="w-full h-[300px] rounded-lg shadow-md mb-6"
                />

                <div className="space-y-6">
                    {mealPlan.map((meal, index) => (
                        <div 
                            key={index}
                            className="border rounded-lg overflow-hidden shadow-sm p-6"
                        >
                            <div className="flex gap-4 mb-4">
                                <div className="relative w-24 h-24 flex-shrink-0">
                                    <Image 
                                        src={meal.imgUrl} 
                                        alt={meal.name}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-semibold text-lg">{meal.name}</h2>
                                    <p className="text-gray-600">{meal.storeName}</p>
                                </div>
                            </div>

                            {/* Progress Bar Section */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    {deliveryStages.slice(1).map((stage) => (
                                        <div 
                                            key={stage}
                                            className={`${
                                                deliveryStatuses[index]?.status === stage 
                                                    ? 'text-green-600 font-medium' 
                                                    : ''
                                            }`}
                                        >
                                            {stage}
                                        </div>
                                    ))}
                                </div>
                                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
                                        style={{ 
                                            width: `${getStageProgress(deliveryStatuses[index]?.status || '')}%`
                                        }}
                                    />
                                    {/* Stage markers */}
                                    <div className="absolute inset-0 flex justify-between px-[1px]">
                                        {deliveryStages.slice(1).map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-1 h-full ${
                                                    getStageProgress(deliveryStatuses[index]?.status || '') >= ((i + 1) / 3) * 100
                                                        ? 'bg-green-600' 
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-green-600">
                                    {deliveryStatuses[index]?.status || 'Connecting...'}
                                </div>
                                {deliveryStatuses[index]?.estimatedTime && (
                                    <p className="text-sm text-gray-500">
                                        Estimated arrival: {deliveryStatuses[index].estimatedTime}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 