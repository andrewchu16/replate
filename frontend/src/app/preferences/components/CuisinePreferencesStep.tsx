import { useState } from 'react';
import type Preferences from '../../../models/preferences.model';
import OtherInput from './OtherInput';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function CuisinePreferencesStep({ preferences, updatePreferences }: StepProps) {
    const [showOther, setShowOther] = useState(false);
    const [otherValue, setOtherValue] = useState('');
    const options = ['No Preference', 'american', 'asian', 'mexican', 'mediterranean', 'italian', 'french', 'indian', 'japanese', 'Other'];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cuisine Preferences</h2>
            <p className="text-sm text-gray-600 mb-4">Select any that apply, or select No Preference to see all cuisines</p>
            <div className="grid grid-cols-2 gap-2">
                {options.map(cuisine => (
                    <button
                        key={cuisine}
                        onClick={() => {
                            const current = preferences.cuisine || [];
                            if (cuisine === 'No Preference') {
                                updatePreferences('cuisine', ['No Preference']);
                                setShowOther(false);
                                setOtherValue('');
                            } else if (cuisine === 'Other') {
                                setShowOther(!showOther);
                                if (!showOther) {
                                    const withoutNoPreference = current.filter(c => c !== 'No Preference');
                                    updatePreferences('cuisine', withoutNoPreference);
                                }
                            } else {
                                const withoutNoPreference = current.filter(c => c !== 'No Preference');
                                const updated = withoutNoPreference.includes(cuisine)
                                    ? withoutNoPreference.filter(c => c !== cuisine)
                                    : [...withoutNoPreference, cuisine];
                                updatePreferences('cuisine', updated);
                            }
                        }}
                        className={`p-3 rounded-lg text-sm capitalize transition-all duration-200 ${
                            (cuisine === 'Other' && showOther) || preferences.cuisine?.includes(cuisine)
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        {cuisine}
                    </button>
                ))}
            </div>
            {showOther && (
                <div className="mt-2">
                    <OtherInput
                        value={otherValue}
                        onChange={(value) => {
                            setOtherValue(value);
                            const current = preferences.cuisine || [];
                            const withoutOther = current.filter(c => !c.startsWith('other:'));
                            if (value) {
                                updatePreferences('cuisine', [...withoutOther, `other:${value}`]);
                            } else {
                                updatePreferences('cuisine', withoutOther);
                            }
                        }}
                        placeholder="Type your preferred cuisine..."
                    />
                </div>
            )}
        </div>
    );
} 