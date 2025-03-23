import { useState } from 'react';
import type Preferences from '../../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function CuisinePreferencesStep({ preferences, updatePreferences }: StepProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [otherValue, setOtherValue] = useState('');
    const [showOtherInput, setShowOtherInput] = useState(false);
    
    const cuisineOptions = [
        { id: 'none', icon: '❌', label: 'NONE' },
        { id: 'pizza', icon: '🍕', label: 'PIZZA' },
        { id: 'brunch', icon: '🍳', label: 'BRUNCH' },
        { id: 'fish', icon: '🐟', label: 'FISH' },
        { id: 'burgers', icon: '🍔', label: 'BURGERS' },
        { id: 'vegan', icon: '🌱', label: 'VEGAN' },
        { id: 'meat', icon: '🥩', label: 'MEAT' },
        { id: 'soup', icon: '🥣', label: 'SOUP' },
        { id: 'dessert', icon: '🍰', label: 'DESSERT' },
        { id: 'pasta', icon: '🍝', label: 'PASTA' },
        { id: 'ramen', icon: '🍜', label: 'RAMEN' },
    ];

    const filteredOptions = cuisineOptions.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOtherSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otherValue.trim()) {
            const formattedValue = `other:${otherValue.trim()}`;
            const current = preferences.cuisine || [];
            if (!current.includes(formattedValue)) {
                const withoutNone = current.filter(c => c !== 'none');
                updatePreferences('cuisine', [...withoutNone, formattedValue]);
            }
            setOtherValue('');
            setShowOtherInput(false);
        }
    };

    const customCuisines = (preferences.cuisine || [])
        .filter(item => item.startsWith('other:'))
        .map(item => item.replace('other:', ''));

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-6xl font-crazy w-auto">Food Preferences</h2>
                    <p className="text-xl font-nunito text-black mt-2 p-4">
                        We are sure that you will find your favourites.
                    </p>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                        <span className="text-6xl">🍽️</span>
                    </div>
                </div>
        
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for any food..."
                        className="w-full p-3 pl-10 rounded-lg border-4 border-[#aedab2] focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        🔍
                    </span>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
        
                <div>
                    <h3 className="text-2xl font-nunito mb-3">Cuisines</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            {filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        const current = preferences.cuisine || [];
                                        if (option.id === 'none') {
                                            updatePreferences('cuisine', ['none']);
                                        } else {
                                            const withoutNone = current.filter(c => c !== 'none');
                                            const updated = withoutNone.includes(option.id)
                                                ? withoutNone.filter(c => c !== option.id)
                                                : [...withoutNone, option.id];
                                            updatePreferences('cuisine', updated);
                                        }
                                    }}
                                    className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200
                                        ${preferences.cuisine?.includes(option.id)
                                            ? 'bg-[#aedab2] text-black'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-4xl mb-1">{option.icon}</span>
                                    <span className="text-sm font-nunito">{option.label}</span>
                                </button>
                            ))}
        
                            {/* Custom cuisines */}
                            {customCuisines.map((cuisine) => (
                                <button
                                    key={`other:${cuisine}`}
                                    onClick={() => {
                                        const current = preferences.cuisine || [];
                                        updatePreferences('cuisine',
                                            current.filter(c => c !== `other:${cuisine}`)
                                        );
                                    }}
                                    className="flex flex-col items-center p-3 rounded-lg bg-green-50 text-green-600"
                                >
                                    <span className="text-2xl mb-1">✨</span>
                                    <span className="text-xs font-nunito">{cuisine.toUpperCase()}</span>
                                </button>
                            ))}
        
                            {/* Other button */}
                            <button
                                onClick={() => setShowOtherInput(!showOtherInput)}
                                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200
                                    ${showOtherInput
                                        ? 'bg-green-50 text-green-600'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="text-2xl mb-1">➕</span>
                                <span className="text-xs font-nunito">OTHER</span>
                            </button>
        
                            {/* No results message */}
                            {filteredOptions.length === 0 && !customCuisines.length && (
                                <div className="col-span-4 text-center py-8 text-gray-500">
                                    No cuisines found matching &quot;{searchQuery}&quot;
                                </div>
                            )}
                        </div>
        
                        {/* Other input section - only shown when Other is selected */}
                        {showOtherInput && (
                            <form onSubmit={handleOtherSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={otherValue}
                                    onChange={(e) => setOtherValue(e.target.value)}
                                    placeholder="Add other cuisine..."
                                    className="w-full p-3 pl-10 rounded-lg border-4 border-[#aedab2] focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!otherValue.trim()}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 
                                        ${otherValue.trim() 
                                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Add
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
} 