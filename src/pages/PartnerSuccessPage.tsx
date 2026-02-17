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
    let partnerIdToUse = partnerId;
    
    // Validar se partner_id existe e não é o placeholder literal
    const isInvalidPartnerId = !partnerIdToUse || partnerIdToUse === '{PARTNER_ID}' || partnerIdToUse.trim() === '';
    
    if (isInvalidPartnerId) {
      console.warn('⚠️ [PartnerSuccessPage] partner_id inválido ou não fornecido, tentando buscar por email:', partnerId);
      
      // Tentar buscar parceiro pelo email do usuário autenticado
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user?.email) {
          console.log('🔍 [PartnerSuccessPage] Buscando parceiro por email:', user.email);
          
          const { data: partnerData, error: emailError } = await supabase
            .from('institutional_partners')
            .select('id, status, is_active')
            .eq('contact_email', user.email)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (!emailError && partnerData) {
            console.log('✅ [PartnerSuccessPage] Parceiro encontrado por email:', partnerData.id);
            partnerIdToUse = partnerData.id;
          } else {
            console.warn('⚠️ [PartnerSuccessPage] Nenhum parceiro encontrado com email:', user.email);
          }
        } else {
          console.warn('⚠️ [PartnerSuccessPage] Usuário não autenticado ou sem email');
        }
      } catch (emailSearchError) {
        console.error('❌ [PartnerSuccessPage] Erro ao buscar parceiro por email:', emailSearchError);
      }
    }

    // Se ainda não tiver partner_id válido, mostrar como pendente
    if (!partnerIdToUse || partnerIdToUse === '{PARTNER_ID}' || partnerIdToUse.trim() === '') {
      console.warn('⚠️ [PartnerSuccessPage] Não foi possível identificar o parceiro');
      setLoading(false);
      setPartnerStatus('pending');
      return;
    }

    console.log('🔍 [PartnerSuccessPage] Verificando status do parceiro:', { partnerId: partnerIdToUse, sessionId });

    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('status, is_active')
        .eq('id', partnerIdToUse)
        .single();

      if (error) {
        console.error('❌ [PartnerSuccessPage] Erro ao buscar parceiro:', error);
        throw error;
      }

      if (data) {
        console.log('✅ [PartnerSuccessPage] Dados do parceiro encontrados:', data);
        // Verificar se o parceiro está ativo: is_active = true e status = 'approved' (ou similar)
        const isActive = data.is_active && (data.status === 'approved' || data.status === 'active');
        setPartnerStatus(isActive ? 'active' : 'pending');
      } else {
        console.warn('⚠️ [PartnerSuccessPage] Parceiro não encontrado com ID:', partnerIdToUse);
        setPartnerStatus('pending');
      }
    } catch (error) {
      console.error('❌ [PartnerSuccessPage] Erro ao verificar status:', error);
      // Em caso de erro, mostrar como pendente (pode estar processando)
      setPartnerStatus('pending');
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

