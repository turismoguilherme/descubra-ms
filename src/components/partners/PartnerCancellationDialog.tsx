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
        toast({
          title: 'Cancelamento solicitado',
          description: 'Sua solicitação de cancelamento foi enviada. O administrador será notificado.',
          duration: 5000,
        });

        // Fazer logout e redirecionar
        setTimeout(() => {
          if (onCancel) onCancel();
          window.location.href = '/descubrams';
        }, 2000);
      } else {
        throw new Error(result.error || 'Erro ao processar cancelamento');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível processar o cancelamento',
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
          <AlertDialogDescription className="text-base pt-2">
            Tem certeza que deseja cancelar sua parceria? Esta ação não pode ser desfeita.
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
