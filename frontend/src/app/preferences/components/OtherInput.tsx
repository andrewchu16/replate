interface OtherInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function OtherInput({ value, onChange, placeholder }: OtherInputProps) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Type here..."}
            className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 
                focus:border-transparent transition-all duration-200 text-sm"
        />
    );
} 