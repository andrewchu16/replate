import { NextResponse } from 'next/server';
import type Preferences from '../../../models/preferences.model';

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

        const domain = process.env.MEAL_SERVICE_DOMAIN;
        const port = process.env.MEAL_SERVICE_PORT;

        if (!domain || !port) {
            throw new Error('Meal service configuration is missing');
        }

        const response = await fetch(`${domain}:${port}/api/get-meal-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
        });


        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || 'Failed to get meal plan' },
                { status: response.status }
            );
        }
        
        const data = await response.json();
        console.log("data: ", data);
        return NextResponse.json(
            { 
                status: 'Meal plan created successfully',
                mealPlan: data.mealPlan
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