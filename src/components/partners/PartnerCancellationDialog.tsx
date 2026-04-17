import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { cancelPartnership } from '@/services/partners/partnerCancellationService';
import { useToast } from '@/hooks/use-toast';

interface PartnerCancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  onCancel?: () => void;
}

export const PartnerCancellationDialog: React.FC<PartnerCancellationDialogProps> = ({
  open,
  onOpenChange,
  partnerId,
  partnerName,
  partnerEmail,
  onCancel
}) => {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const result = await cancelPartnership({
        partnerId,
        partnerName,
        partnerEmail,
        reason: reason.trim() || undefined
      });

      if (result.success) {
        if ('payload' in result && result.payload) {
          const { mode, accessUntil, refundNote } = result.payload;

          toast({
            title: 'Cancelamento registrado',
            description:
              mode === 'end_of_period' && accessUntil
                ? `Renovação desativada. Você mantém acesso ao painel até ${new Date(accessUntil).toLocaleDateString('pt-BR')}. Não haverá nova cobrança após esse período.`
                : 'Assinatura encerrada. Quando houver cobrança anterior, foi solicitado reembolso integral da última fatura (conforme Stripe).',
            duration: 8000,
          });
          if (refundNote) {
            toast({
              title: 'Observação sobre reembolso',
              description: refundNote,
              variant: 'default',
              duration: 8000,
            });
          }
        } else {
          toast({
            title: 'Cancelamento registrado',
            description: 'Processamento concluído.',
            duration: 5000,
          });
        }

        // Fazer logout e redirecionar
        setTimeout(() => {
          if (onCancel) onCancel();
          window.location.href = '/descubrams';
        }, 2000);
      } else {
        throw new Error(result.error || 'Erro ao processar cancelamento');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível processar o cancelamento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Cancelar Parceria
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base pt-2 space-y-2">
            <p>
              Se você <strong>ainda não estiver aprovado</strong> no Descubra MS, a assinatura será encerrada e será
              tentado o <strong>reembolso integral</strong> da última fatura paga.
            </p>
            <p>
              Se você <strong>já estiver aprovado</strong> e listado, a renovação será desativada:{' '}
              <strong>sem novas cobranças</strong>, acesso ao painel até o fim do período já pago, e você deixa de
              aparecer na vitrine. Um <strong>reembolso parcial</strong> opcional pode ser aplicado conforme
              configuração do administrador.
            </p>
            <p className="text-amber-800 font-medium">Esta ação não pode ser desfeita pelo painel do parceiro.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="reason" className="text-sm font-medium">
            Motivo do cancelamento (opcional)
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Conte-nos o motivo do cancelamento..."
            className="mt-2 min-h-[100px]"
            rows={4}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              'Confirmar Cancelamento'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
