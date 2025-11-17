/**
 * Evolution History Component
 * Exibe gráficos de evolução do negócio ao longo do tempo
 */

import React, { useState, useEffect } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { evolutionHistoryService, EvolutionHistory } from '@/services/private/evolutionHistoryService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const EvolutionHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<EvolutionHistory | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user, selectedPeriod]);

  const loadHistory = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await evolutionHistoryService.getEvolutionHistory(user.id, selectedPeriod);
      setHistory(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <SectionWrapper variant="default" title="Histórico de Evolução">
        <CardBox>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  if (!history || history.dataPoints.length === 0) {
    return (
      <SectionWrapper variant="default" title="Histórico de Evolução">
        <CardBox>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2 font-medium">
              Nenhum histórico disponível
            </p>
            <p className="text-sm text-gray-500">
              Complete diagnósticos para ver sua evolução ao longo do tempo.
            </p>
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  // Preparar dados para gráfico
  const chartData = history.dataPoints.map(point => ({
    date: new Date(point.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    score: point.score,
    roi: point.roi,
    crescimento: point.growthPotential
  }));

  return (
    <SectionWrapper
      variant="default"
      title="Histórico de Evolução"
      subtitle="Acompanhe o progresso do seu negócio ao longo do tempo"
      actions={
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="rounded-full text-xs px-3 py-1"
            >
              {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : period === '90d' ? '90 dias' : '1 ano'}
            </Button>
          ))}
        </div>
      }
    >
      {/* Tendências */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CardBox>
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon(history.trends.score)}
            <span className="text-sm font-medium text-slate-600">Score Geral</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {history.dataPoints[history.dataPoints.length - 1]?.score || 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tendência: {history.trends.score === 'up' ? 'Crescendo' : history.trends.score === 'down' ? 'Diminuindo' : 'Estável'}
          </p>
        </CardBox>

        <CardBox>
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon(history.trends.roi)}
            <span className="text-sm font-medium text-slate-600">ROI</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            +{history.dataPoints[history.dataPoints.length - 1]?.roi || 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tendência: {history.trends.roi === 'up' ? 'Crescendo' : history.trends.roi === 'down' ? 'Diminuindo' : 'Estável'}
          </p>
        </CardBox>

        <CardBox>
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon(history.trends.growth)}
            <span className="text-sm font-medium text-slate-600">Crescimento</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {history.dataPoints[history.dataPoints.length - 1]?.growthPotential || 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tendência: {history.trends.growth === 'up' ? 'Crescendo' : history.trends.growth === 'down' ? 'Diminuindo' : 'Estável'}
          </p>
        </CardBox>
      </div>

      {/* Gráfico de Evolução */}
      <CardBox>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Evolução ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'ROI/Crescimento (%)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="score" stroke="#3B82F6" name="Score Geral (%)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#10B981" name="ROI (%)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="crescimento" stroke="#F59E0B" name="Crescimento (%)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardBox>
    </SectionWrapper>
  );
};

export default EvolutionHistory;

