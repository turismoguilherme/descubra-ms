/**
 * ViaJAR Dynamic Dashboard
 * Dashboard inteligente que adapta o conteúdo baseado na categoria/role do usuário
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Componentes especializados
import { BusinessIntelligenceDashboard } from '@/components/business-intelligence/BusinessIntelligenceDashboard';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';

interface UserProfile {
  id: string;
  email: string;
  business_category?: string;
  company_name?: string;
  role?: string;
}

export default function ViaJARDynamicDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  // Detectar tipo de usuário
  const isHotel = profile?.business_category === 'hotel';
  const isGovernment = profile?.role === 'gestor_municipal' || 
                       profile?.role === 'atendente' || 
                       profile?.role === 'cat_attendant';
  const isTrade = !isGovernment; // Setor privado (hotéis, agências, etc)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ViaJARNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {isGovernment ? (
                  <>
                    <span className="text-white">Dashboard</span>
                    <span className="text-cyan-300"> Municipal</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">Dashboard</span>
                    <span className="text-cyan-300"> Empresarial</span>
                  </>
                )}
              </h1>
              <p className="text-lg text-blue-100 mb-4">
                Bem-vindo, {profile?.company_name || user?.email}
              </p>
              <div className="flex items-center gap-3">
                {isGovernment ? (
                  <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-300/30 gap-2 px-3 py-1">
                    <Building2 className="h-4 w-4" />
                    Setor Público
                  </Badge>
                ) : isHotel ? (
                  <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-300/30 gap-2 px-3 py-1">
                    <Hotel className="h-4 w-4" />
                    Hotel/Pousada
                  </Badge>
                ) : (
                  <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-300/30 gap-2 px-3 py-1">
                    <Users className="h-4 w-4" />
                    Setor Privado
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="border-cyan-300/30 text-cyan-200 hover:bg-cyan-300/20">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-cyan-300/30 text-cyan-200 hover:bg-cyan-300/20">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* GOVERNO: Dashboard Municipal */}
        {isGovernment && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="cats">Gestão de CATs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="ai">IA Consultora</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-blue-900">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      CATs Ativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-900 mb-1">8</p>
                    <p className="text-sm text-blue-600 font-medium">Centros de Atendimento</p>
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +2 este mês
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-green-900">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      Atendentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-900 mb-1">24</p>
                    <p className="text-sm text-green-600 font-medium">Atendentes ativos</p>
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +3 este mês
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-purple-900">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      Atendimentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-purple-900 mb-1">1.245</p>
                    <p className="text-sm text-purple-600 font-medium">Este mês</p>
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +15% vs mês anterior
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Zap className="h-5 w-5 text-cyan-600" />
                    </div>
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Link to="/viajar/setor-publico">
                    <Button className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                      <Building2 className="h-5 w-5" />
                      Dashboard Completo
                    </Button>
                  </Link>
                  <Link to="/viajar/cat-dashboard">
                    <Button className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0">
                      <MapPin className="h-5 w-5" />
                      Gestão de CATs
                    </Button>
                  </Link>
                  <Link to="/viajar/relatorios">
                    <Button className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0">
                      <FileText className="h-5 w-5" />
                      Relatórios
                    </Button>
                  </Link>
                  <Link to="/viajar/intelligence">
                    <Button className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0">
                      <Brain className="h-5 w-5" />
                      IA Consultora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cats">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de CATs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Gerencie Centros de Atendimento ao Turista e atendentes.
                  </p>
                  <Link to="/viajar/cat-dashboard">
                    <Button>Acessar Gestão Completa</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <BusinessIntelligenceDashboard />
            </TabsContent>

            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    IA Consultora Estratégica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Acesse análises estratégicas e recomendações de IA para políticas públicas.
                  </p>
                  <Link to="/viajar/intelligence">
                    <Button>Acessar IA Consultora</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* SETOR PRIVADO: Dashboard Empresarial */}
        {isTrade && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="revenue">Revenue Optimizer</TabsTrigger>
              <TabsTrigger value="market">Market Intelligence</TabsTrigger>
              <TabsTrigger value="benchmark">Competitive Benchmark</TabsTrigger>
              {isHotel && <TabsTrigger value="occupancy">Taxa de Ocupação</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Business Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-green-900">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      Receita Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-900 mb-1">R$ 125.450</p>
                    <p className="text-sm text-green-600 font-medium">Receita total</p>
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +12% vs mês anterior
                    </div>
                  </CardContent>
                </Card>

                {isHotel && (
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-blue-900">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Hotel className="h-5 w-5 text-blue-600" />
                        </div>
                        Taxa de Ocupação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-blue-900 mb-1">78%</p>
                      <p className="text-sm text-blue-600 font-medium">Outubro 2025</p>
                      <div className="mt-2 flex items-center text-green-600 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +5% vs mês anterior
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-purple-900">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      RevPAR
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-purple-900 mb-1">R$ 285</p>
                    <p className="text-sm text-purple-600 font-medium">Revenue per Available Room</p>
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +8% vs mês anterior
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Tools */}
              <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Brain className="h-5 w-5 text-cyan-600" />
                    </div>
                    Ferramentas de Inteligência
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Optimizer
                  </Button>
                  <Button className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                    <BarChart3 className="h-5 w-5" />
                    Market Intelligence
                  </Button>
                  <Button className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0">
                    <Target className="h-5 w-5" />
                    Competitive Benchmark
                  </Button>
                  {isHotel && (
                    <Button className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0">
                      <Hotel className="h-5 w-5" />
                      Taxa de Ocupação
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Optimizer - Precificação Dinâmica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    IA analisa demanda, eventos, sazonalidade e sugere preços otimizados.
                  </p>
                  <Link to="/viajar/intelligence">
                    <Button>Acessar Revenue Optimizer</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Análise completa do mercado: origem turistas, perfil, ROI por canal.
                  </p>
                  <Link to="/viajar/intelligence">
                    <Button>Acessar Market Intelligence</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benchmark">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Competitive Benchmark
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Compare seu desempenho com concorrentes e médias de mercado.
                  </p>
                  <Link to="/viajar/intelligence">
                    <Button>Acessar Benchmark</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {isHotel && (
              <TabsContent value="occupancy">
                <div className="space-y-6">
                  {/* Header Card */}
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-blue-900">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Hotel className="h-6 w-6 text-blue-600" />
                        </div>
                        Sistema de Taxa de Ocupação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-blue-100/50 border border-blue-200 rounded-lg">
                        <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          📊 Exclusivo para Hotéis e Pousadas
                        </p>
                        <p className="text-sm text-blue-700">
                          Sistema simplificado de envio de taxa de ocupação para secretarias de turismo.
                          Cálculo automático, formulário intuitivo, histórico completo.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all duration-300">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-green-900 mb-2">78%</p>
                          <p className="text-sm text-green-600 font-medium">Taxa atual (out/2025)</p>
                          <div className="mt-2 flex items-center justify-center text-green-600 text-sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            +5% vs mês anterior
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-purple-900 mb-2">12</p>
                          <p className="text-sm text-purple-600 font-medium">Relatórios enviados</p>
                          <div className="mt-2 flex items-center justify-center text-green-600 text-sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Em dia com envios
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Button */}
                  <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200/50">
                    <CardContent className="pt-6">
                      <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg font-semibold">
                        <Hotel className="h-5 w-5 mr-2" />
                        Enviar Taxa de Ocupação
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}

