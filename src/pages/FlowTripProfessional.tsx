
import React from 'react';
import FlowTripHeader from '@/components/flowtrip/FlowTripHeader';
import FlowTripHeroSection from '@/components/flowtrip/FlowTripHeroSection';
import FlowTripFeaturesSection from '@/components/flowtrip/FlowTripFeaturesSection';
import FlowTripResultsSection from '@/components/flowtrip/FlowTripResultsSection';
import FlowTripStatesSection from '@/components/flowtrip/FlowTripStatesSection';
import FlowTripFooter from '@/components/flowtrip/FlowTripFooter';

const FlowTripProfessional = () => {
  return (
    <div className="min-h-screen bg-white no-gradients">
      <FlowTripHeader />
      <FlowTripHeroSection />
      <FlowTripFeaturesSection />
      <FlowTripResultsSection />
      <FlowTripStatesSection />
      <FlowTripFooter />
    </div>
  );
};

export default FlowTripProfessional;
