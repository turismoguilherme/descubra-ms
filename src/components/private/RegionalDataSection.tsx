/**
 * Regional Data Section Component
 * Seção de dados regionais no dashboard privado
 * Mostra dados de ALUMIA (MS) ou Google Scholar (outros estados)
 */

import React, { useState, useEffect } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Globe
} from 'lucide-react';
import { useBusinessType } from '@/hooks/useBusinessType';
import { useAuth } from '@/hooks/useAuth';
import { regionalDataService, RegionalTourismData } from '@/services/private/regionalDataService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RegionalDataSection: React.FC = () => {
  const { businessType } = useBusinessType();
  const { userProfile } = useAuth();
  const [regionalData, setRegionalData] = useState<RegionalTourismData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userState, setUserState] = useState<string>('MS'); // TODO: Obter do perfil do usuário

  useEffect(() => {
    loadRegionalData();
  }, [userState, businessType]);

  const loadRegionalData = async () => {
    setIsLoading(true);
    try {
      // Detectar estado do usuário (obter do perfil ou usar padrão)
      const state = userProfile?.state || userProfile?.city?.split(',')[1]?.trim() || userState || 'MS';
      
      const data = await regionalDataService.getRegionalData(state, businessType || undefined);
      setRegionalData(data);
    } catch (error) {
      console.error('Erro ao carregar dados regionais:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SectionWrapper
        variant="default"
        title="Dados Regionais"
        subtitle="Carregando informações de turismo da região..."
      >
        <CardBox>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  if (!regionalData) {
    return (
      <SectionWrapper
        variant="default"
        title="Dados Regionais"
        subtitle="Informações de turismo da região"
      >
        <CardBox>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <p className="text-slate-600 mb-2 font-medium">
              Dados regionais não disponíveis
            </p>
            <p className="text-sm text-slate-500">
              Não foi possível carregar dados regionais no momento.
            </p>
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  const isMS = regionalData.state === 'MS' || regionalData.state === 'Mato Grosso do Sul';
  const isAlumia = regionalData.source === 'ALUMIA';
  const isGoogleSearch = regionalData.source === 'GOOGLE_SEARCH';
  
  const sourceBadge = isAlumia 
    ? <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5 bg-green-100 text-green-700">ALUMIA</Badge>
    : isGoogleSearch
    ? <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5 bg-blue-100 text-blue-700">Google Search</Badge>
    : <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5 bg-amber-100 text-amber-700">Não configurado</Badge>;

  return (
    <SectionWrapper
      variant="default"
      title="Dados Regionais"
      subtitle={`Informações de turismo para ${regionalData.state} - ${isAlumia ? 'Dados oficiais ALUMIA' : isGoogleSearch ? 'Google Search API' : 'Não configurado'}`}
      actions={
        <div className="flex items-center gap-2">
          {sourceBadge}
          <Button
            variant="outline"
            size="sm"
            onClick={loadRegionalData}
            className="rounded-full text-xs px-3 py-1"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Cards de métricas principais */}
        {regionalData.data.touristArrivals && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardBox>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-600">Visitantes Anuais</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {regionalData.data.touristArrivals.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-slate-500 mt-1">Fonte: {isAlumia ? 'ALUMIA' : isGoogleSearch ? 'Google Search' : 'N/A'}</p>
            </CardBox>

            {regionalData.data.averageStay && (
              <CardBox>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-slate-600">Permanência Média</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {regionalData.data.averageStay} dias
                </div>
                <p className="text-xs text-slate-500 mt-1">Fonte: {isAlumia ? 'ALUMIA' : isGoogleSearch ? 'Google Search' : 'N/A'}</p>
              </CardBox>
            )}

            {regionalData.data.averageSpending && (
              <CardBox>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-600">Gasto Médio</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  R$ {regionalData.data.averageSpending}
                </div>
                <p className="text-xs text-slate-500 mt-1">Fonte: {isAlumia ? 'ALUMIA' : isGoogleSearch ? 'Google Search' : 'N/A'}</p>
              </CardBox>
            )}
          </div>
        )}

        {/* Gráfico de tendências sazonais */}
        {regionalData.data.seasonalTrends && regionalData.data.seasonalTrends.length > 0 && (
          <CardBox>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Tendências Sazonais</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Distribuição de visitantes ao longo do ano
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData.data.seasonalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="arrivals" fill="#3B82F6" name="Visitantes" />
              </BarChart>
            </ResponsiveContainer>
          </CardBox>
        )}

        {/* Principais destinos */}
        {regionalData.data.topDestinations && regionalData.data.topDestinations.length > 0 && (
          <CardBox>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-800">Principais Destinos</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {regionalData.data.topDestinations.map((destination, index) => (
                <Badge key={index} variant="secondary" className="rounded-full text-xs px-2 py-0.5">
                  {destination}
                </Badge>
              ))}
            </div>
          </CardBox>
        )}

        {/* Insights de mercado */}
        {regionalData.data.marketInsights && regionalData.data.marketInsights.length > 0 && (
          <CardBox>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-800">Insights de Mercado</h3>
            </div>
            <div className="space-y-3">
              {regionalData.data.marketInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">{insight}</p>
                </div>
              ))}
            </div>
          </CardBox>
        )}

        {/* Informação sobre fonte */}
        <CardBox className="border-slate-200 bg-slate-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-800 mb-1">
                Fonte dos Dados
              </p>
              <p className="text-sm text-slate-600">
                {isAlumia 
                  ? 'Dados oficiais da ALUMIA - Plataforma do Governo de Mato Grosso do Sul. Atualizados em tempo real.'
                  : isGoogleSearch
                  ? 'Dados baseados em Google Search API. Não são dados oficiais. Para informações oficiais, consulte as fontes governamentais do seu estado.'
                  : regionalData.statusMessage || 'Configure ALUMIA (se for MS) ou Google Search API para ver dados regionais.'}
              </p>
              {!regionalData.isConfigured && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-900 mb-1">⚠️ Configuração necessária</p>
                  <p className="text-xs text-amber-700">
                    {isMS 
                      ? 'Configure VITE_ALUMIA_API_KEY e VITE_ALUMIA_BASE_URL para usar dados oficiais da ALUMIA.'
                      : 'Configure VITE_GOOGLE_SEARCH_API_KEY e VITE_GOOGLE_SEARCH_ENGINE_ID para buscar dados regionais.'}
                  </p>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Última atualização: {regionalData.lastUpdate.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardBox>
      </div>
    </SectionWrapper>
  );
};

export default RegionalDataSection;

