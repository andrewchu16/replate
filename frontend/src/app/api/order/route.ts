import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type MealItem from '../../../models/mealItem.model';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const meals: MealItem[] = body.meals;

        if (!meals || !Array.isArray(meals) || meals.length === 0) {
            return NextResponse.json(
                { error: 'Invalid order data' },
                { status: 400 }
            );
        }

        const domain = process.env.MEAL_SERVICE_DOMAIN;
        const port = process.env.MEAL_SERVICE_PORT;

        if (!domain || !port) {
            throw new Error('Order service configuration is missing');
        }

        const response = await fetch(`${domain}:${port}/api/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mealItems: meals }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.message || 'Failed to place order' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Order processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process order' },
            { status: 500 }
        );
    }
} 