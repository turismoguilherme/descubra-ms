/**
 * Partner Reports Section
 * Seção de relatórios avançados para parceiros
 * Com análises explicativas baseadas em dados reais
 */

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';
import PDFReportButton from '@/components/exports/PDFReportButton';
import { format, subDays, startOfMonth } from 'date-fns';
import { 
  analyzePartnerReport, 
  PartnerReportData,
  AnalysisContext 
} from '@/services/reports/reportAnalysisService';

interface PartnerReservation {
  id: string;
  reservation_code: string;
  reservation_type: string;
  service_name: string;
  reservation_date: string;
  reservation_time?: string;
  guests: number;
  total_amount: number;
  commission_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  special_requests?: string;
  created_at: string;
  confirmed_at?: string;
}

interface Partner {
  id: string;
  name: string;
  contact_email: string;
  subscription_status: string;
  monthly_fee: number;
  commission_rate: number;
}

interface PartnerReportsSectionProps {
  partner: Partner;
  reservations: PartnerReservation[];
  previousPeriodReservations?: PartnerReservation[];
}

export default function PartnerReportsSection({ 
  partner, 
  reservations,
  previousPeriodReservations = []
}: PartnerReportsSectionProps) {
  // Segmentar reservas por status
  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const completedReservations = reservations.filter(r => r.status === 'completed');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled' || r.status === 'rejected');

  // Calcular métricas financeiras
  const totalRevenue = completedReservations.reduce((sum, r) => sum + r.total_amount, 0);
  const totalCommissions = completedReservations.reduce((sum, r) => sum + r.commission_amount, 0);
  
  const previousTotalRevenue = previousPeriodReservations
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.total_amount, 0);

  const previousTotalReservations = previousPeriodReservations.length;

  // Calcular ticket médio
  const averageTicket = completedReservations.length > 0 
    ? totalRevenue / completedReservations.length 
    : 0;

  // Calcular taxa de confirmação
  const confirmationRate = reservations.length > 0 
    ? ((confirmedReservations.length + completedReservations.length) / reservations.length) * 100 
    : 0;

  // Calcular tendências
  const calculateTrend = (filterFn: (r: PartnerReservation) => boolean, valueFn: (r: PartnerReservation) => number) => {
    const now = new Date();
    const last7Days = reservations.filter(r => {
      const resDate = new Date(r.created_at);
      const daysDiff = Math.floor((now.getTime() - resDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7 && filterFn(r);
    });
    const previous7Days = reservations.filter(r => {
      const resDate = new Date(r.created_at);
      const daysDiff = Math.floor((now.getTime() - resDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 7 && daysDiff <= 14 && filterFn(r);
    });

    const last7Value = last7Days.reduce((sum, r) => sum + valueFn(r), 0);
    const previous7Value = previous7Days.reduce((sum, r) => sum + valueFn(r), 0);

    if (previous7Value === 0) return last7Value > 0 ? 100 : 0;
    return Math.round(((last7Value - previous7Value) / previous7Value) * 100);
  };

  const reservationsTrend = calculateTrend(() => true, () => 1);
  const revenueTrend = calculateTrend((r) => r.status === 'completed', (r) => r.total_amount);

  // Preparar dados para análise
  const getReportData = (): PartnerReportData => ({
    reservations: {
      total: reservations.length,
      pending: pendingReservations.length,
      confirmed: confirmedReservations.length,
      completed: completedReservations.length,
      cancelled: cancelledReservations.length,
      previousPeriodTotal: previousTotalReservations
    },
    revenue: {
      total: totalRevenue,
      previousPeriod: previousTotalRevenue
    },
    commission: {
      total: totalCommissions,
      rate: partner.commission_rate
    },
    averageTicket: averageTicket
  });

  const getAnalysisContext = (reportType: string): AnalysisContext => ({
    reportType,
    period: { start: subDays(new Date(), 30), end: new Date() },
    generatedBy: partner.name,
    userRole: 'partner'
  });

  // Gerar análises para cada tipo de relatório
  const reservationsAnalysis = useMemo(() => {
    return analyzePartnerReport(getReportData(), getAnalysisContext('partner_reservations'));
  }, [reservations, previousPeriodReservations]);

  const financialAnalysis = useMemo(() => {
    return analyzePartnerReport(getReportData(), getAnalysisContext('partner_financial'));
  }, [reservations, previousPeriodReservations]);

  const performanceAnalysis = useMemo(() => {
    const data = getReportData();
    // Adicionar mais contexto para performance
    return analyzePartnerReport(data, getAnalysisContext('partner_performance'));
  }, [reservations, previousPeriodReservations]);

  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-4">
        Exporte relatórios detalhados do seu negócio em formato PDF, com análises explicativas baseadas nos seus dados reais.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Relatório de Reservas */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Relatório de Reservas</h3>
                <p className="text-sm text-gray-600">Últimos 30 dias</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Total de reservas:</div>
              <div className="text-2xl font-bold text-blue-600">{reservations.length}</div>
              {reservationsTrend !== 0 && (
                <div className={`text-xs ${reservationsTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reservationsTrend > 0 ? '+' : ''}{reservationsTrend}% vs semana anterior
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              Inclui resumo executivo, insights e recomendações
            </div>
            <PDFReportButton
              reportType="partner_reservations"
              config={{
                title: 'Relatório de Reservas',
                period: { start: subDays(new Date(), 30), end: new Date() },
                customFields: [
                  { label: 'Parceiro', value: partner.name },
                  { label: 'Total de Reservas', value: reservations.length },
                  { label: 'Pendentes', value: pendingReservations.length },
                  { label: 'Confirmadas', value: confirmedReservations.length },
                  { label: 'Concluídas', value: completedReservations.length }
                ],
                tableData: {
                  headers: ['Código', 'Data', 'Serviço', 'Hóspedes', 'Valor', 'Status'],
                  rows: reservations.map(r => [
                    r.reservation_code,
                    format(new Date(r.reservation_date), 'dd/MM/yyyy'),
                    r.service_name,
                    r.guests,
                    `R$ ${r.total_amount.toFixed(2)}`,
                    r.status === 'pending' ? 'Pendente' : 
                    r.status === 'confirmed' ? 'Confirmada' : 
                    r.status === 'completed' ? 'Concluída' : 'Cancelada'
                  ])
                },
                analysis: reservationsAnalysis
              }}
              label="Gerar Relatório PDF"
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            />
          </CardContent>
        </Card>

        {/* Relatório Financeiro */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Relatório Financeiro</h3>
                <p className="text-sm text-gray-600">Resumo do mês</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Receita total:</div>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              {revenueTrend !== 0 && (
                <div className={`text-xs ${revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueTrend > 0 ? '+' : ''}{revenueTrend}% vs semana anterior
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              Análise detalhada de receitas e comissões
            </div>
            <PDFReportButton
              reportType="partner_financial"
              config={{
                title: 'Relatório Financeiro',
                period: { start: startOfMonth(new Date()), end: new Date() },
                customFields: [
                  { label: 'Parceiro', value: partner.name },
                  { label: 'Receita Bruta', value: `R$ ${totalRevenue.toFixed(2)}` },
                  { label: 'Comissões', value: `R$ ${totalCommissions.toFixed(2)}` },
                  { label: 'Receita Líquida', value: `R$ ${(totalRevenue - totalCommissions).toFixed(2)}` },
                  { label: 'Taxa de Comissão', value: `${partner.commission_rate}%` }
                ],
                tableData: {
                  headers: ['Código', 'Data', 'Valor Bruto', 'Comissão', 'Valor Líquido'],
                  rows: completedReservations.map(r => [
                    r.reservation_code,
                    format(new Date(r.reservation_date), 'dd/MM/yyyy'),
                    `R$ ${r.total_amount.toFixed(2)}`,
                    `R$ ${r.commission_amount.toFixed(2)}`,
                    `R$ ${(r.total_amount - r.commission_amount).toFixed(2)}`
                  ])
                },
                analysis: financialAnalysis
              }}
              label="Gerar Relatório PDF"
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            />
          </CardContent>
        </Card>

        {/* Relatório de Performance */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Relatório de Performance</h3>
                <p className="text-sm text-gray-600">Análise completa</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Taxa de confirmação:</div>
              <div className="text-2xl font-bold text-purple-600">
                {confirmationRate.toFixed(0)}%
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-3">
              Métricas, tendências e recomendações
            </div>
            <PDFReportButton
              reportType="partner_performance"
              config={{
                title: 'Relatório de Performance',
                period: { start: subDays(new Date(), 30), end: new Date() },
                customFields: [
                  { label: 'Parceiro', value: partner.name },
                  { label: 'Status da Assinatura', value: partner.subscription_status },
                  { label: 'Taxa de Confirmação', value: `${confirmationRate.toFixed(0)}%` },
                  { label: 'Ticket Médio', value: `R$ ${averageTicket.toFixed(2)}` }
                ],
                sections: [
                  {
                    title: 'Métricas de Reservas',
                    content: [
                      `Total de reservas: ${reservations.length}`,
                      `Reservas pendentes: ${pendingReservations.length}`,
                      `Reservas confirmadas: ${confirmedReservations.length}`,
                      `Reservas concluídas: ${completedReservations.length}`,
                      `Reservas canceladas: ${cancelledReservations.length}`
                    ]
                  },
                  {
                    title: 'Métricas Financeiras',
                    content: [
                      `Receita bruta: R$ ${totalRevenue.toFixed(2)}`,
                      `Comissões: R$ ${totalCommissions.toFixed(2)}`,
                      `Receita líquida: R$ ${(totalRevenue - totalCommissions).toFixed(2)}`,
                      `Ticket médio: R$ ${averageTicket.toFixed(2)}`
                    ]
                  },
                  {
                    title: 'Tendências (7 dias)',
                    content: [
                      `Variação de reservas: ${reservationsTrend > 0 ? '+' : ''}${reservationsTrend}%`,
                      `Variação de receita: ${revenueTrend > 0 ? '+' : ''}${revenueTrend}%`
                    ]
                  }
                ],
                analysis: performanceAnalysis
              }}
              label="Gerar Relatório PDF"
              variant="default"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


