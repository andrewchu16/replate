import Link from 'next/link';
import Image from 'next/image';
import logoImage from "@/app/assets/images/logo.png"
import { TbAmpersand } from "react-icons/tb";
import "./bgPattern.css"


export default function Home() {
  return (
    <div className="bg-pattern min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-lg h-auto space-y-8 p-8 rounded-lg bg-[#f5fff6] shadow-lg">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-6xl font-crazy font-bold text-gray-900">
              replate
            </h1>
            <Image className="hover:scale-110 transition-all" src={logoImage} alt="logo" width={100} height={100} />
          </div>

          <h2 className="text-lg font-nunito text-gray-600">
            Utilizes the Too Good To Go API to deliver personalized, sustainable meal recommendations based on user preferences.
          </h2>

          <div className="flex flex-row space-x-4 items-center">
            <div className="h-auto text-lg font-nunito rounded-lg p-4 shadow-lg max-w-full w-1/2 break-words">
              To help people in a financial crisis.
            </div>
            <TbAmpersand size={48}/>
            <div className="h-auto text-lg font-nunito rounded-lg p-4 shadow-lg max-w-full w-1/2 break-words">
              To minimize food waste.
            </div>
          </div>

          <Link 
            href="/preferences"
            className="block w-full text-xl font-nunito px-6 py-3 rounded-lg bg-[#aedab2] hover:scale-105 
                      text-center transition-transform ease-in-out duration-250">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
