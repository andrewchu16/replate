import { useState } from 'react';
import type Preferences from '../../../models/preferences.model';
import OtherInput from './OtherInput';

interface StepProps {
    preferences: Partial<Preferences>;
    updatePreferences: (key: keyof Preferences, value: Preferences[keyof Preferences]) => void;
}

export default function AllergiesStep({ preferences, updatePreferences }: StepProps) {
    const [showOther, setShowOther] = useState(false);
    const [otherValue, setOtherValue] = useState('');
    const options = ['None', 'gluten', 'dairy', 'soy', 'peanuts', 'tree nuts', 'eggs', 'fish', 'shellfish', 'Other'];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Allergies</h2>
            <p className="text-sm text-gray-600 mb-4">Select any that apply, or select None for no allergies</p>
            <div className="grid grid-cols-2 gap-2">
                {options.map(allergy => (
                    <button
                        key={allergy}
                        onClick={() => {
                            const current = preferences.allergies || [];
                            if (allergy === 'None') {
                                updatePreferences('allergies', ['None']);
                                setShowOther(false);
                                setOtherValue('');
                            } else if (allergy === 'Other') {
                                setShowOther(!showOther);
                                if (!showOther) {
                                    const withoutNone = current.filter(a => a !== 'None');
                                    updatePreferences('allergies', withoutNone);
                                }
                            } else {
                                const withoutNone = current.filter(a => a !== 'None');
                                const updated = withoutNone.includes(allergy)
                                    ? withoutNone.filter(a => a !== allergy)
                                    : [...withoutNone, allergy];
                                updatePreferences('allergies', updated);
                            }
                        }}
                        className={`p-3 rounded-lg text-sm capitalize transition-all duration-200 ${
                            (allergy === 'Other' && showOther) || preferences.allergies?.includes(allergy)
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        {allergy}
                    </button>
                ))}
            </div>
            {showOther && (
                <div className="mt-2">
                    <OtherInput
                        value={otherValue}
                        onChange={(value) => {
                            setOtherValue(value);
                            const current = preferences.allergies || [];
                            const withoutOther = current.filter(a => !a.startsWith('other:'));
                            if (value) {
                                updatePreferences('allergies', [...withoutOther, `other:${value}`]);
                            } else {
                                updatePreferences('allergies', withoutOther);
                            }
                        }}
                        placeholder="Type your allergy..."
                    />
                </div>
            )}
        </div>
    );
} 