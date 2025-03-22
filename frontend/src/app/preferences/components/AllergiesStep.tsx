import { useState } from 'react';
import type Preferences from '../../../models/preferences.model';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function AllergiesStep({ preferences, updatePreferences }: StepProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [otherValue, setOtherValue] = useState('');
    const [showOtherInput, setShowOtherInput] = useState(false);
    const allergyOptions = [
        { id: 'peanuts', icon: '🥜', label: 'PEANUTS' },
        { id: 'tree-nuts', icon: '🌰', label: 'TREE NUTS' },
        { id: 'dairy', icon: '🥛', label: 'DAIRY' },
        { id: 'eggs', icon: '🥚', label: 'EGGS' },
        { id: 'soy', icon: '🫘', label: 'SOY' },
        { id: 'wheat', icon: '🌾', label: 'WHEAT' },
        { id: 'fish', icon: '🐟', label: 'FISH' },
        { id: 'shellfish', icon: '🦐', label: 'SHELLFISH' },
        { id: 'sesame', icon: '🫘', label: 'SESAME' },
        { id: 'celery', icon: '🥬', label: 'CELERY' },
        { id: 'sulfites', icon: '🧂', label: 'SULFITES' },
    ];

    const filteredOptions = allergyOptions.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOtherSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otherValue.trim()) {
            const formattedValue = `other:${otherValue.trim()}`;
            const current = preferences.allergies || [];
            if (!current.includes(formattedValue)) {
                updatePreferences('allergies', [...current, formattedValue]);
            }
            setOtherValue('');
            setShowOtherInput(false);
        }
    };

    const customAllergies = (preferences.allergies || [])
        .filter(item => item.startsWith('other:'))
        .map(item => item.replace('other:', ''));

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-semibold">Food Allergies</h2>
                <p className="text-sm text-gray-600 mt-2">
                    Select any food allergies you have
                </p>
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search allergies..."
                    className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <h3 className="text-lg font-medium mb-3">Common Allergies</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        {filteredOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => {
                                    const current = preferences.allergies || [];
                                    const updated = current.includes(option.id)
                                        ? current.filter(a => a !== option.id)
                                        : [...current, option.id];
                                    updatePreferences('allergies', updated);
                                }}
                                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200
                                    ${preferences.allergies?.includes(option.id)
                                        ? 'bg-green-50 text-green-600'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="text-2xl mb-1">{option.icon}</span>
                                <span className="text-xs font-medium">{option.label}</span>
                            </button>
                        ))}
                        
                        {/* Custom allergies */}
                        {customAllergies.map((allergy) => (
                            <button
                                key={`other:${allergy}`}
                                onClick={() => {
                                    const current = preferences.allergies || [];
                                    updatePreferences('allergies', 
                                        current.filter(a => a !== `other:${allergy}`)
                                    );
                                }}
                                className="flex flex-col items-center p-3 rounded-lg bg-green-50 text-green-600"
                            >
                                <span className="text-2xl mb-1">✨</span>
                                <span className="text-xs font-medium">{allergy.toUpperCase()}</span>
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
                            <span className="text-xs font-medium">OTHER</span>
                        </button>

                        {/* No results message */}
                        {filteredOptions.length === 0 && !customAllergies.length && (
                            <div className="col-span-4 text-center py-8 text-gray-500">
                                No allergies found matching &quot;{searchQuery}&quot;
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
                                placeholder="Add other allergy..."
                                className="flex-1 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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