import type Preferences from '../../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function BudgetStep({ preferences, updatePreferences }: StepProps) {
    return (
        <div className="space-y-4 text-center">
            <h2 className="text-6xl font-crazy">Budget</h2>
            <p className="text-xl font-nunito text-black mt-2 p-4">
                How much would you like to spend?
            </p>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <span className="text-6xl">💰</span>
            </div>

            <div className="transition-all duration-200 p-4">
                <label className="block text-xl font-nunito mb-2">
                    Budget per meal (in dollars)
                </label>
                <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={preferences.budget}
                    onChange={(e) => updatePreferences('budget', Number(e.target.value))}
                    className="w-full transition-all duration-200 accent-green-500 hover:accent-green-600"
                />
                <div className="text-center text-xl font-nunito mt-2 transition-all duration-200">
                    ${preferences.budget}
                </div>
            </div>
        </div>
    );
} 