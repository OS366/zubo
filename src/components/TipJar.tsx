import React from "react";
import { Heart } from "lucide-react";

interface TipJarProps {
  qrCodeUrl: string;
}

const TipJar: React.FC<TipJarProps> = ({ qrCodeUrl }) => {
  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border border-purple-500/30 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Support Zubo</h3>
      </div>

      <p className="text-gray-300 mb-4">
        If you're enjoying Zubo and want to support its development, consider
        leaving a tip. Every contribution helps us make the game better!
      </p>

      <div className="flex flex-col items-center">
        <div className="bg-white p-2 rounded-lg mb-3">
          <img src={qrCodeUrl} alt="Tip QR Code" className="w-48 h-48" />
        </div>
        <p className="text-sm text-gray-400 text-center">
          Scan to support Zubo
        </p>
      </div>
    </div>
  );
};

export default TipJar;
