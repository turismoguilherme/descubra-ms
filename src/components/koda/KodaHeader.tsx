import React from "react";
import { MapPin, Compass } from "lucide-react";

interface KodaHeaderProps {
  onClearConversation: () => void;
  messages: any[];
}

const KodaHeader = ({ onClearConversation, messages }: KodaHeaderProps) => {
  return (
    <div className="text-center text-white">
      <div className="flex items-center justify-center gap-2 mb-2">
        <MapPin className="w-6 h-6 text-red-400" />
        <h1 className="text-3xl font-bold">Discover Canada</h1>
        <Compass className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-lg text-gray-200">
        Your AI-powered guide to exploring the Great White North
      </p>
      <div className="flex items-center justify-center gap-4 mt-4">
        <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
          🍁 Maple Country
        </span>
        <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
          🏔️ Rocky Mountains
        </span>
        <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
          🌲 Natural Wonders
        </span>
      </div>
    </div>
  );
};

export default KodaHeader;
