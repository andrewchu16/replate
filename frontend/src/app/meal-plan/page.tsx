'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type MealItem from '../../models/mealItem.model';

export default function MealPlan() {
    const router = useRouter();
    const [mealPlan, setMealPlan] = useState<MealItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Get the meal plan data from local storage
            const storedMealPlan = localStorage.getItem('mealPlan');
            if (storedMealPlan) {
                const parsedMealPlan = JSON.parse(storedMealPlan);
                setMealPlan(parsedMealPlan);
                // Clear the stored data after retrieving it
                sessionStorage.removeItem('mealPlan');
            } else {
                setError('No meal plan found. Please create one from the preferences page.');
            }
        } catch (err) {
            setError('Failed to load meal plan. Please try again.');
        }
    }, []);

    const totalCost = mealPlan.reduce((sum, meal) => sum + meal.price, 0);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    if (mealPlan.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center text-gray-600">
                    No meal plan found. Please create one from the preferences page.
                </div>
            </div>
        );
    }

    const handleOrder = async () => {
        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ meals: mealPlan }),
            });

            if (!response.ok) {
                throw new Error('Failed to place order');
            }

            localStorage.setItem('orderedMealPlan', JSON.stringify(mealPlan));
            router.push('/delivery-status');
        } catch (error) {
            setError('Failed to place order. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-white p-4">
            <div className="max-w-4xl mx-auto pb-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Your Meal Plan</h1>
                    <div className="text-lg font-semibold text-gray-700">
                        Total: ${totalCost.toFixed(2)}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {mealPlan.map((meal, index) => (
                        <div 
                            key={index}
                            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="relative w-full h-48">
                                <Image 
                                    src={meal.imgUrl} 
                                    alt={meal.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <h2 className="font-semibold text-lg mb-2">{meal.name}</h2>
                                <p className="text-gray-600 mb-1">{meal.storeName}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-green-600 font-medium">
                                        ${meal.price.toFixed(2)}
                                    </span>
                                    <div className="text-sm text-gray-500">
                                        <span className="mr-2">⭐ {meal.rating}</span>
                                        <span>{meal.distance.toFixed(1)} km</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="text-lg font-semibold">
                        Total Cost: ${totalCost.toFixed(2)}
                    </div>
                    <button
                        onClick={handleOrder}
                        className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                        Order Now
                    </button>
                </div>
            </div>
        </div>
    );
}
