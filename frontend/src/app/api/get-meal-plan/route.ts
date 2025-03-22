import { NextResponse } from 'next/server';
import type Preferences from '../../../models/preferences.model';
import type MealItem from '../../../models/mealItem.model';

export async function POST(request: Request) {
    try {
        const preferences: Preferences = await request.json();

        // Validate required fields
        if (!preferences.mealDescription) {
            return NextResponse.json(
                { message: 'Meal description is required' },
                { status: 400 }
            );
        }

        if (!preferences.budget || preferences.budget <= 0) {
            return NextResponse.json(
                { message: 'Valid budget is required' },
                { status: 400 }
            );
        }

        if (!preferences.maxDistance || preferences.maxDistance <= 0) {
            return NextResponse.json(
                { message: 'Valid maximum distance is required' },
                { status: 400 }
            );
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Dummy meal items
        const dummyMealItems: MealItem[] = [
            {
                name: "Spicy Ramen Bowl",
                price: 12.99,
                longitude: preferences.longitude + 0.01,
                latitude: preferences.latitude - 0.01,
                rating: 4.5,
                storeName: "Noodle House",
                imgUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
                distance: 1.2
            },
            {
                name: "Vegetarian Buddha Bowl",
                price: 14.99,
                longitude: preferences.longitude - 0.02,
                latitude: preferences.latitude + 0.02,
                rating: 4.8,
                storeName: "Green Eats",
                imgUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
                distance: 2.1
            },
            {
                name: "Grilled Salmon Plate",
                price: 18.99,
                longitude: preferences.longitude + 0.03,
                latitude: preferences.latitude + 0.01,
                rating: 4.6,
                storeName: "Ocean Fresh",
                imgUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
                distance: 0.8
            }
        ];

        // Return success response with dummy data
        return NextResponse.json(
            { 
                status: 'Meal plan created successfully',
                mealPlan: dummyMealItems
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error processing meal plan request:', error);
        return NextResponse.json(
            { message: 'Failed to process meal plan request' },
            { status: 500 }
        );
    }
} 