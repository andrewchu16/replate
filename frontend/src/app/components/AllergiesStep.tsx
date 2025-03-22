import type Preferences from '../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function AllergiesStep({ preferences, updatePreferences }: StepProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Allergies</h2>
            <div className="grid grid-cols-2 gap-2">
                {['gluten', 'dairy', 'soy', 'peanuts', 'tree nuts', 'eggs', 'fish', 'shellfish'].map(allergy => (
                    <button
                        key={allergy}
                        onClick={() => {
                            const current = preferences.allergies || [];
                            const updated = current.includes(allergy)
                                ? current.filter((a: string) => a !== allergy)
                                : [...current, allergy];
                            updatePreferences('allergies', updated);
                        }}
                        className={`p-3 rounded-lg text-sm capitalize transition-all duration-200 ${
                            preferences.allergies?.includes(allergy)
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        {allergy}
                    </button>
                ))}
            </div>
        </div>
    );
} 