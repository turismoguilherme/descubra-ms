import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Mail } from 'lucide-react';

interface PendingApprovalBannerProps {
  className?: string;
}

export default function PendingApprovalBanner({ className }: PendingApprovalBannerProps) {
  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className || ''}`}>
      <Clock className="h-5 w-5 text-blue-600" />
      <AlertTitle className="text-blue-800 font-semibold">
        Seu cadastro está em análise
      </AlertTitle>
      <AlertDescription className="text-blue-700">
        <p className="mb-2">
          Nossa equipe está revisando seu cadastro. Você será notificado por email quando for aprovado.
        </p>
        <p className="text-sm flex items-center gap-1 text-blue-600">
          <Mail className="w-4 h-4" />
          Aguarde nosso contato em até 48 horas
        </p>
      </AlertDescription>
    </Alert>
  );
}

