// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function PartnerSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [partnerStatus, setPartnerStatus] = useState<'active' | 'pending' | null>(null);
  const sessionId = searchParams.get('session_id');
  const partnerId = searchParams.get('partner_id');

  useEffect(() => {
    checkPartnerStatus();
  }, [partnerId]);

  const checkPartnerStatus = async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('status, is_active, subscription_status')
        .eq('id', partnerId)
        .single();

      if (error) throw error;

      if (data) {
        const isActive = data.is_active && (data.subscription_status === 'active' || data.subscription_status === 'trialing');
        setPartnerStatus(isActive ? 'active' : 'pending');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-ms-primary-blue mx-auto mb-4" />
            <p className="text-gray-600">Verificando pagamento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardContent className="pt-6 text-center">
          {partnerStatus === 'active' ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold text-green-800 mb-2">
                🎉 Parabéns!
              </CardTitle>
              <p className="text-gray-600 mb-6">
                Seu pagamento foi processado com sucesso. Você é agora um parceiro ativo do Descubra MS!
              </p>
              <Button
                onClick={() => navigate('/partner/dashboard')}
                className="w-full bg-ms-primary-blue hover:bg-ms-discovery-teal text-white"
                size="lg"
              >
                Acessar Dashboard
              </Button>
            </>
          ) : (
            <>
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                Pagamento em processamento
              </CardTitle>
              <p className="text-gray-600 mb-6">
                Seu pagamento está sendo processado. Você receberá um email de confirmação em breve.
              </p>
              <Button
                onClick={() => navigate('/descubrams')}
                variant="outline"
                className="w-full"
              >
                Voltar ao site
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

