interface StepTransitionProps {
    children: React.ReactNode;
}

export default function StepTransition({ children }: StepTransitionProps) {
    return (
        <div 
            className="transform transition-all duration-300 ease-in-out animate-fadeIn"
            style={{
                animation: 'fadeSlideIn 0.3s ease-out'
            }}
        >
            {children}
        </div>
    );
} 