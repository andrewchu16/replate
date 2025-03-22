import type Preferences from '../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function CuisinePreferencesStep({ preferences, updatePreferences }: StepProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cuisine Preferences</h2>
            <div className="grid grid-cols-2 gap-2">
                {['american', 'asian', 'mexican', 'mediterranean', 'italian', 'french', 'indian', 'japanese'].map(cuisine => (
                    <button
                        key={cuisine}
                        onClick={() => {
                            const current = preferences.cuisine || [];
                            const updated = current.includes(cuisine)
                                ? current.filter((c: string) => c !== cuisine)
                                : [...current, cuisine];
                            updatePreferences('cuisine', updated);
                        }}
                        className={`p-3 rounded-lg text-sm capitalize transition-all duration-200 ${
                            preferences.cuisine?.includes(cuisine)
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        {cuisine}
                    </button>
                ))}
            </div>
        </div>
    );
} 