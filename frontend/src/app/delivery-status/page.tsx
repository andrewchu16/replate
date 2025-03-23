'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type MealItem from '../../models/mealItem.model';
import { io } from 'socket.io-client';          


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

    useEffect(() => {
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