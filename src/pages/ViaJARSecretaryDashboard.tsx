/**
 * Dashboard das Secretarias de Turismo - Versão Original
 * Interface exatamente como era antes do problema do modal
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Bell
} from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';

interface Attraction {
  id: string;
  name: string;
  status: 'active' | 'maintenance';
  type: string;
  visitors: number;
}

const attractions: Attraction[] = [
  { id: '1', name: 'Gruta do Lago Azul', status: 'active', type: 'Natural', visitors: 1250 },
  { id: '2', name: 'Buraco das Araras', status: 'active', type: 'Natural', visitors: 890 },
  { id: '3', name: 'Aquário Natural', status: 'active', type: 'Aquático', visitors: 2100 },
  { id: '4', name: 'Museu de Bonito', status: 'active', type: 'Cultural', visitors: 340 },
  { id: '5', name: 'Fazenda San Francisco', status: 'active', type: 'Rural', visitors: 560 },
  { id: '6', name: 'Parque das Cachoeiras', status: 'maintenance', type: 'Natural', visitors: 0 }
];

export default function ViaJARSecretaryDashboard() {
  const [activeSection, setActiveSection] = useState('inventory');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attractionToDelete, setAttractionToDelete] = useState<Attraction | null>(null);

  const handleDelete = (attraction: Attraction) => {
    setAttractionToDelete(attraction);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Lógica de exclusão aqui
    setShowDeleteModal(false);
    setAttractionToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAttractionToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ViaJARNavbar />
      
      <div className="flex h-screen">
        {/* Sidebar Esquerda */}
        <div className="w-64 bg-white shadow-lg h-full flex-shrink-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Secretaria</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'overview' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveSection('inventory')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'inventory' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Inventário Turístico
              </button>
              <button
                onClick={() => setActiveSection('events')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'events' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Gestão de Eventos
              </button>
              <button
                onClick={() => setActiveSection('cats')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'cats' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Gestão de CATS
              </button>
              <button
                onClick={() => setActiveSection('heatmaps')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'heatmaps' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Mapas de Calor
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Municipal</h1>
            <p className="text-gray-600 mt-2">Prefeitura Bonito</p>
          </div>

          {/* Inventário Turístico */}
          {activeSection === 'inventory' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventário Turístico</h2>
                <p className="text-gray-600">Atrações Cadastradas</p>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 mb-8">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Atração
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Users className="h-4 w-4 mr-2" />
                  Adicionar Colaboradores
                </Button>
              </div>

              {/* Grid de Atrações */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attractions.map((attraction) => (
                  <Card key={attraction.id} className="hover:shadow-lg transition-shadow bg-white">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold">{attraction.name}</CardTitle>
                        <Badge 
                          variant={attraction.status === 'active' ? 'default' : 'secondary'}
                          className={attraction.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}
                        >
                          {attraction.status === 'active' ? 'Ativo' : 'Manutenção'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {attraction.type}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {attraction.visitors.toLocaleString()} visitantes
                        </div>
                        <div className="flex justify-end space-x-2 pt-3">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(attraction)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Outras seções */}
          {activeSection === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Visão Geral</h2>
              <p className="text-gray-600">Conteúdo da visão geral...</p>
            </div>
          )}

          {activeSection === 'events' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestão de Eventos</h2>
              <p className="text-gray-600">Conteúdo da gestão de eventos...</p>
            </div>
          )}

          {activeSection === 'cats' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestão de CATS</h2>
              <p className="text-gray-600">Conteúdo da gestão de CATS...</p>
            </div>
          )}

          {activeSection === 'heatmaps' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mapas de Calor</h2>
              <p className="text-gray-600">Conteúdo dos mapas de calor...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Tem certeza que deseja excluir "{attractionToDelete?.name}"?
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
  );
}
