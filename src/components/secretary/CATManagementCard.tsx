/**
 * Gestão de CATs para Secretarias
 * Cadastro e controle de Centros de Atendimento ao Turista
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Users, 
  Clock, 
  Phone, 
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CAT {
  id: string;
  name: string;
  location: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  workingHours: string;
  status: 'active' | 'inactive' | 'maintenance';
  attendants: Attendant[];
  totalVisitors: number;
  lastActivity: Date;
  createdAt: Date;
}

interface Attendant {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen: Date;
}

interface CATManagementCardProps {
  onAddCAT?: (cat: Omit<CAT, 'id' | 'createdAt' | 'lastActivity'>) => void;
  onEditCAT?: (id: string, cat: Partial<CAT>) => void;
  onDeleteCAT?: (id: string) => void;
}

const CATManagementCard: React.FC<CATManagementCardProps> = ({
  onAddCAT,
  onEditCAT,
  onDeleteCAT
}) => {
  const { toast } = useToast();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estados para modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCAT, setEditingCAT] = useState<CAT | null>(null);
  
  // Dados dos CATs
  const [cats, setCats] = useState<CAT[]>([
    {
      id: '1',
      name: 'CAT Centro',
      location: 'Praça da Liberdade',
      address: 'Praça da Liberdade, 123 - Centro',
      coordinates: { lat: -20.4646, lng: -54.6222 },
      phone: '(67) 99999-9999',
      email: 'cat.centro@bonito.ms.gov.br',
      workingHours: '08:00 - 18:00',
      status: 'active',
      attendants: [
        { id: '1', name: 'Ana Silva', status: 'online', lastSeen: new Date() },
        { id: '2', name: 'Carlos Santos', status: 'offline', lastSeen: new Date(Date.now() - 3600000) }
      ],
      totalVisitors: 1250,
      lastActivity: new Date(),
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'CAT Aeroporto',
      location: 'Aeroporto Internacional',
      address: 'Aeroporto Internacional de Bonito',
      coordinates: { lat: -20.4646, lng: -54.6222 },
      phone: '(67) 99999-8888',
      email: 'cat.aeroporto@bonito.ms.gov.br',
      workingHours: '06:00 - 22:00',
      status: 'active',
      attendants: [
        { id: '3', name: 'Maria Oliveira', status: 'online', lastSeen: new Date() }
      ],
      totalVisitors: 890,
      lastActivity: new Date(),
      createdAt: new Date('2024-02-01')
    }
  ]);

  // Filtrar CATs
  const filteredCats = cats.filter(cat => {
    const matchesStatus = filterStatus === 'all' || cat.status === filterStatus;
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cat.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'maintenance': return <AlertCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const getAttendantStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddCAT = () => {
    setEditingCAT(null);
    setShowAddModal(true);
  };

  const handleEditCAT = (cat: CAT) => {
    setEditingCAT(cat);
    setShowAddModal(true);
  };

  const handleDeleteCAT = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este CAT?')) {
      setCats(prev => prev.filter(cat => cat.id !== id));
      onDeleteCAT?.(id);
      toast({
        title: 'CAT excluído',
        description: 'O CAT foi excluído com sucesso.',
      });
    }
  };

  const handleSaveCAT = (catData: any) => {
    if (editingCAT) {
      // Editar CAT existente
      setCats(prev => prev.map(cat => 
        cat.id === editingCAT.id 
          ? { ...cat, ...catData, lastActivity: new Date() }
          : cat
      ));
      onEditCAT?.(editingCAT.id, catData);
      toast({
        title: 'CAT atualizado',
        description: 'O CAT foi atualizado com sucesso.',
      });
    } else {
      // Adicionar novo CAT
      const newCAT: CAT = {
        ...catData,
        id: Date.now().toString(),
        attendants: [],
        totalVisitors: 0,
        lastActivity: new Date(),
        createdAt: new Date()
      };
      setCats(prev => [...prev, newCAT]);
      onAddCAT?.(catData);
      toast({
        title: 'CAT criado',
        description: 'O CAT foi criado com sucesso.',
      });
    }
    setShowAddModal(false);
    setEditingCAT(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de CATs</h2>
          <p className="text-gray-600">Centros de Atendimento ao Turista</p>
        </div>
        <Button onClick={handleAddCAT} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar CAT
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="maintenance">Manutenção</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de CATs */}
      <div className="grid gap-4">
        {filteredCats.map((cat) => (
          <Card key={cat.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                    <Badge className={getStatusColor(cat.status)}>
                      {getStatusIcon(cat.status)}
                      <span className="ml-1 capitalize">{cat.status}</span>
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{cat.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{cat.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{cat.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{cat.workingHours}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCAT(cat)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCAT(cat.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Atendentes */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Atendentes</h4>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {cat.attendants.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {cat.attendants.map((attendant) => (
                    <div key={attendant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          attendant.status === 'online' ? 'bg-green-500' : 
                          attendant.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm text-gray-700">{attendant.name}</span>
                      </div>
                      <Badge className={getAttendantStatusColor(attendant.status)}>
                        <span className="text-xs capitalize">{attendant.status}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estatísticas */}
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total de Visitantes:</span>
                    <span className="ml-2 font-medium">{cat.totalVisitors.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Última Atividade:</span>
                    <span className="ml-2 font-medium">
                      {cat.lastActivity.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Adicionar/Editar CAT */}
      {showAddModal && (
        <CATForm
          cat={editingCAT}
          onSave={handleSaveCAT}
          onCancel={() => {
            setShowAddModal(false);
            setEditingCAT(null);
          }}
        />
      )}
    </div>
  );
};

// Componente de Formulário para CAT
interface CATFormProps {
  cat?: CAT | null;
  onSave: (catData: any) => void;
  onCancel: () => void;
}

const CATForm: React.FC<CATFormProps> = ({ cat, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: cat?.name || '',
    location: cat?.location || '',
    address: cat?.address || '',
    phone: cat?.phone || '',
    email: cat?.email || '',
    workingHours: cat?.workingHours || '',
    status: cat?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader>
          <CardTitle>{cat ? 'Editar CAT' : 'Adicionar Novo CAT'}</CardTitle>
        </CardHeader>
        <CardContent>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do CAT *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: CAT Bonito - Centro"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Bonito - MS"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Ex: Rua Principal, 123 - Centro"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Ex: (67) 99999-9999"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Ex: cat@bonito.ms.gov.br"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workingHours">Horário de Funcionamento</Label>
              <Input
                id="workingHours"
                value={formData.workingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, workingHours: e.target.value }))}
                placeholder="Ex: 08:00 - 18:00"
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {cat ? 'Atualizar' : 'Criar'} CAT
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CATManagementCard;