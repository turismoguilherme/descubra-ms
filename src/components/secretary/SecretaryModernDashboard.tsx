// @ts-nocheck
import React from 'react';
import { ViaJARSection } from '@/components/ui/ViaJARSection';
import { ViaJARMetricCard } from '@/components/ui/ViaJARMetricCard';
import { MapPin, Calendar, BarChart3, Globe, Map, Building2, FileText } from 'lucide-react';
import TourismInventoryManager from '@/components/secretary/TourismInventoryManager';
import EventManagementSystem from '@/components/secretary/EventManagementSystem';
import AdvancedAnalytics from '@/components/secretary/AdvancedAnalytics';
import RegionalData from '@/components/secretary/RegionalData';
import CATGeolocationManager from '@/components/overflow-one/CATGeolocationManager';
import ReportGenerator from '@/components/secretary/ReportGenerator';

export const SecretaryModernDashboard: React.FC = () => {

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Visão Geral - Métricas */}
      <ViaJARSection title="Visão Geral" description="Panorama do turismo da sua região">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ViaJARMetricCard
            title="Visitantes no CAT"
            value={2450}
            change={12.3}
            changeLabel="vs. mês anterior"
            icon={<MapPin className="h-5 w-5" />}
            variant="gradient"
          />
          <ViaJARMetricCard
            title="Eventos Ativos"
            value={18}
            change={5.2}
            changeLabel="vs. mês anterior"
            icon={<Calendar className="h-5 w-5" />}
            variant="gradient"
          />
          <ViaJARMetricCard
            title="Atrativos Turísticos"
            value={156}
            icon={<Map className="h-5 w-5" />}
            variant="gradient"
          />
          <ViaJARMetricCard
            title="CATs Ativos"
            value={4}
            icon={<Building2 className="h-5 w-5" />}
            variant="gradient"
          />
        </div>
      </ViaJARSection>

      {/* Inventário Turístico */}
      <ViaJARSection 
        title="Inventário Turístico" 
        description="Cadastro e gestão de atrativos turísticos"
        icon={<MapPin />}
      >
        <TourismInventoryManager />
      </ViaJARSection>

      {/* Gestão de Eventos */}
      <ViaJARSection 
        title="Gestão de Eventos" 
        description="Calendário e controle de eventos turísticos"
        icon={<Calendar />}
      >
        <EventManagementSystem />
      </ViaJARSection>

      {/* Analytics */}
      <ViaJARSection 
        title="Analytics" 
        description="Análise de dados e tendências"
        icon={<BarChart3 />}
      >
        <AdvancedAnalytics />
      </ViaJARSection>

      {/* Dados Regionais */}
      <ViaJARSection 
        title="Dados Regionais" 
        description="Informações e estatísticas da região"
        icon={<Globe />}
      >
        <RegionalData />
      </ViaJARSection>

      {/* Mapa de Calor */}
      <ViaJARSection 
        title="Mapa de Calor" 
        description="Visualização geográfica do fluxo turístico"
        icon={<Map />}
      >
        <div className="text-center py-12 text-gray-500">
          <Map className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Mapas de Calor</p>
          <p className="text-sm">Funcionalidade em desenvolvimento</p>
        </div>
      </ViaJARSection>

      {/* Gestão de CATs */}
      <ViaJARSection 
        title="Gestão de CATs" 
        description="Monitoramento dos Centros de Atendimento ao Turista"
        icon={<Building2 />}
      >
        <CATGeolocationManager />
      </ViaJARSection>

      {/* Relatórios */}
      <ViaJARSection 
        title="Relatórios" 
        description="Exportação e compartilhamento de dados"
        icon={<FileText />}
      >
        <ReportGenerator />
      </ViaJARSection>
    </div>
  );
};
