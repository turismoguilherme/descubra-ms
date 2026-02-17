import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  PartyPopper, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Camera,
  DollarSign,
  Clock
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  hasStripeConnected?: boolean;
}

export default function WelcomeModal({ 
  isOpen, 
  onClose, 
  partnerName,
  hasStripeConnected = true 
}: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="text-center flex-shrink-0">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal p-4 rounded-full">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Bem-vindo ao Descubra Mato Grosso do Sul!
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Olá, <span className="font-semibold text-gray-700">{partnerName}</span>!
            <br />
            Seu cadastro foi recebido com sucesso!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Status checklist */}
          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Conta criada</span>
            </div>
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Pagamento confirmado</span>
            </div>
            {hasStripeConnected ? (
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Stripe Connect configurado</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-amber-700">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Stripe Connect pendente</span>
              </div>
            )}
          </div>

          {/* Próximos passos */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-ms-primary-blue mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Próximos passos
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-ms-primary-blue mt-0.5 flex-shrink-0" />
                <span>Explore o dashboard e configure seu negócio</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-ms-primary-blue mt-0.5 flex-shrink-0" />
                <span>Nossa equipe entrará em contato em até 48h</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-ms-primary-blue mt-0.5 flex-shrink-0" />
                <span>Após aprovação, você aparecerá para os turistas</span>
              </li>
            </ul>
          </div>

          {/* Dica */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                <strong>Dica:</strong> Configure seus preços e adicione mais fotos 
                para aumentar suas chances de reservas!
              </span>
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-2 flex-shrink-0 border-t pt-4 mt-4">
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:opacity-90 text-white px-8"
          >
            Começar a Explorar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

