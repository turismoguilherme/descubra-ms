// @ts-nocheck
/**
 * Dados Regionais para Setor Público
 * Exibe dados de APIs governamentais (IBGE, INMET, ANTT, Fundtur-MS)
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import {
  Globe, MapPin, Cloud, Truck, TrendingUp, RefreshCw,
  Users, DollarSign, Calendar, AlertCircle, CheckCircle
} from 'lucide-react';
import { publicRegionalDataService, RegionalDataSummary } from '@/services/public/regionalDataService';
import { useToast } from '@/hooks/use-toast';

const RegionalDataComponent: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<RegionalDataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('MS');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    loadRegionalData();
  }, [selectedState, selectedCity]);

  const loadRegionalData = async () => {
    setLoading(true);
    try {
      const summary = await publicRegionalDataService.getRegionalDataSummary(
        selectedCity || undefined,
        selectedState
      );
      setData(summary);
    } catch (error) {
      console.error('Erro ao carregar dados regionais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados regionais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  if (loading) {
    return (
      <SectionWrapper variant="default" title="Dados Regionais" subtitle="Informações de APIs governamentais">
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Carregando dados regionais...</span>
        </div>
      </SectionWrapper>
    );
  }

  if (!data) {
    return (
      <SectionWrapper variant="default" title="Dados Regionais" subtitle="Informações de APIs governamentais">
        <CardBox>
          <div className="text-center p-8 text-slate-500">
            Nenhum dado regional disponível.
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      variant="default"
      title="Dados Regionais"
      subtitle="Informações de APIs governamentais (IBGE, INMET, ANTT, Fundtur-MS)"
      actions={
        <div className="flex gap-3">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
              <SelectItem value="SP">São Paulo</SelectItem>
              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
              <SelectItem value="PR">Paraná</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadRegionalData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* IBGE - Dados Demográficos */}
        <CardBox>
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">IBGE - Dados Demográficos</h3>
            {data.ibge ? (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full bg-green-100 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Disponível
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full bg-red-100 border-red-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                Indisponível
              </Badge>
            )}
          </div>
          {data.ibge ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.ibge.city && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Cidade</p>
                  <p className="text-lg font-semibold text-slate-900">{data.ibge.city}</p>
                </div>
              )}
              {data.ibge.state && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Estado</p>
                  <p className="text-lg font-semibold text-slate-900">{data.ibge.state}</p>
                </div>
              )}
              {data.ibge.region && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Região</p>
                  <p className="text-lg font-semibold text-slate-900">{data.ibge.region}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Dados do IBGE não disponíveis no momento.</p>
          )}
        </CardBox>

        {/* INMET - Dados Climáticos */}
        <CardBox>
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="h-5 w-5 text-cyan-600" />
            <h3 className="text-lg font-semibold text-slate-900">INMET - Dados Climáticos</h3>
            {data.inmet ? (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full bg-green-100 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Disponível
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full bg-red-100 border-red-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                Indisponível
              </Badge>
            )}
          </div>
          {data.inmet ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data.inmet.temperature !== undefined && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Temperatura</p>
                  <p className="text-2xl font-bold text-slate-900">{data.inmet.temperature.toFixed(1)}°C</p>
                </div>
              )}
              {data.inmet.humidity !== undefined && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Umidade</p>
                  <p className="text-2xl font-bold text-slate-900">{data.inmet.humidity.toFixed(0)}%</p>
                </div>
              )}
              {data.inmet.precipitation !== undefined && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Precipitação</p>
                  <p className="text-2xl font-bold text-slate-900">{data.inmet.precipitation.toFixed(1)}mm</p>
                </div>
              )}
              {data.inmet.forecast && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Previsão</p>
                  <p className="text-lg font-semibold text-slate-900">{data.inmet.forecast}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Dados do INMET não disponíveis no momento.</p>
          )}
        </CardBox>

        {/* ANTT - Dados de Transporte */}
        <CardBox>
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-slate-900">ANTT - Condições de Rodovias</h3>
            {data.antt ? (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full bg-green-100 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Disponível
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full bg-red-100 border-red-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                Indisponível
              </Badge>
            )}
          </div>
          {data.antt ? (
            <div className="space-y-3">
              {data.antt.roadConditions && data.antt.roadConditions.length > 0 ? (
                <>
                  <h4 className="font-medium text-slate-900">Condições das Rodovias</h4>
                  <div className="space-y-2">
                    {data.antt.roadConditions.map((condition, index) => (
                      <CardBox key={index} className="bg-slate-50">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <p className="text-sm text-slate-900">{condition}</p>
                        </div>
                      </CardBox>
                    ))}
                  </div>
                </>
              ) : null}
              {data.antt.trafficAlerts && data.antt.trafficAlerts.length > 0 && (
                <>
                  <h4 className="font-medium text-slate-900 mt-4">Alertas de Trânsito</h4>
                  <div className="space-y-2">
                    {data.antt.trafficAlerts.map((alert, index) => (
                      <CardBox key={index} className="bg-yellow-50 border-yellow-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <p className="text-sm text-yellow-900">{alert}</p>
                        </div>
                      </CardBox>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Dados da ANTT não disponíveis no momento.</p>
          )}
        </CardBox>

        {/* Fundtur-MS - Indicadores de Turismo */}
        {data.fundtur && (
          <CardBox>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900">Fundtur-MS - Indicadores de Turismo</h3>
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full bg-green-100 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Disponível
              </Badge>
            </div>
            {data.fundtur.tourismIndicators ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.fundtur.tourismIndicators.visitors !== undefined && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <p className="text-sm font-medium text-slate-600">Visitantes (30 dias)</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatNumber(data.fundtur.tourismIndicators.visitors)}
                    </p>
                  </div>
                )}
                {data.fundtur.tourismIndicators.revenue !== undefined && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <p className="text-sm font-medium text-slate-600">Receita Estimada</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(data.fundtur.tourismIndicators.revenue)}
                    </p>
                  </div>
                )}
                {data.fundtur.tourismIndicators.occupancy !== undefined && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-purple-500" />
                      <p className="text-sm font-medium text-slate-600">Ocupação Estimada</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {data.fundtur.tourismIndicators.occupancy.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Indicadores de turismo não disponíveis.</p>
            )}
          </CardBox>
        )}

        {/* Informações de Atualização */}
        <CardBox className="bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <p className="text-sm text-slate-600">
                Última atualização: {new Date(data.lastUpdate).toLocaleString('pt-BR')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => publicRegionalDataService.clearCache()}>
              Limpar Cache
            </Button>
          </div>
        </CardBox>
      </div>
    </SectionWrapper>
  );
};

export default RegionalDataComponent;

