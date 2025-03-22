import type Preferences from '../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function DietaryRestrictionsStep({ preferences, updatePreferences }: StepProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Dietary Restrictions</h2>
            <div className="grid grid-cols-2 gap-2">
                {['vegetarian', 'vegan', 'pescetarian', 'flexitarian', 'keto', 'paleo', 'primal', 'whole30'].map(diet => (
                    <button
                        key={diet}
                        onClick={() => {
                            const current = preferences.dietaryRestrictions || [];
                            const updated = current.includes(diet)
                                ? current.filter((d: string) => d !== diet)
                                : [...current, diet];
                            updatePreferences('dietaryRestrictions', updated);
                        }}
                        className={`p-3 rounded-lg text-sm capitalize transition-all duration-200 ${
                            preferences.dietaryRestrictions?.includes(diet)
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        {diet}
                    </button>
                ))}
            </div>
        </div>
    );
} 