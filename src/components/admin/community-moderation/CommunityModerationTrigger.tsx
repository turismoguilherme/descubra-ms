import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquarePlus } from 'lucide-react';
import CommunityModerationPanel from './CommunityModerationPanel';

const CommunityModerationTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="border-border hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Moderação da Comunidade</h3>
            <p className="text-sm text-muted-foreground mb-3">Revise e gerencie as sugestões dos usuários.</p>
            <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Acessar Moderação
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-6">
        <DialogHeader className="mb-4">
          <DialogTitle>Moderação de Sugestões da Comunidade</DialogTitle>
          <DialogDescription>Revise, aprove e rejeite sugestões de destinos, eventos e melhorias enviadas pelos usuários.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2"> {/* Adicionado overflow e margem para scrollbar */}
          <CommunityModerationPanel onClose={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityModerationTrigger; 