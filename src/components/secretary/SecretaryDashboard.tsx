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
              {/* Resumo Executivo - Métricas Principais */}
              <SectionWrapper 
                variant="default" 
                title="Visão Geral Municipal"
                subtitle="Resumo executivo das principais métricas e indicadores"
                actions={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Botão Atualizar clicado');
                      refresh();
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="Atualizar dados"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                }
              >
                {error && (
                  <CardBox className="border-red-200 bg-red-50 mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
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

                {/* Alertas Inteligentes - Compacto */}
                {alerts.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {alerts.slice(0, 3).map((alert) => (
                      <CardBox
                        key={alert.id}
                        className={`p-3 ${
                          alert.type === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : alert.type === 'error'
                            ? 'bg-red-50 border-red-200'
                            : alert.type === 'success'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle
                            className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
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
                            <p className="text-xs font-medium text-slate-800 truncate">{alert.title}</p>
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
                                className="text-xs h-6 px-2 mt-1"
                              >
                                {alert.actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardBox>
                    ))}
                  </div>
                )}

                {/* Cards de Métricas Principais - Compacto */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <CardBox className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-slate-600">CATs Ativos</span>
                    </div>
                    {loading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.totalCATs.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Centros de atendimento</div>
                      </>
                    )}
                  </CardBox>
                  
                  <CardBox className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-slate-600">Turistas Hoje</span>
                    </div>
                    {loading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.touristsToday.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Visitantes atendidos</div>
                      </>
                    )}
                  </CardBox>
                  
                  <CardBox className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-slate-600">Atrações</span>
                    </div>
                    {loading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.totalAttractions.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Pontos turísticos</div>
                      </>
                    )}
                  </CardBox>
                  
                  <CardBox className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-slate-600">Eventos</span>
                    </div>
                    {loading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-orange-600">
                          {metrics.totalEvents.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Eventos programados</div>
                      </>
                    )}
                  </CardBox>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  {/* Gráfico de Turistas por Dia */}
                  <CardBox className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Turistas por Dia (Últimos 7 dias)</h3>
                    {loading ? (
                      <div className="h-64 flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : metrics.touristsByDay.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={metrics.touristsByDay}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Turistas"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <p>Nenhum dado disponível</p>
                      </div>
                    )}
                  </CardBox>

                  {/* Gráfico de Origem dos Turistas */}
                  <CardBox className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Origem dos Turistas (Top 10)</h3>
                    {loading ? (
                      <div className="h-64 flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : metrics.touristsByOrigin.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={metrics.touristsByOrigin}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="origin" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#10b981" name="Turistas" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <p>Nenhum dado disponível</p>
                      </div>
                    )}
                  </CardBox>
                </div>

                {/* Performance dos CATs e Atividades Recentes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <CardBox className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-slate-800">Performance dos CATs</h3>
                    </div>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        ))}
                      </div>
                    ) : metrics.cats.length > 0 ? (
                      <div className="space-y-2">
                        {metrics.cats.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-slate-800">{cat.name}</h4>
                              <p className="text-sm text-gray-600">{cat.tourists} turistas hoje</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{cat.rating.toFixed(1)}</span>
                              </div>
                              <Badge className={`rounded-full text-xs px-2 py-0.5 ${
                                cat.status === 'excellent' ? 'bg-green-100 text-green-700 border-green-200' :
                                cat.status === 'good' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}>
                                {cat.status === 'excellent' ? 'Excelente' :
                                 cat.status === 'good' ? 'Bom' : 'Melhorar'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Nenhum CAT cadastrado</p>
                      </div>
                    )}
                  </CardBox>

                  <CardBox className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="h-4 w-4 text-green-600" />
                      <h3 className="text-sm font-semibold text-slate-800">Atividades Recentes</h3>
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
              </SectionWrapper>
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