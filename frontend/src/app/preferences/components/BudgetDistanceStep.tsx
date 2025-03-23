import type Preferences from '../../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function BudgetDistanceStep({ preferences, updatePreferences }: StepProps) {
    return (
        <div className="space-y-4 text-center">
            <h2 className="text-6xl font-crazy">Budget & Distance</h2>
            <div className="space-y-6">
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
                <div className="transition-all duration-200 p-4">
                    <label className="block text-xl font-nunito mb-2">
                        Maximum distance (in km)
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={preferences.maxDistance}
                        onChange={(e) => updatePreferences('maxDistance', Number(e.target.value))}
                        className="w-full transition-all duration-200 accent-green-500 hover:accent-green-600"
                    />
                    <div className="text-center text-xl font-nunito mt-2 transition-all duration-200">
                        {preferences.maxDistance} km
                    </div>
                </div>
            </div>
        </div>
    );
} 