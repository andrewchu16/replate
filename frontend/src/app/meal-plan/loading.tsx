'use client';
import { useState, useEffect } from 'react';
import loadingMessages from '@/data/loadingMessages';

export default function Loading() {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        // Get a random message excluding the current one
        const getRandomMessage = () => {
            const availableMessages = loadingMessages.filter(msg => msg !== message);
            const randomIndex = Math.floor(Math.random() * availableMessages.length);
            return availableMessages[randomIndex];
        };

        // Set up the interval to change messages
        const intervalId = setInterval(() => {
            setMessage(getRandomMessage());
        }, 4000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [message]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 transition-opacity duration-300">
                    {message}
                </p>
            </div>
        </div>
    );
} 