"use client";
import { useState } from "react";
import type Preferences from "../../models/preferences.model";
import DietaryRestrictionsStep from "./components/DietaryRestrictionsStep";
import AllergiesStep from "./components/AllergiesStep";
import CuisinePreferencesStep from "./components/CuisinePreferencesStep";
import BudgetDistanceStep from "./components/BudgetDistanceStep";
import StepTransition from "./components/StepTransition";
import MealDescriptionStep from "./components/MealDescriptionStep";
import { useRouter } from "next/navigation";
import "../bgPattern.css"

export default function UserPreferences() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    allergies: [],
    cuisine: [],
    dietaryRestrictions: [],
    budget: 0,
    maxDistance: 5,
    mealDescription: "",
    latitude: 0,
    longitude: 0,
  });

  const updatePreferences = (
    key: keyof Preferences,
    value: Preferences[keyof Preferences]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
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
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const preferencesWithLocation = {
        ...preferences,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const response = await fetch('/api/get-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencesWithLocation),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('mealPlan', JSON.stringify(data.mealPlan));
        router.push('/meal-plan');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to get meal plan');
      }
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to access location. Please enable location services and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          preferences.dietaryRestrictions.length > 0 &&
          !preferences.dietaryRestrictions.some(
            (d) => d.startsWith("other:") && d === "other:"
          )
        );
      case 2:
        return (
          preferences.allergies.length > 0 &&
          !preferences.allergies.some(
            (a) => a.startsWith("other:") && a === "other:"
          )
        );
      case 3:
        return (
          preferences.cuisine.length > 0 &&
          !preferences.cuisine.some(
            (c) => c.startsWith("other:") && c === "other:"
          )
        );
      case 4:
        return preferences.budget > 0 && preferences.maxDistance > 0;
      case 5:
        return preferences.mealDescription.trim().length > 0;
      default:
        return false;
    }
  };

  const NUM_STEPS = 5;

  if (isLoading) {
    return (
      <div className="bg-pattern min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Creating your meal plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pattern min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col p-4">
        <div className="max-w-md w-full mx-auto flex flex-col flex-1">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  if (step === NUM_STEPS) {
                    handleSubmit(); // Retry submission if on last step
                  }
                }}
                className="text-sm underline mt-2 text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                Try again
              </button>
            </div>
          )}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="w-8" />
              <div className="flex items-center space-x-1">
                {Array(5).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      i + 1 === step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-blue-500 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 mb-8">{renderStep()}</div>

            <div className="flex justify-between mt-auto">
              <button
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  step === 1 ? "invisible" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (step < NUM_STEPS) {
                    setStep((prev) => prev + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={!isStepValid() || isLoading}
                className={`px-6 py-2 rounded-lg transition-colors duration-200
                  ${
                    !isStepValid() || isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
              >
                {step === NUM_STEPS ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
