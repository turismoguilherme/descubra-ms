/**
 * Dashboard das Secretarias de Turismo - Layout Original do Dia 24/10/2024
 * Restaurado conforme especificação - SEM header gradiente, SEM tabs extras
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Building2, 
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  Settings,
  Bell,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Map,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Skeleton } from '@/components/ui/skeleton';
import TourismInventoryManager from '@/components/secretary/TourismInventoryManager';
import EventManagementSystem from '@/components/secretary/EventManagementSystem';
import CATGeolocationManager from '@/components/overflow-one/CATGeolocationManager';
import StrategicAIChat from '@/components/secretary/StrategicAIChat';
import DocumentUploadPublic from '@/components/secretary/DocumentUploadPublic';
import ReportGenerator from '@/components/secretary/ReportGenerator';
import PublicSettingsModal from '@/components/secretary/PublicSettingsModal';
import AttendantManagement from '@/components/secretary/AttendantManagement';
import { format } from 'date-fns';
import { Brain, FileText, FileBarChart } from 'lucide-react';

interface Attraction {
  id: string;
  name: string;
  category: string;
  visitors: number;
  status: 'active' | 'maintenance';
}

interface Event {
  id: string;
  name: string;
  date: string;
  participants: number;
  status: 'confirmed' | 'planning';
}

interface CAT {
  id: string;
  name: string;
  location: string;
  tourists: number;
  rating: number;
  status: 'excellent' | 'good' | 'needs_improvement';
  attendants: number;
}

export default function SecretaryDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Attraction | Event | CAT | null>(null);
  const [editFormData, setEditFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Attraction | Event | CAT | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  // Dados mock para métricas
  const loading = false;
  const error = null;
  const alerts: Array<{ id: string; title: string; message: string; type: string; priority?: string; actionUrl?: string; actionLabel?: string }> = [];
  const isRealtime = false;
  const refresh = () => {};
  const metrics = {
    totalCATs: 4,
    touristsToday: 2450,
    totalAttractions: 156,
    totalEvents: 18,
    touristsByDay: [],
    touristsByOrigin: [],
    cats: [],
    recentActivities: []
  };

  // Cores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  const handleEdit = (item: Attraction | Event | CAT) => {
    setEditingItem(item);
    setEditFormData({ ...item });
    setShowAddModal(true);
  };

  const handleDelete = (item: Attraction | Event | CAT) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Lógica de exclusão aqui
    console.log('Excluindo:', itemToDelete);
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleSave = () => {
    // Lógica de salvamento aqui
    console.log('Salvando:', editFormData);
    setShowAddModal(false);
    setEditingItem(null);
    setEditFormData({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ViaJARNavbar />
      
      {/* Header com gradiente azul-roxo */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Municipal</h1>
              <p className="text-blue-100 mt-2">Bem-vindo, Prefeitura Bonito</p>
            </div>
            <div className="flex gap-4">
              <Button 
                type="button"
                variant="secondary" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Setor Público
              </Button>
              <Button 
                type="button"
                variant="secondary" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSettingsDialogOpen(true);
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar Esquerda */}
        <div className="w-64 bg-white shadow-lg h-full flex-shrink-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Secretaria</h2>
            <nav className="space-y-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Click em Visão Geral');
                  setActiveSection('overview');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'overview' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Visão Geral
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Click em Inventário Turístico');
                  setActiveSection('inventory');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'inventory' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Inventário Turístico
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Click em Gestão de Eventos');
                  setActiveSection('events');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'events' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Gestão de Eventos
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Click em Gestão de CATs');
                  setActiveSection('cats');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'cats' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Gestão de CATs
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Click em Mapas de Calor');
                  setActiveSection('heatmaps');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'heatmaps' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Mapas de Calor
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Click em IA Estratégica');
                  setActiveSection('ai-strategic');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'ai-strategic' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Brain className="h-4 w-4" />
                IA Estratégica
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Click em Upload Documentos');
                  setActiveSection('documents');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'documents' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4" />
                Upload Documentos
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Click em Relatórios');
                  setActiveSection('reports');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'reports' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileBarChart className="h-4 w-4" />
                Relatórios
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 space-y-6">

          {/* Visão Geral */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Header com Título e Ações */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Visão Geral Municipal</h1>
                  <p className="text-slate-600">Resumo executivo das principais métricas e indicadores de turismo</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    refresh();
                  }}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>

              {error && (
                <CardBox className="border-red-200 bg-red-50 mb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 mb-1">Erro ao carregar dados</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        refresh();
                      }}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                </CardBox>
              )}

              {/* Alertas Inteligentes */}
              {alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {alerts.slice(0, 3).map((alert) => (
                    <CardBox
                      key={alert.id}
                      className={`p-4 border-l-4 ${
                        alert.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-400 border-l-yellow-500'
                          : alert.type === 'error'
                          ? 'bg-red-50 border-red-400 border-l-red-500'
                          : alert.type === 'success'
                          ? 'bg-green-50 border-green-400 border-l-green-500'
                          : 'bg-blue-50 border-blue-400 border-l-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            alert.type === 'warning'
                              ? 'text-yellow-600'
                              : alert.type === 'error'
                              ? 'text-red-600'
                              : alert.type === 'success'
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 mb-1">{alert.title}</p>
                          {alert.actionUrl && alert.actionLabel && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveSection(alert.actionUrl?.replace('#', '') || 'overview');
                              }}
                              className="text-xs h-7 px-2 mt-2"
                            >
                              {alert.actionLabel} →
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardBox>
                  ))}
                </div>
              )}

              {/* Cards de Métricas Principais - Design Moderno */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <CardBox className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">Ativos</Badge>
                  </div>
                  {loading ? (
                    <Skeleton className="h-8 w-20 mb-2" />
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-blue-700 mb-1">
                        {metrics.totalCATs.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm font-medium text-blue-600">CATs Ativos</div>
                      <div className="text-xs text-slate-500 mt-1">Centros de atendimento ao turista</div>
                    </>
                  )}
                </CardBox>
                
                <CardBox className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Hoje</Badge>
                  </div>
                  {loading ? (
                    <Skeleton className="h-8 w-20 mb-2" />
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-green-700 mb-1">
                        {metrics.touristsToday.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm font-medium text-green-600">Turistas Atendidos</div>
                      <div className="text-xs text-slate-500 mt-1">Visitantes registrados hoje</div>
                    </>
                  )}
                </CardBox>
                
                <CardBox className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">Cadastradas</Badge>
                  </div>
                  {loading ? (
                    <Skeleton className="h-8 w-20 mb-2" />
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-purple-700 mb-1">
                        {metrics.totalAttractions.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm font-medium text-purple-600">Atrações Turísticas</div>
                      <div className="text-xs text-slate-500 mt-1">Pontos de interesse cadastrados</div>
                    </>
                  )}
                </CardBox>
                
                <CardBox className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">Programados</Badge>
                  </div>
                  {loading ? (
                    <Skeleton className="h-8 w-20 mb-2" />
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-orange-700 mb-1">
                        {metrics.totalEvents.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm font-medium text-orange-600">Eventos</div>
                      <div className="text-xs text-slate-500 mt-1">Eventos programados no calendário</div>
                    </>
                  )}
                </CardBox>
              </div>

              {/* Gráficos e Análises */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico de Turistas por Dia */}
                <CardBox className="p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">Turistas por Dia</h3>
                      <p className="text-sm text-slate-500">Últimos 7 dias</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : metrics.touristsByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={metrics.touristsByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                          stroke="#64748b"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#64748b"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="Turistas"
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mb-2 text-gray-400" />
                      <p>Nenhum dado disponível</p>
                    </div>
                  )}
                </CardBox>

                {/* Gráfico de Origem dos Turistas */}
                <CardBox className="p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">Origem dos Turistas</h3>
                      <p className="text-sm text-slate-500">Top 10 estados/países</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : metrics.touristsByOrigin.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={metrics.touristsByOrigin}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="origin" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          stroke="#64748b"
                          style={{ fontSize: '11px' }}
                        />
                        <YAxis 
                          stroke="#64748b"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#10b981" name="Turistas" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                      <MapPin className="h-12 w-12 mb-2 text-gray-400" />
                      <p>Nenhum dado disponível</p>
                    </div>
                  )}
                </CardBox>
              </div>

              {/* Performance dos CATs e Atividades Recentes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CardBox className="p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">Performance dos CATs</h3>
                      <p className="text-sm text-slate-500">Centros de atendimento ao turista</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : metrics.cats.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.cats.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 mb-1">{cat.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {cat.tourists} turistas hoje
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                {cat.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <Badge className={`ml-3 ${
                            cat.status === 'excellent' ? 'bg-green-100 text-green-700 border-green-300' :
                            cat.status === 'good' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            'bg-yellow-100 text-yellow-700 border-yellow-300'
                          }`}>
                            {cat.status === 'excellent' ? 'Excelente' :
                             cat.status === 'good' ? 'Bom' : 'Melhorar'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Building2 className="h-16 w-16 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">Nenhum CAT cadastrado</p>
                      <p className="text-sm mt-1">Cadastre CATs na seção de Gestão de CATs</p>
                    </div>
                  )}
                </CardBox>

                <CardBox className="p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">Atividades Recentes</h3>
                      <p className="text-sm text-slate-500">Últimas atividades do sistema</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Bell className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Skeleton className="h-4 w-4 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : metrics.recentActivities.length > 0 ? (
                      <div className="space-y-2">
                        {metrics.recentActivities.slice(0, 8).map((activity) => (
                          <div key={activity.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            {activity.type === 'event' ? (
                              <Calendar className="h-4 w-4 text-blue-600" />
                            ) : activity.type === 'tourist' ? (
                              <Users className="h-4 w-4 text-green-600" />
                            ) : activity.type === 'attraction' ? (
                              <MapPin className="h-4 w-4 text-purple-600" />
                            ) : (
                              <Building2 className="h-4 w-4 text-orange-600" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-800">{activity.message}</p>
                              <p className="text-xs text-gray-500">
                                {format(activity.timestamp, 'HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma atividade recente</p>
                      </div>
                    )}
                  </CardBox>
                </div>
              </div>
          )}

          {/* Inventário Turístico */}
          {activeSection === 'inventory' && (
            <TourismInventoryManager />
          )}

          {/* Gestão de Eventos */}
          {activeSection === 'events' && (
            <EventManagementSystem />
          )}

          {/* Gestão de CATs */}
          {activeSection === 'cats' && (
            <CATGeolocationManager />
          )}

          {/* Mapas de Calor */}
          {activeSection === 'heatmaps' && (
            <SectionWrapper 
              variant="default" 
              title="Mapas de Calor"
              subtitle="Visualização geográfica do fluxo turístico"
            >
              <CardBox>
                <div className="text-center py-12">
                  <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Map className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium mb-1">Mapas de Calor</p>
                  <p className="text-sm text-slate-500">Funcionalidade em desenvolvimento</p>
                </div>
              </CardBox>
            </SectionWrapper>
          )}

          {/* IA Estratégica */}
          {activeSection === 'ai-strategic' && (
            <StrategicAIChat />
          )}

          {/* Upload de Documentos */}
          {activeSection === 'documents' && (
            <DocumentUploadPublic />
          )}


          {/* Relatórios */}
          {activeSection === 'reports' && (
            <ReportGenerator />
          )}

          {/* Modal de Adicionar/Editar */}
      {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <Card className="w-full max-w-md bg-white">
                <CardHeader>
                  <CardTitle>{editingItem ? 'Editar Item' : 'Adicionar Novo Item'}</CardTitle>
                </CardHeader>
                <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                      <Input id="name" placeholder="Digite o nome" />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="natural">Natural</SelectItem>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="rural">Rural</SelectItem>
                          <SelectItem value="aquatic">Aquático</SelectItem>
                        </SelectContent>
                      </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                      <Textarea id="description" placeholder="Digite a descrição" />
                </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="px-4 py-2">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
                {editingItem ? 'Salvar' : 'Adicionar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modal de Confirmação de Exclusão */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Tem certeza que deseja excluir "{itemToDelete?.name}"?
                </h3>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={cancelDelete} className="px-4 py-2">
                    Cancelar
                  </Button>
                  <Button onClick={confirmDelete} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
                    OK
              </Button>
            </div>
          </div>
        </div>
          )}
        </div>
      </div>

      {/* Modal de Configurações */}
      <PublicSettingsModal isOpen={isSettingsDialogOpen} onClose={() => setIsSettingsDialogOpen(false)} />
    </div>
  );
}