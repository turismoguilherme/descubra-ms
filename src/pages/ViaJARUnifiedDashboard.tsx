/**
 * ViaJAR Unified Dashboard
 * Dashboard unificado com todas as funcionalidades em uma única tela
 * - Revenue Optimizer
 * - Market Intelligence  
 * - Competitive Benchmark
 * - IA Conversacional
 * - Upload de Documentos
 * - Download de Relatórios
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import FreeDataService from '@/services/data/FreeDataService';
import RegionDetector from '@/services/region/RegionDetector';
import FreeDataSourceConfig from '@/services/config/FreeDataSourceConfig';
import DataSourceIndicator from '@/components/dashboard/DataSourceIndicator';
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
  Calendar,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import { UserSettingsModal } from '@/components/user/UserSettingsModal';

// Dados de exemplo
const revenueData = [
  { month: 'Jan', receita: 45000, ocupacao: 65 },
  { month: 'Fev', receita: 52000, ocupacao: 78 },
  { month: 'Mar', receita: 48000, ocupacao: 72 },
  { month: 'Abr', receita: 55000, ocupacao: 85 },
  { month: 'Mai', receita: 62000, ocupacao: 92 },
  { month: 'Jun', receita: 58000, ocupacao: 88 }
];

const marketData = [
  { name: 'Bonito', visitantes: 45000, receita: 1200000 },
  { name: 'Campo Grande', visitantes: 32000, receita: 800000 },
  { name: 'Corumbá', visitantes: 28000, receita: 650000 },
  { name: 'Dourados', visitantes: 15000, receita: 400000 }
];

const segmentData = [
  { name: 'Turismo de Lazer', value: 45, color: '#8B5CF6' },
  { name: 'Negócios', value: 25, color: '#10B981' },
  { name: 'Eventos', value: 20, color: '#F59E0B' },
  { name: 'Ecoturismo', value: 10, color: '#EF4444' }
];

export default function ViaJARUnifiedDashboard() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('revenue');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: 'Olá! Sou sua assistente de IA. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  
  // Estados para modal de configurações
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Estados para APIs gratuitas
  const [region, setRegion] = useState<string>('MS');
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [freeDataService] = useState(new FreeDataService());
  const [regionDetector] = useState(RegionDetector.getInstance());
  const [dataSourceConfig] = useState(FreeDataSourceConfig.getInstance());

  const isHotel = userProfile?.role === 'user' && userProfile?.business_category === 'hotel';
  const isGovernment = userProfile?.role === 'gestor_municipal';

  // Carregar dados das APIs gratuitas
  useEffect(() => {
    const loadData = async () => {
      if (!userProfile) return;
      
      setIsLoadingData(true);
      console.log('🔄 Carregando dados das APIs gratuitas...');
      
      try {
        // Detectar região do usuário
        const detectedRegion = await regionDetector.detectUserRegion(userProfile);
        setRegion(detectedRegion.state || 'MS');
        
        // Configurar fontes de dados
        const sources = dataSourceConfig.getDataSourcesForRegion(detectedRegion.state || 'MS');
        setDataSources(sources);
        
        // Carregar dados de receita
        const revenue = await freeDataService.getRevenueData(detectedRegion.state || 'MS');
        setRevenueData(revenue);
        
        // Carregar dados de mercado
        const market = await freeDataService.getMarketData(detectedRegion.state || 'MS');
        setMarketData(market);
        
        console.log('✅ Dados carregados com sucesso:', { revenue, market, sources });
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        // Manter dados mock como fallback
        setRevenueData([
          { month: 'Jan', receita: 45000, ocupacao: 65, source: 'mock' },
          { month: 'Fev', receita: 52000, ocupacao: 78, source: 'mock' },
          { month: 'Mar', receita: 48000, ocupacao: 72, source: 'mock' },
          { month: 'Abr', receita: 55000, ocupacao: 85, source: 'mock' },
          { month: 'Mai', receita: 62000, ocupacao: 92, source: 'mock' },
          { month: 'Jun', receita: 58000, ocupacao: 88, source: 'mock' }
        ]);
        setMarketData([
          { name: 'Bonito', visitantes: 45000, receita: 1200000, crescimento: 12, source: 'mock' },
          { name: 'Campo Grande', visitantes: 32000, receita: 800000, crescimento: 8, source: 'mock' },
          { name: 'Corumbá', visitantes: 28000, receita: 650000, crescimento: 15, source: 'mock' },
          { name: 'Dourados', visitantes: 15000, receita: 400000, crescimento: 5, source: 'mock' }
        ]);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadData();
  }, [userProfile, freeDataService, regionDetector, dataSourceConfig]);

  // Definição das abas
  const tabs = [
    { id: 'revenue', label: 'Revenue Optimizer', icon: TrendingUp, color: 'green' },
    { id: 'market', label: 'Market Intelligence', icon: BarChart3, color: 'blue' },
    { id: 'ai', label: 'IA Conversacional', icon: Brain, color: 'purple' },
    { id: 'upload', label: 'Upload Documentos', icon: Upload, color: 'orange' },
    { id: 'benchmark', label: 'Competitive Benchmark', icon: Target, color: 'indigo' },
    { id: 'download', label: 'Download Relatórios', icon: Download, color: 'teal' },
    { id: 'sources', label: 'Fontes de Dados', icon: Globe, color: 'cyan' }
  ];

  // Função para enviar mensagem no chat
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setAiThinking(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        message: `Analisando sua pergunta sobre "${chatInput}". Baseado nos dados do seu negócio, posso sugerir algumas estratégias para melhorar sua receita. Gostaria que eu detalhe alguma área específica?`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setAiThinking(false);
    }, 2000);
  };

  // Função para upload de arquivos
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setIsUploading(true);

    // Simular upload
    setTimeout(() => {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploaded',
        uploadDate: new Date()
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
    }, 1500);
  };

  // Função para download de relatórios
  const handleDownloadReport = (format) => {
    // Simular download
    console.log(`Downloading report in ${format} format`);
    // Aqui seria implementada a lógica real de download
  };

  // Funções para modal de configurações
  const handleUpdateUser = async (userData) => {
    try {
      console.log('Atualizando dados do usuário:', userData);
      // Aqui seria implementada a lógica real de atualização
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      console.log('Excluindo conta do usuário');
      // Aqui seria implementada a lógica real de exclusão
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
    }
  };

  const handleResetPassword = async () => {
    try {
      console.log('Enviando email de recuperação de senha');
      // Aqui seria implementada a lógica real de recuperação
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20">
      <ViaJARNavbar />
      
      {/* Header Compacto */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                <span className="text-white">Dashboard</span>
                <span className="text-cyan-300"> Inteligente</span>
              </h1>
              <p className="text-base text-blue-100">
                Bem-vindo, {userProfile?.full_name || user?.email}
              </p>
              {/* Indicador de fontes de dados */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-blue-200">🌍 {region}</span>
                <div className="flex items-center gap-1">
                  {dataSources.slice(0, 3).map((source, index) => (
                    <Badge 
                      key={index}
                      variant={source.type === 'premium' ? 'default' : 'secondary'}
                      className="text-xs px-2 py-1"
                    >
                      {source.type === 'premium' ? '👑' : '🆓'} {source.name}
                    </Badge>
                  ))}
                  {dataSources.length > 3 && (
                    <span className="text-xs text-blue-200">+{dataSources.length - 3} mais</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isGovernment && (
                <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-300/30 gap-2 px-3 py-1">
                  <Building2 className="h-4 w-4" />
                  Setor Público
                </Badge>
              )}
              {isHotel && (
                <Badge className="bg-green-500/20 text-green-200 border-green-300/30 gap-2 px-3 py-1">
                  <Hotel className="h-4 w-4" />
                  Hotel/Pousada
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="icon" 
                className="border-cyan-300/30 text-cyan-200 hover:bg-cyan-300/20"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Layout com Sidebar */}
      <div className="flex h-screen">
        {/* Sidebar Lateral */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Funcionalidades</h2>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg text-left transition-all duration-200 ${
                      isActive 
                        ? `bg-${tab.color}-50 border-l-4 border-${tab.color}-500 text-${tab.color}-700 shadow-sm` 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive ? `bg-${tab.color}-100` : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isActive ? `text-${tab.color}-600` : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{tab.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {tab.id === 'revenue' && 'Otimize sua receita'}
                        {tab.id === 'market' && 'Análise de mercado'}
                        {tab.id === 'ai' && 'Chat inteligente'}
                        {tab.id === 'upload' && 'Envie documentos'}
                        {tab.id === 'benchmark' && 'Compare concorrentes'}
                        {tab.id === 'download' && 'Exporte relatórios'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
          
          {/* REVENUE OPTIMIZER */}
          {activeTab === 'revenue' && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-900">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                Revenue Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Indicador de Carregamento */}
              {isLoadingData && (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Carregando dados das APIs gratuitas...</span>
                  </div>
                </div>
              )}

              {/* Métricas Principais */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white rounded-lg">
                  <p className="text-4xl font-bold text-green-900">R$ 125.450</p>
                  <p className="text-lg text-green-600">Receita Mensal</p>
                  <div className="flex items-center justify-center text-green-600 text-lg mt-2">
                    <TrendingUp className="h-5 w-5 mr-1" />
                    +12%
                  </div>
                </div>
                <div className="text-center p-6 bg-white rounded-lg">
                  <p className="text-4xl font-bold text-blue-900">78%</p>
                  <p className="text-lg text-blue-600">Taxa de Ocupação</p>
                  <div className="flex items-center justify-center text-green-600 text-lg mt-2">
                    <TrendingUp className="h-5 w-5 mr-1" />
                    +5%
                  </div>
                </div>
              </div>

              {/* Gráfico de Receita */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData.length > 0 ? revenueData : [
                    { month: 'Jan', receita: 45000, ocupacao: 65, source: 'mock' },
                    { month: 'Fev', receita: 52000, ocupacao: 78, source: 'mock' },
                    { month: 'Mar', receita: 48000, ocupacao: 72, source: 'mock' },
                    { month: 'Abr', receita: 55000, ocupacao: 85, source: 'mock' },
                    { month: 'Mai', receita: 62000, ocupacao: 92, source: 'mock' },
                    { month: 'Jun', receita: 58000, ocupacao: 88, source: 'mock' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="receita" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Controles de Preço */}
              <div className="space-y-4">
                <label className="text-lg font-medium text-green-800">Ajuste de Preço Sugerido</label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    placeholder="R$ 285" 
                    className="flex-1 h-12 text-lg"
                  />
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 h-12 px-6">
                    Aplicar
                  </Button>
                </div>
              </div>

              {/* Botão de Download */}
              <Button 
                variant="outline" 
                size="lg"
                className="w-full h-12 border-green-300 text-green-700 hover:bg-green-50 text-lg"
                onClick={() => handleDownloadReport('revenue')}
              >
                <Download className="h-5 w-5 mr-2" />
                Exportar Relatório de Receita
              </Button>
            </CardContent>
          </Card>
          )}

          {/* MARKET INTELLIGENCE */}
          {activeTab === 'market' && (
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dados de Mercado */}
              <div className="space-y-4">
                {(marketData.length > 0 ? marketData : [
                  { name: 'Bonito', visitantes: 45000, receita: 1200000, crescimento: 12, source: 'mock' },
                  { name: 'Campo Grande', visitantes: 32000, receita: 800000, crescimento: 8, source: 'mock' },
                  { name: 'Corumbá', visitantes: 28000, receita: 650000, crescimento: 15, source: 'mock' },
                  { name: 'Dourados', visitantes: 15000, receita: 400000, crescimento: 5, source: 'mock' }
                ]).map((city, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <p className="font-semibold text-lg text-blue-900">{city.name}</p>
                      <p className="text-base text-blue-600">{city.visitantes.toLocaleString()} visitantes</p>
                      <p className="text-sm text-blue-500">Fonte: {city.source}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-blue-900">R$ {city.receita.toLocaleString()}</p>
                      <p className="text-base text-blue-600">receita</p>
                      <p className="text-sm text-green-600">+{city.crescimento}%</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráfico de Segmentos */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Filtros */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800">Filtrar por Período</label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Últimos 30 dias</Button>
                  <Button size="sm" variant="outline">Últimos 3 meses</Button>
                  <Button size="sm" variant="outline">Último ano</Button>
                </div>
              </div>

              {/* Botão de Download */}
              <Button 
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => handleDownloadReport('market')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Análise de Mercado
              </Button>
            </CardContent>
          </Card>
          )}

          {/* IA CONVERSACIONAL */}
          {activeTab === 'ai' && (
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-900">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                IA Conversacional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto space-y-4 p-4 bg-white rounded-lg">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-4 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-base">{msg.message}</p>
                      <p className="text-sm opacity-70 mt-2">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {aiThinking && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                        <span className="text-sm">IA está pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-3">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pergunte sobre seus dados..."
                  className="flex-1 h-12 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  size="lg"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || aiThinking}
                  className="bg-purple-600 hover:bg-purple-700 h-12 px-6"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setChatInput("Analise minha receita dos últimos 3 meses")}
                  className="text-base h-12"
                >
                  📊 Analisar Receita
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setChatInput("Compare com meus concorrentes")}
                  className="text-base h-12"
                >
                  🎯 Comparar Concorrentes
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {/* UPLOAD DE DOCUMENTOS */}
          {activeTab === 'upload' && (
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-900">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Upload className="h-5 w-5 text-orange-600" />
                </div>
                Upload de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <p className="text-lg text-orange-700 mb-4">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild variant="outline" size="lg" className="border-orange-300 text-orange-700 hover:bg-orange-50 h-12 px-6">
                    <span>Selecionar Arquivos</span>
                  </Button>
                </label>
                <p className="text-sm text-orange-600 mt-3">
                  PDF, Excel, Word, Imagens (máx. 10MB)
                </p>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-orange-700">Enviando arquivos...</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              )}

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-900">Arquivos Enviados</h4>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-900">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.status}
                        </Badge>
                      </div>
                      <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Analysis Button */}
              {uploadedFiles.length > 0 && (
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => setChatInput("Analise os documentos que enviei")}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Analisar com IA
                </Button>
              )}
            </CardContent>
          </Card>
          )}

          {/* COMPETITIVE BENCHMARK */}
          {activeTab === 'benchmark' && (
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-indigo-900">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Target className="h-5 w-5 text-indigo-600" />
                </div>
                Competitive Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rankings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-yellow-800">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-indigo-900">Pousada do Sol</p>
                      <p className="text-base text-indigo-600">Você</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-indigo-900">R$ 285</p>
                    <p className="text-base text-indigo-600">RevPAR</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-indigo-900">Hotel Bonito</p>
                      <p className="text-base text-indigo-600">Concorrente</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-indigo-900">R$ 265</p>
                    <p className="text-base text-indigo-600">RevPAR</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-indigo-900">Pousada das Cachoeiras</p>
                      <p className="text-sm text-indigo-600">Concorrente</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-900">R$ 245</p>
                    <p className="text-sm text-indigo-600">RevPAR</p>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Você', receita: 125450, ocupacao: 78 },
                    { name: 'Concorrente 1', receita: 98000, ocupacao: 65 },
                    { name: 'Concorrente 2', receita: 87000, ocupacao: 58 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="receita" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insights */}
              <div className="p-3 bg-indigo-50 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-2">💡 Insights</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Você está 7% acima da média do mercado</li>
                  <li>• Sua taxa de ocupação é 13% superior</li>
                  <li>• Oportunidade de crescimento em 15%</li>
                </ul>
              </div>

              {/* Botão de Download */}
              <Button 
                variant="outline" 
                className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                onClick={() => handleDownloadReport('benchmark')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Benchmark
              </Button>
            </CardContent>
          </Card>
          )}

          {/* DOWNLOAD DE RELATÓRIOS */}
          {activeTab === 'download' && (
            <Card className="bg-gradient-to-br from-teal-50 to-green-50 border-teal-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-teal-900">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Download className="h-5 w-5 text-teal-600" />
                </div>
                Download de Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Relatórios Disponíveis */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-teal-600" />
                    <div>
                      <p className="font-semibold text-lg text-teal-900">Relatório Executivo</p>
                      <p className="text-base text-teal-600">Análise completa do negócio</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button size="lg" variant="outline" onClick={() => handleDownloadReport('pdf')} className="h-10 px-4">
                      PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => handleDownloadReport('excel')} className="h-10 px-4">
                      Excel
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-4">
                    <BarChart3 className="h-6 w-6 text-teal-600" />
                    <div>
                      <p className="font-semibold text-lg text-teal-900">Análise de Mercado</p>
                      <p className="text-base text-teal-600">Dados de concorrentes e tendências</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button size="lg" variant="outline" onClick={() => handleDownloadReport('pdf')} className="h-10 px-4">
                      PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => handleDownloadReport('excel')} className="h-10 px-4">
                      Excel
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                    <div>
                      <p className="font-semibold text-lg text-teal-900">Relatório Financeiro</p>
                      <p className="text-base text-teal-600">Receita, custos e projeções</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button size="lg" variant="outline" onClick={() => handleDownloadReport('pdf')} className="h-10 px-4">
                      PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => handleDownloadReport('excel')} className="h-10 px-4">
                      Excel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Agendamento */}
              <div className="p-4 bg-teal-50 rounded-lg">
                <h4 className="font-semibold text-lg text-teal-900 mb-3">📅 Agendamento</h4>
                <p className="text-base text-teal-700 mb-4">
                  Receba relatórios automaticamente por email
                </p>
                <div className="flex gap-3">
                  <Button size="lg" variant="outline" className="text-base h-10 px-4">
                    Diário
                  </Button>
                  <Button size="lg" variant="outline" className="text-base h-10 px-4">
                    Semanal
                  </Button>
                  <Button size="lg" variant="outline" className="text-base h-10 px-4">
                    Mensal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* FONTES DE DADOS */}
          {activeTab === 'sources' && (
            <DataSourceIndicator 
              dataSources={dataSources}
              region={region}
              isLoading={isLoadingData}
            />
          )}

            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configurações do Usuário */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onDeleteAccount={handleDeleteAccount}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
}
