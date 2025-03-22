import type Preferences from '../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function MealDescriptionStep({ preferences, updatePreferences }: StepProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Describe Your Meal</h2>
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Tell us what kind of meal you&apos;re looking for. For example:
                    &quot;I want something warm and soupy for dinner&quot; or
                    &quot;I need a quick healthy lunch&quot;
                </p>
                <textarea
                    value={preferences.mealDescription || ''}
                    onChange={(e) => updatePreferences('mealDescription', e.target.value)}
                    placeholder="Describe your perfect meal..."
                    className="w-full h-32 p-3 rounded-lg border border-gray-200 
                        focus:ring-2 focus:ring-green-500 focus:border-transparent
                        transition-all duration-200 resize-none"
                />
            </div>
        </div>
    );
} 