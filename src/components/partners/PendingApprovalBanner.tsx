import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Mail } from 'lucide-react';

interface PendingApprovalBannerProps {
  className?: string;
  /** revision = documento/cadastro devolvido para ajuste; default = fila de aprovação inicial */
  variant?: 'default' | 'revision';
}

export default function PendingApprovalBanner({ className, variant = 'default' }: PendingApprovalBannerProps) {
  const isRevision = variant === 'revision';
  return (
    <Alert className={`${isRevision ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'} ${className || ''}`}>
      <Clock className={`h-5 w-5 ${isRevision ? 'text-orange-700' : 'text-blue-600'}`} />
      <AlertTitle className={`font-semibold ${isRevision ? 'text-orange-900' : 'text-blue-800'}`}>
        {isRevision ? 'Ajuste solicitado pela equipe' : 'Seu cadastro está em análise'}
      </AlertTitle>
      <AlertDescription className={isRevision ? 'text-orange-900' : 'text-blue-700'}>
        <p className="mb-2">
          {isRevision
            ? 'Revise a mensagem acima, corrija o termo ou os dados solicitados e reenvie o PDF assinado. Sua assinatura permanece ativa.'
            : 'Nossa equipe está revisando seu cadastro. Você será notificado por email quando for aprovado para aparecer no Descubra MS.'}
        </p>
        <p className={`text-sm flex items-center gap-1 ${isRevision ? 'text-orange-800' : 'text-blue-600'}`}>
          <Mail className="w-4 h-4" />
          {isRevision ? 'Após o reenvio, seu cadastro volta para a fila de análise.' : 'Aguarde nosso contato em até 48 horas'}
        </p>
      </AlertDescription>
    </Alert>
  );
}

