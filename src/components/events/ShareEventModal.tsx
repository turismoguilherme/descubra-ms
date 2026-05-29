import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, CheckCircle, MessageCircle, Calendar } from 'lucide-react';
import {
  buildEventShareMessage,
  buildEventSharePageUrl,
  type EventShareInput,
} from '@/utils/eventShare';

interface ShareEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShareInput;
}

const ShareEventModal: React.FC<ShareEventModalProps> = ({ isOpen, onClose, event }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = buildEventSharePageUrl(event.id);
  const shareMessage = buildEventShareMessage(event);
  const previewImage = event.logo_evento || event.image_url;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Mensagem e link copiados para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar.',
        variant: 'destructive',
      });
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: shareMessage,
          url: shareUrl,
        });
        return;
      } catch {
        // cancelado pelo usuário
      }
    }
    handleCopyLink();
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Compartilhar evento</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-center rounded-lg border p-3 bg-muted/30">
          {previewImage ? (
            <img
              src={previewImage}
              alt=""
              className="h-14 w-14 rounded-lg object-cover shrink-0 bg-white"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-ms-primary-blue/10 flex items-center justify-center shrink-0">
              <Calendar className="h-7 w-7 text-ms-primary-blue" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm line-clamp-2">{event.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              O link abrirá este evento no Descubra MS
            </p>
          </div>
        </div>

        
        <div className="space-y-4">
          <div>
            <Label htmlFor="eventShareUrl">Link do evento</Label>
            <div className="flex gap-2 mt-1">
              <Input id="eventShareUrl" value={shareUrl} readOnly className="bg-gray-50 text-sm" />
              <Button
                type="button"
                variant={copied ? 'default' : 'outline'}
                onClick={handleCopyLink}
                className={copied ? 'bg-green-600 hover:bg-green-700 shrink-0' : 'shrink-0'}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Ok
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground whitespace-pre-line border rounded-lg p-3 bg-muted/40">
            {shareMessage}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" onClick={handleWebShare} className="bg-ms-primary-blue hover:bg-ms-primary-blue/90">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleWhatsAppShare}
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareEventModal;
