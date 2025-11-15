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
  TrendingUp
} from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import TourismInventoryManager from '@/components/secretary/TourismInventoryManager';
import EventManagementSystem from '@/components/secretary/EventManagementSystem';

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

  // Dados mockados conforme layout original
  const attractions: Attraction[] = [
    { id: '1', name: 'Gruta do Lago Azul', category: 'Natural', visitors: 1250, status: 'active' },
    { id: '2', name: 'Buraco das Araras', category: 'Natural', visitors: 890, status: 'active' },
    { id: '3', name: 'Aquário Natural', category: 'Aquático', visitors: 2100, status: 'active' },
    { id: '4', name: 'Museu de Bonito', category: 'Cultural', visitors: 340, status: 'active' },
    { id: '5', name: 'Fazenda San Francisco', category: 'Rural', visitors: 560, status: 'active' },
    { id: '6', name: 'Parque das Cachoeiras', category: 'Natural', visitors: 0, status: 'maintenance' }
  ];

  const events: Event[] = [
    { id: '1', name: 'Festival de Inverno', date: '2024-07-15', participants: 500, status: 'confirmed' },
    { id: '2', name: 'Feira de Artesanato', date: '2024-08-20', participants: 200, status: 'planning' }
  ];

  const cats: CAT[] = [
    { id: '1', name: 'CAT Centro', location: 'Praça da Liberdade, 123', tourists: 156, rating: 4.8, status: 'excellent', attendants: 3 },
    { id: '2', name: 'CAT Aeroporto', location: 'Aeroporto Internacional', tourists: 89, rating: 4.6, status: 'good', attendants: 2 },
    { id: '3', name: 'CAT Rodoviária', location: 'Terminal Rodoviário', tourists: 67, rating: 4.4, status: 'excellent', attendants: 2 },
    { id: '4', name: 'CAT Shopping', location: 'Shopping Center', tourists: 45, rating: 4.2, status: 'excellent', attendants: 1 },
    { id: '5', name: 'CAT Pousada', location: 'Zona Rural', tourists: 0, rating: 0, status: 'needs_improvement', attendants: 0 }
  ];

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
              <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                <Building2 className="h-4 w-4 mr-2" />
                Setor Público
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
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
                onClick={() => setActiveSection('overview')}
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
                onClick={() => setActiveSection('inventory')}
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
                onClick={() => setActiveSection('events')}
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
                onClick={() => setActiveSection('cats')}
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
                onClick={() => setActiveSection('heatmaps')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'heatmaps' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Mapas de Calor
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">

          {/* Visão Geral */}
          {activeSection === 'overview' && (
            <SectionWrapper 
              variant="default" 
              title="Visão Geral Municipal"
            >
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <CardBox>
                  <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                  <p className="text-sm text-gray-600">CATs Ativos</p>
                </CardBox>
                
                <CardBox>
                  <div className="text-3xl font-bold text-green-600 mb-2">1,247</div>
                  <p className="text-sm text-gray-600">Turistas Hoje</p>
                </CardBox>
                
                <CardBox>
                  <div className="text-3xl font-bold text-purple-600 mb-2">45</div>
                  <p className="text-sm text-gray-600">Atrações</p>
                </CardBox>
                
                <CardBox>
                  <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
                  <p className="text-sm text-gray-600">Eventos</p>
                </CardBox>
              </div>

              {/* Performance dos CATs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CardBox>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Performance dos CATs</h3>
                  </div>
                  <div className="space-y-3">
                    {cats.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-slate-800">{cat.name}</h4>
                          <p className="text-sm text-gray-600">{cat.tourists} turistas</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{cat.rating}</span>
                          </div>
                          <span className={`rounded-full text-xs font-medium px-2 py-1 ${
                            cat.status === 'excellent' ? 'bg-green-100 text-green-700' :
                            cat.status === 'good' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {cat.status === 'excellent' ? 'Excelente' :
                             cat.status === 'good' ? 'Bom' : 'Melhorar'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBox>

                <CardBox>
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Atividades Recentes</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Novo evento cadastrado</p>
                        <p className="text-xs text-gray-500">14:30</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">CAT Centro - 15 novos turistas</p>
                        <p className="text-xs text-gray-500">14:15</p>
                      </div>
                    </div>
                  </div>
                </CardBox>
              </div>
            </SectionWrapper>
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
            <SectionWrapper 
              variant="cats" 
              title="Gestão de CATs"
              actions={
                <Button onClick={() => setShowAddModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo CAT
                </Button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cats.map((cat) => (
                  <CardBox key={cat.id}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-800">{cat.name}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        cat.status === 'excellent' || cat.status === 'good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {cat.status === 'excellent' || cat.status === 'good' ? 'Ativo' : 'Manutenção'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <p className="text-slate-600 text-sm">{cat.location}</p>
                      <p className="text-slate-600 text-sm">Atendentes: {cat.attendants}</p>
                      <p className="text-slate-600 text-sm">Turistas hoje: {cat.tourists}</p>
                      <p className="text-slate-600 text-sm flex items-center gap-1">
                        Avaliação: <Star className="w-4 h-4 text-yellow-500 fill-current" /> {cat.rating}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-4 flex-wrap border-t">
                      <button className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-slate-700 text-sm hover:bg-slate-50">
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                      <button onClick={() => handleEdit(cat)} className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-slate-700 text-sm hover:bg-slate-50">
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                    </div>
                  </CardBox>
                ))}
              </div>
            </SectionWrapper>
          )}

          {/* Mapas de Calor */}
          {activeSection === 'heatmaps' && (
            <SectionWrapper variant="default" title="Mapas de Calor">
              <Card>
                <CardContent className="p-8 text-center">
                  <Map className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Mapas de Calor</h3>
                  <p className="text-gray-500">Visualização de dados de turismo em desenvolvimento</p>
                </CardContent>
              </Card>
            </SectionWrapper>
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
    </div>
  );
}