import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Find Your Perfect Meal
        </h1>
        
        <p className="text-lg text-gray-600">
          Tell us your preferences and we&apos;ll help you discover the perfect meal nearby.
        </p>

        <div className="space-y-4">
          <Link 
            href="/preferences"
            className="block w-full px-6 py-3 rounded-lg bg-green-500 text-white font-medium 
              hover:bg-green-600 transition-colors duration-200"
          >
            Get Started
          </Link>
          
          <p className="text-sm text-gray-500">
            Quick, easy, and personalized to your taste
          </p>
        </div>
      </div>
    </div>
  );
}
