import React, { useState } from 'react';
import { ViaJARSection } from '@/components/ui/ViaJARSection';
import { ViaJARMetricCard } from '@/components/ui/ViaJARMetricCard';
import { ViaJARCard } from '@/components/ui/ViaJARCard';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Brain, Target, DollarSign, Users } from 'lucide-react';
import { RevenueOptimizerWidget } from '@/components/private/RevenueOptimizerWidget';
import { MarketIntelligenceWidget } from '@/components/private/MarketIntelligenceWidget';
import { CompetitiveBenchmarkWidget } from '@/components/private/CompetitiveBenchmarkWidget';
import { useNavigate } from 'react-router-dom';

export const PrivateModernDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Visão Geral - Métricas */}
      <ViaJARSection title="Visão Geral do Negócio">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ViaJARMetricCard
            title="Receita Mensal"
            value="R$ 125.4K"
            change={12.5}
            changeLabel="vs. mês anterior"
            icon={<DollarSign className="h-5 w-5" />}
            variant="gradient"
          />
          <ViaJARMetricCard
            title="Taxa de Conversão"
            value="3.2%"
            change={8.3}
            changeLabel="vs. mês anterior"
            icon={<Target className="h-5 w-5" />}
            variant="gradient"
          />
          <ViaJARMetricCard
            title="Visitantes"
            value="2.4K"
            change={15.2}
            changeLabel="vs. mês anterior"
            icon={<Users className="h-5 w-5" />}
            variant="gradient"
          />
          <ViaJARMetricCard
            title="Ticket Médio"
            value="R$ 450"
            change={-2.1}
            changeLabel="vs. mês anterior"
            icon={<TrendingUp className="h-5 w-5" />}
            variant="gradient"
          />
        </div>
      </ViaJARSection>

      {/* Revenue Optimizer */}
      <ViaJARSection 
        title="Revenue Optimizer" 
        description="Otimize sua receita com insights inteligentes"
        icon={<DollarSign />}
      >
        <RevenueOptimizerWidget />
      </ViaJARSection>

      {/* Market Intelligence */}
      <ViaJARSection 
        title="Market Intelligence" 
        description="Análise de mercado e tendências"
        icon={<Brain />}
      >
        <MarketIntelligenceWidget />
      </ViaJARSection>

      {/* Competitive Benchmark */}
      <ViaJARSection 
        title="Competitive Benchmark" 
        description="Compare-se com seus concorrentes"
        icon={<Target />}
      >
        <CompetitiveBenchmarkWidget />
      </ViaJARSection>

      {/* Diagnóstico - Botão discreto */}
      <ViaJARCard className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Diagnóstico Empresarial</h3>
          <p className="text-sm text-muted-foreground">
            Receba insights personalizados sobre seu negócio
          </p>
        </div>
        <Button 
          onClick={() => navigate('/viajar/diagnostic')} 
          className="bg-primary text-primary-foreground"
        >
          <Brain className="h-4 w-4 mr-2" />
          Iniciar Diagnóstico
        </Button>
      </ViaJARCard>
    </div>
  );
};
