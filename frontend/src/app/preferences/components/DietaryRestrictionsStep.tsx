import { useState } from 'react';
import type Preferences from '../../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function DietaryRestrictionsStep({ preferences, updatePreferences }: StepProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [otherValue, setOtherValue] = useState('');
    const [showOtherInput, setShowOtherInput] = useState(false);
    const dietaryOptions = [
        { id: 'none', icon: '❌', label: 'NONE' },
        { id: 'vegetarian', icon: '🥗', label: 'VEGETARIAN' },
        { id: 'vegan', icon: '🌱', label: 'VEGAN' },
        { id: 'gluten-free', icon: '🌾', label: 'GLUTEN-FREE' },
        { id: 'dairy-free', icon: '🥛', label: 'DAIRY-FREE' },
        { id: 'keto', icon: '🥑', label: 'KETO' },
        { id: 'paleo', icon: '🍖', label: 'PALEO' },
        { id: 'halal', icon: '🌙', label: 'HALAL' },
        { id: 'kosher', icon: '✡️', label: 'KOSHER' },
        { id: 'pescatarian', icon: '🐟', label: 'PESCATARIAN' },
        { id: 'mediterranean', icon: '🫒', label: 'MEDITERRANEAN' },
    ];
    
    const filteredOptions = dietaryOptions.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOtherSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otherValue.trim()) {
            const formattedValue = `other:${otherValue.trim()}`;
            const current = preferences.dietaryRestrictions || [];
            if (!current.includes(formattedValue)) {
                updatePreferences('dietaryRestrictions', [...current, formattedValue]);
            }
            setOtherValue('');
            setShowOtherInput(false);
        }
    };

    const customRestrictions = (preferences.dietaryRestrictions || [])
        .filter(item => item.startsWith('other:'))
        .map(item => item.replace('other:', ''));

    return (
        <div className="space-y-6">
            <div className="text-center">
                
                <h2 className="text-6xl font-crazy w-auto">Dietary Restrictions</h2>
                <p className="text-xl font-nunito text-black mt-2 p-4">
                    Select dietary restrictions
                </p>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                    <span className="text-6xl">🥗</span>
                </div>
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restrictions..."
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
                <h3 className="text-2xl font-nunito mb-3">Restrictions</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        {filteredOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => {
                                    const current = preferences.dietaryRestrictions || [];
                                    if (option.id === 'none') {
                                        updatePreferences('dietaryRestrictions', ['none']);
                                    } else {
                                        const withoutNone = current.filter(d => d !== 'none');
                                        const updated = withoutNone.includes(option.id)
                                            ? withoutNone.filter(d => d !== option.id)
                                            : [...withoutNone, option.id];
                                        updatePreferences('dietaryRestrictions', updated);
                                    }
                                }}
                                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 min-h-[100px]
                                    ${preferences.dietaryRestrictions?.includes(option.id)
                                        ? 'bg-[#aedab2] text-black'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="text-4xl mb-2">{option.icon}</span>
                                <span className="text-sm font-nunito text-center w-full break-words hyphens-auto" 
                                      style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                        
                        {/* Custom restrictions */}
                        {customRestrictions.map((restriction) => (
                            <button
                                key={`other:${restriction}`}
                                onClick={() => {
                                    const current = preferences.dietaryRestrictions || [];
                                    updatePreferences('dietaryRestrictions', 
                                        current.filter(d => d !== `other:${restriction}`)
                                    );
                                }}
                                className="flex flex-col items-center p-3 rounded-lg bg-green-50 text-green-600 min-h-[100px]"
                            >
                                <span className="text-2xl mb-2">✨</span>
                                <span className="text-xs font-nunito text-center w-full break-words hyphens-auto" 
                                      style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
                                    {restriction.toUpperCase()}
                                </span>
                            </button>
                        ))}

                        {/* Other button */}
                        <button
                            onClick={() => setShowOtherInput(!showOtherInput)}
                            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 min-h-[100px]
                                ${showOtherInput
                                    ? 'bg-[#aedab2] text-black'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            <span className="text-4xl mb-2">➕</span>
                            <span className="text-sm font-nunito text-center w-full break-words hyphens-auto" 
                                  style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
                                OTHER
                            </span>
                        </button>

                        {/* No results message */}
                        {filteredOptions.length === 0 && !customRestrictions.length && (
                            <div className="col-span-4 text-center py-8 text-gray-500">
                                No restrictions found matching &quot;{searchQuery}&quot;
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
                                placeholder="Add other dietary restriction..."
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