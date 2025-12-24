import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface StripeConnectStatusProps {
  partnerId: string;
  compact?: boolean;
}

export default function StripeConnectStatus({ partnerId, compact = false }: StripeConnectStatusProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'connected' | 'restricted' | 'disabled'>('pending');
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, [partnerId]);

  const loadStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('stripe_account_id, stripe_connect_status')
        .eq('id', partnerId)
        .single();

      if (error) {
        console.error('Erro ao carregar status:', error);
        return;
      }

      if (data) {
        setStatus(data.stripe_connect_status || 'pending');
        setStripeAccountId(data.stripe_account_id);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      const { data: partnerData } = await supabase
        .from('institutional_partners')
        .select('name, contact_email')
        .eq('id', partnerId)
        .single();

      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
        body: {
          partnerId,
          partnerEmail: partnerData?.contact_email || '',
          partnerName: partnerData?.name || '',
          returnUrl: `${window.location.origin}/partner/dashboard?stripe_connect=success`,
          refreshUrl: `${window.location.origin}/partner/dashboard?stripe_connect=refresh`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Erro ao conectar Stripe:', error);
      toast({
        title: 'Erro ao conectar',
        description: error.message || 'Não foi possível conectar com o Stripe.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Versão compacta para o header do dashboard
  if (compact) {
    if (status === 'connected') {
      return (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span className="hidden sm:inline">Stripe Conectado</span>
        </div>
      );
    }

    return (
      <Button
        size="sm"
        onClick={handleConnectStripe}
        disabled={loading}
        className="bg-[#635BFF] hover:bg-[#5851DB] text-white text-xs"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Conectar Stripe</span>
          </>
        )}
      </Button>
    );
  }

  // Versão completa para a aba de configurações
  const statusConfig = {
    pending: {
      icon: AlertCircle,
      title: 'Conta Stripe não conectada',
      description: 'Conecte sua conta Stripe para receber pagamentos de reservas diretamente.',
      color: 'amber',
      bgClass: 'border-amber-200 bg-amber-50',
      iconClass: 'text-amber-600',
      titleClass: 'text-amber-800',
      descClass: 'text-amber-700',
    },
    connected: {
      icon: CheckCircle2,
      title: 'Conta Stripe conectada',
      description: 'Sua conta está configurada e você pode receber pagamentos de reservas.',
      color: 'green',
      bgClass: 'border-green-200 bg-green-50',
      iconClass: 'text-green-600',
      titleClass: 'text-green-800',
      descClass: 'text-green-700',
    },
    restricted: {
      icon: AlertTriangle,
      title: 'Conta Stripe com restrições',
      description: 'Sua conta precisa de informações adicionais. Complete o onboarding no Stripe.',
      color: 'orange',
      bgClass: 'border-orange-200 bg-orange-50',
      iconClass: 'text-orange-600',
      titleClass: 'text-orange-800',
      descClass: 'text-orange-700',
    },
    disabled: {
      icon: XCircle,
      title: 'Conta Stripe desabilitada',
      description: 'Sua conta foi desabilitada pelo Stripe. Entre em contato com o suporte.',
      color: 'red',
      bgClass: 'border-red-200 bg-red-50',
      iconClass: 'text-red-600',
      titleClass: 'text-red-800',
      descClass: 'text-red-700',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="pt-6">
        <Alert className={config.bgClass}>
          <Icon className={`h-5 w-5 ${config.iconClass}`} />
          <AlertTitle className={config.titleClass}>{config.title}</AlertTitle>
          <AlertDescription className={config.descClass}>
            {config.description}
            {stripeAccountId && (
              <>
                <br />
                <span className="text-xs opacity-70">ID: {stripeAccountId}</span>
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex flex-wrap gap-3">
          {status !== 'connected' && (
            <Button
              onClick={handleConnectStripe}
              disabled={loading}
              className="bg-[#635BFF] hover:bg-[#5851DB] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {status === 'pending' ? 'Conectar com Stripe' : 'Completar Configuração'}
                </>
              )}
            </Button>
          )}

          {status === 'connected' && (
            <Button
              variant="outline"
              onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar Dashboard Stripe
            </Button>
          )}
        </div>

        {status !== 'connected' && (
          <p className="text-xs text-gray-500 mt-4">
            Você será redirecionado para o Stripe para completar a configuração.
            Após conectar, você poderá receber pagamentos de reservas diretamente na sua conta.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

