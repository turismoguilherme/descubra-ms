import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VoucherQRCode from './VoucherQRCode';

interface VoucherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherCode: string;
  partnerName?: string | null;
  description?: string | null;
  expiresAt?: string | null;
}

/** Janela em destaque com o QR Code para o parceiro ler no balcão. */
const VoucherModal: React.FC<VoucherModalProps> = ({
  open,
  onOpenChange,
  voucherCode,
  partnerName,
  description,
  expiresAt,
}) => {
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(voucherCode);
      toast({ title: 'Código copiado' });
    } catch {
      toast({ title: 'Não foi possível copiar', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">{partnerName || 'Seu voucher'}</DialogTitle>
          <DialogDescription className="text-center">
            {description || 'Mostre este QR Code no balcão do parceiro.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <VoucherQRCode voucherCode={voucherCode} size={240} />
          <code className="text-2xl font-bold tracking-widest">{voucherCode}</code>
          <Button type="button" variant="outline" onClick={copy} className="w-full">
            <Copy className="mr-2 h-4 w-4" /> Copiar código
          </Button>
          {expiresAt && (
            <p className="text-xs text-muted-foreground">
              Válido até {new Date(expiresAt).toLocaleDateString('pt-BR')}
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            O parceiro lê o QR com a câmera ou digita o código. Cada voucher vale uma vez.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoucherModal;
