import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const CommunityModerationTrigger = () => {
  const handleModeration = () => {
    console.log('Abrindo painel de moderação da comunidade');
  };

  return (
    <Button 
      onClick={handleModeration}
      className="flex items-center gap-2"
      variant="outline"
    >
      <Shield className="h-4 w-4" />
      Moderação da Comunidade
    </Button>
  );
};

export default CommunityModerationTrigger;