
import React from "react";
import { Map, Globe } from "lucide-react";

interface HeroSectionProps {
  title: string;
  description: string;
}

const HeroSection = ({ title, description }: HeroSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-ms-rivers-blue to-ms-pantanal-blue py-12">
      <div className="ms-container text-center">
        <div className="flex justify-center mb-4">
          <Map size={38} className="text-white mr-2" />
          <Globe size={38} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-6">{title}</h1>
        <p className="text-white/90 text-xl max-w-3xl mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
