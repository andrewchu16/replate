"use client";
import { useState } from "react";
import type Preferences from "../models/preferences.model";
import DietaryRestrictionsStep from "./components/DietaryRestrictionsStep";
import AllergiesStep from "./components/AllergiesStep";
import CuisinePreferencesStep from "./components/CuisinePreferencesStep";
import BudgetDistanceStep from "./components/BudgetDistanceStep";
import StepTransition from "./components/StepTransition";
import MealDescriptionStep from "./components/MealDescriptionStep";
import { useRouter } from 'next/navigation';

export default function UserPreferences() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Partial<Preferences>>({
    allergies: [],
    cuisine: [],
    dietaryRestrictions: [],
    budget: 0,
    maxDistance: 5,
    mealDescription: '',
  });

  const updatePreferences = (
    key: keyof Preferences,
    value: Preferences[keyof Preferences]
  ) => {
    setPreferences((prev: Partial<Preferences>) => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepTransition>
            <DietaryRestrictionsStep
              preferences={preferences}
              updatePreferences={updatePreferences}
            />
          </StepTransition>
        );
      case 2:
        return (
          <StepTransition>
            <AllergiesStep
              preferences={preferences}
              updatePreferences={updatePreferences}
            />
          </StepTransition>
        );
      case 3:
        return (
          <StepTransition>
            <CuisinePreferencesStep
              preferences={preferences}
              updatePreferences={updatePreferences}
            />
          </StepTransition>
        );
      case 4:
        return (
          <StepTransition>
            <BudgetDistanceStep
              preferences={preferences}
              updatePreferences={updatePreferences}
            />
          </StepTransition>
        );
      case 5:
        return (
          <StepTransition>
            <MealDescriptionStep
              preferences={preferences}
              updatePreferences={updatePreferences}
            />
          </StepTransition>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/get-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        router.push('/meal-plan');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to get meal plan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Creating your meal plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col p-4">
        <div className="max-w-md w-full mx-auto flex flex-col flex-1">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-sm underline mt-2 text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                Try again
              </button>
            </div>
          )}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Your Preferences</h1>
              <div className="text-sm text-gray-500">Step {step} of 5</div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 mb-8">
              {renderStep()}
            </div>

            <div className="flex justify-between mt-auto">
              <button
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  step === 1 
                    ? "invisible" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (step < 5) {
                    setStep((prev) => prev + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg transition-colors duration-200
                  ${isLoading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
              >
                {step === 5 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
