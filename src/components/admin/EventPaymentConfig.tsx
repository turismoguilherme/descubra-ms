/**
 * Componente para configurar Payment Link do Stripe para eventos
 * Permite inserir, editar e validar links de pagamento
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EventPaymentConfigProps {
  eventId: string;
  currentPaymentLink?: string | null;
  paymentStatus?: string | null;
  onUpdate?: () => void;
}

const STRIPE_PAYMENT_LINK_REGEX = /^https:\/\/(buy|checkout)\.stripe\.com\/(test_|)[a-zA-Z0-9]+$/;

export default function EventPaymentConfig({
  eventId,
  currentPaymentLink,
  paymentStatus,
  onUpdate,
}: EventPaymentConfigProps) {
  const [paymentLink, setPaymentLink] = useState(currentPaymentLink || '');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [defaultPaymentLink, setDefaultPaymentLink] = useState<string | null>(null);
  const [loadingDefault, setLoadingDefault] = useState(true);
  const { toast } = useToast();

  // Buscar link padrão ao carregar
  React.useEffect(() => {
    const fetchDefaultLink = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('platform', 'ms')
          .eq('setting_key', 'event_sponsorship_payment_link')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar link padrão:', error);
          return;
        }

        if (data?.setting_value) {
          const linkValue = typeof data.setting_value === 'string' 
            ? data.setting_value 
            : (data.setting_value as any)?.url || data.setting_value;
          setDefaultPaymentLink(linkValue || null);
        }
      } catch (error) {
        console.error('Erro ao buscar link padrão:', error);
      } finally {
        setLoadingDefault(false);
      }
    };

    fetchDefaultLink();
  }, []);

  const validatePaymentLink = (link: string): boolean => {
    if (!link.trim()) {
      setIsValid(null);
      return false;
    }
    const valid = STRIPE_PAYMENT_LINK_REGEX.test(link.trim());
    setIsValid(valid);
    return valid;
  };

  const handleLinkChange = (value: string) => {
    setPaymentLink(value);
    validatePaymentLink(value);
  };

  const handleSave = async () => {
    if (!validatePaymentLink(paymentLink)) {
      toast({
        title: 'Link inválido',
        description: 'Por favor, insira um link válido do Stripe Payment Link',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({ stripe_payment_link_url: paymentLink.trim() || null })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Link salvo',
        description: 'Link de pagamento configurado com sucesso',
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Erro ao salvar link:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o link de pagamento',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast({
        title: 'Link copiado',
        description: 'Link de pagamento copiado para a área de transferência',
      });
    }
  };

  const handleTestLink = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink size={20} />
          Configuração de Pagamento
        </CardTitle>
        <CardDescription>
          Configure o link de pagamento do Stripe para este evento. O link deve ser no formato: https://buy.stripe.com/...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status do pagamento */}
        {paymentStatus && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Status do pagamento:</span>
                <Badge
                  variant={paymentStatus === 'paid' ? 'default' : 'secondary'}
                  className={paymentStatus === 'paid' ? 'bg-green-600' : 'bg-amber-500'}
                >
                  {paymentStatus === 'paid' ? 'Pago' : paymentStatus === 'pending' ? 'Pendente' : paymentStatus}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Indicador de link padrão */}
        {!currentPaymentLink && defaultPaymentLink && !loadingDefault && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Este evento usará o link padrão configurado:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {defaultPaymentLink.substring(0, 40)}...
                </Badge>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Configure um link específico abaixo para sobrescrever o link padrão.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Campo de input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="payment-link">Stripe Payment Link URL</Label>
            {!currentPaymentLink && defaultPaymentLink && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPaymentLink(defaultPaymentLink);
                  validatePaymentLink(defaultPaymentLink);
                }}
                className="text-xs"
              >
                Usar Link Padrão
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              id="payment-link"
              type="url"
              placeholder="https://buy.stripe.com/test_..."
              value={paymentLink}
              onChange={(e) => handleLinkChange(e.target.value)}
              className={isValid === false ? 'border-red-500' : isValid === true ? 'border-green-500' : ''}
            />
            {paymentLink && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Copiar link"
                >
                  <Copy size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleTestLink}
                  title="Testar link"
                >
                  <ExternalLink size={16} />
                </Button>
              </>
            )}
          </div>
          
          {/* Validação visual */}
          {isValid === true && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />
              <span>Link válido</span>
            </div>
          )}
          {isValid === false && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle size={16} />
              <span>Link inválido. Use o formato: https://buy.stripe.com/...</span>
            </div>
          )}
        </div>

        {/* Informações importantes */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Importante:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Configure o Payment Link no Stripe Dashboard com <code>client_reference_id</code> = <code>{'{EVENT_ID}'}</code></li>
              <li>O link deve apontar para o ID do evento atual</li>
              <li>Para alterar o valor, crie um novo Payment Link no Stripe</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Botão de salvar */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !paymentLink.trim() || isValid === false}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Link de Pagamento'
            )}
          </Button>
          {currentPaymentLink && (
            <Button
              variant="outline"
              onClick={async () => {
                setIsSaving(true);
                try {
                  const { error } = await supabase
                    .from('events')
                    .update({ stripe_payment_link_url: null })
                    .eq('id', eventId);

                  if (error) throw error;

                  setPaymentLink('');
                  toast({
                    title: 'Link removido',
                    description: 'Evento agora usará o link padrão (se configurado)',
                  });

                  if (onUpdate) {
                    onUpdate();
                  }
                } catch (error: any) {
                  toast({
                    title: 'Erro',
                    description: error.message || 'Não foi possível remover o link',
                    variant: 'destructive',
                  });
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
            >
              Usar Padrão
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

