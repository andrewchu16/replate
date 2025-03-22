import { useState } from 'react';
import type Preferences from '../../../models/preferences.model';
import OtherInput from './OtherInput';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function DietaryRestrictionsStep({ preferences, updatePreferences }: StepProps) {
    const [showOther, setShowOther] = useState(false);
    const [otherValue, setOtherValue] = useState('');
    const options = ['None', 'vegetarian', 'vegan', 'pescetarian', 'flexitarian', 'keto', 'paleo', 'primal', 'whole30', 'Other'];
    
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Dietary Restrictions</h2>
            <p className="text-sm text-gray-600 mb-4">Select any that apply, or select None for no restrictions</p>
            <div className="grid grid-cols-2 gap-2">
                {options.map(diet => (
                    <button
                        key={diet}
                        onClick={() => {
                            const current = preferences.dietaryRestrictions || [];
                            if (diet === 'None') {
                                updatePreferences('dietaryRestrictions', ['None']);
                                setShowOther(false);
                                setOtherValue('');
                            } else if (diet === 'Other') {
                                setShowOther(!showOther);
                                if (!showOther) {
                                    const withoutNone = current.filter(d => d !== 'None');
                                    updatePreferences('dietaryRestrictions', withoutNone);
                                }
                            } else {
                                const withoutNone = current.filter(d => d !== 'None');
                                const updated = withoutNone.includes(diet)
                                    ? withoutNone.filter(d => d !== diet)
                                    : [...withoutNone, diet];
                                updatePreferences('dietaryRestrictions', updated);
                            }
                        }}
                        className={`p-3 rounded-lg text-sm capitalize transition-all duration-200 ${
                            (diet === 'Other' && showOther) || preferences.dietaryRestrictions?.includes(diet)
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        {diet}
                    </button>
                ))}
            </div>
            {showOther && (
                <div className="mt-2">
                    <OtherInput
                        value={otherValue}
                        onChange={(value) => {
                            setOtherValue(value);
                            const current = preferences.dietaryRestrictions || [];
                            const withoutOther = current.filter(d => !d.startsWith('other:'));
                            if (value) {
                                updatePreferences('dietaryRestrictions', [...withoutOther, `other:${value}`]);
                            } else {
                                updatePreferences('dietaryRestrictions', withoutOther);
                            }
                        }}
                        placeholder="Type your dietary restriction..."
                    />
                </div>
            )}
        </div>
    );
} 