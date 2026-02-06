/**
 * ViaJAR Unified Dashboard - Versão Simplificada
 * Dashboard unificado com funcionalidades básicas para resolver tela branca
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hotel, 
  Building2, 
  TrendingUp, 
  BarChart3, 
  Target,
  Users,
  MapPin,
  FileText,
  Brain,
  Settings,
  Bell,
  Zap,
  Download,
  Upload,
  MessageCircle,
  Send,
  File,
  X,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar
} from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';

export default function ViaJARUnifiedDashboardSimple() {
  const { user, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('revenue');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Verificar se há usuário
  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-4">Usuário não encontrado ou não autenticado.</p>
          <Button onClick={() => window.location.href = '/test-login'}>
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20">
      <ViaJARNavbar />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard ViaJAR</h1>
              <p className="text-blue-100 mt-2">
                Bem-vindo, {userProfile.full_name || user.email}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {userProfile.role}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'revenue', label: 'Revenue Optimizer', icon: TrendingUp },
            { id: 'market', label: 'Market Intelligence', icon: BarChart3 },
            { id: 'competitive', label: 'Competitive Benchmark', icon: Target },
            { id: 'ai', label: 'Guilherme', icon: Brain }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 45.000</div>
                  <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                  <Hotel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">+5.2% em relação ao mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12</div>
                  <p className="text-xs text-muted-foreground">+2 novos clientes esta semana</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Gráfico de receita será implementado aqui</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inteligência de Mercado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Análise de mercado será implementada aqui</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'competitive' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Competitivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Análise competitiva será implementada aqui</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guilherme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Chat com IA será implementado aqui</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

