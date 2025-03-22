import type Preferences from '../../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function CuisinePreferencesStep({ preferences, updatePreferences }: StepProps) {
    const cuisineOptions = [
        { id: 'pizza', icon: '🍕', label: 'PIZZA' },
        { id: 'brunch', icon: '🍳', label: 'BRUNCH' },
        { id: 'cocktail', icon: '🍸', label: 'COCKTAIL' },
        { id: 'fish', icon: '🐟', label: 'FISH' },
        { id: 'burgers', icon: '🍔', label: 'BURGERS' },
        { id: 'wine', icon: '🍷', label: 'WINE' },
        { id: 'vegan', icon: '🌱', label: 'VEGAN' },
        { id: 'meat', icon: '🥩', label: 'MEAT' },
        { id: 'soup', icon: '🥣', label: 'SOUP' },
        { id: 'dessert', icon: '🍰', label: 'DESSERT' },
        { id: 'pasta', icon: '🍝', label: 'PASTA' },
        { id: 'ramen', icon: '🍜', label: 'RAMEN' },
    ];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                </div>
                <h2 className="text-xl font-semibold">Food Preferences</h2>
                <p className="text-sm text-gray-600 mt-2">
                    We are sure that you will find your favourites.
                </p>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for any food..."
                    className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                </span>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-3">Cuisines</h3>
                <div className="grid grid-cols-4 gap-4">
                    {cuisineOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => {
                                const current = preferences.cuisine || [];
                                const updated = current.includes(option.id)
                                    ? current.filter(c => c !== option.id)
                                    : [...current, option.id];
                                updatePreferences('cuisine', updated);
                            }}
                            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200
                                ${preferences.cuisine?.includes(option.id)
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            <span className="text-2xl mb-1">{option.icon}</span>
                            <span className="text-xs font-medium">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
} 