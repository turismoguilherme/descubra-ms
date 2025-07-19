import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accessibility } from 'lucide-react';
import AccessibilityPanel from '@/components/accessibility/AccessibilityPanel';

const AccessibilityButton: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      {/* Botão flutuante de acessibilidade */}
      <Button
        onClick={() => setIsPanelOpen(true)}
        className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        aria-label="Abrir painel de acessibilidade"
        title="Acessibilidade"
      >
        <Accessibility className="h-6 w-6" />
      </Button>

      {/* Painel de acessibilidade */}
      <AccessibilityPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </>
  );
};

export default AccessibilityButton; 