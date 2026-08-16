// @ts-nocheck
/**
 * Gestão de Atendentes para Secretarias
 * Controle e monitoramento de atendentes dos CATs
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  Phone, 
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Star,
  TrendingUp,
  Calendar,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Attendant {
  id: string;
  name: string;
  email: string;
  phone: string;
  catId: string;
  catName: string;
  status: 'online' | 'offline' | 'busy' | 'break';
  lastCheckIn?: Date;
  lastCheckOut?: Date;
  totalHours: number;
  totalDays: number;
  rating: number;
  totalVisitors: number;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

interface AttendanceRecord {
  id: string;
  attendantId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  totalHours?: number;
  location: string;
  notes?: string;
}

const AttendantManagementCard: React.FC = () => {
  const { toast } = useToast();
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAttendant, setEditingAttendant] = useState<Attendant | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCAT, setFilterCAT] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dados mockados para demonstração
  const mockAttendants: Attendant[] = [
    {
      id: '1',
      name: 'João Atendente',
      email: 'joao@cat-bonito.ms.gov.br',
      phone: '(67) 99999-9999',
      catId: '1',
      catName: 'CAT Bonito - Centro',
      status: 'online',
      lastCheckIn: new Date(),
      totalHours: 120,
      totalDays: 15,
      rating: 4.8,
      totalVisitors: 125,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastActivity: new Date()
    },
    {
      id: '2',
      name: 'Maria Atendente',
      email: 'maria@cat-cg.ms.gov.br',
      phone: '(67) 88888-8888',
      catId: '2',
      catName: 'CAT Campo Grande - Aeroporto',
      status: 'offline',
      lastCheckOut: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      totalHours: 95,
      totalDays: 12,
      rating: 4.9,
      totalVisitors: 98,
      isActive: true,
      createdAt: new Date('2024-01-10'),
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Pedro Atendente',
      email: 'pedro@cat-dourados.ms.gov.br',
      phone: '(67) 77777-7777',
      catId: '3',
      catName: 'CAT Dourados - Rodoviária',
      status: 'busy',
      lastCheckIn: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      totalHours: 80,
      totalDays: 10,
      rating: 4.7,
      totalVisitors: 76,
      isActive: true,
      createdAt: new Date('2024-01-20'),
      lastActivity: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '4',
      name: 'Ana Atendente',
      email: 'ana@cat-bonito.ms.gov.br',
      phone: '(67) 66666-6666',
      catId: '1',
      catName: 'CAT Bonito - Centro',
      status: 'break',
      lastCheckIn: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
      totalHours: 65,
      totalDays: 8,
      rating: 4.6,
      totalVisitors: 54,
      isActive: true,
      createdAt: new Date('2024-01-25'),
      lastActivity: new Date(Date.now() - 10 * 60 * 1000)
    }
  ];

  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      attendantId: '1',
      checkInTime: new Date('2024-01-30T08:00:00'),
      checkOutTime: new Date('2024-01-30T17:00:00'),
      totalHours: 9,
      location: 'CAT Bonito - Centro',
      notes: 'Atendimento normal'
    },
    {
      id: '2',
      attendantId: '2',
      checkInTime: new Date('2024-01-30T06:00:00'),
      checkOutTime: new Date('2024-01-30T14:00:00'),
      totalHours: 8,
      location: 'CAT Campo Grande - Aeroporto',
      notes: 'Alta demanda no aeroporto'
    }
  ];

  useEffect(() => {
    setAttendants(mockAttendants);
    setAttendanceRecords(mockAttendanceRecords);
  }, []);

  const filteredAttendants = attendants.filter(attendant => {
    const matchesStatus = filterStatus === 'all' || attendant.status === filterStatus;
    const matchesCAT = filterCAT === 'all' || attendant.catId === filterCAT;
    const matchesSearch = attendant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendant.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCAT && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'break': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      case 'busy': return <AlertCircle className="h-4 w-4" />;
      case 'break': return <Clock className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const handleAddAttendant = () => {
    setEditingAttendant(null);
    setShowForm(true);
  };

  const handleEditAttendant = (attendant: Attendant) => {
    setEditingAttendant(attendant);
    setShowForm(true);
  };

  const handleDeleteAttendant = (attendantId: string) => {
    setAttendants(prev => prev.filter(attendant => attendant.id !== attendantId));
    toast({
      title: "Atendente removido",
      description: "Atendente removido com sucesso"
    });
  };

  const handleSaveAttendant = (attendantData: Partial<Attendant>) => {
    if (editingAttendant) {
      // Editar atendente existente
      setAttendants(prev => prev.map(attendant => 
        attendant.id === editingAttendant.id 
          ? { ...attendant, ...attendantData }
          : attendant
      ));
      toast({
        title: "Atendente atualizado",
        description: "Atendente atualizado com sucesso"
      });
    } else {
      // Adicionar novo atendente
      const newAttendant: Attendant = {
        id: Date.now().toString(),
        name: attendantData.name || '',
        email: attendantData.email || '',
        phone: attendantData.phone || '',
        catId: attendantData.catId || '',
        catName: attendantData.catName || '',
        status: 'offline',
        totalHours: 0,
        totalDays: 0,
        rating: 0,
        totalVisitors: 0,
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date(),
        ...attendantData
      };
      
      setAttendants(prev => [newAttendant, ...prev]);
      toast({
        title: "Atendente adicionado",
        description: "Novo atendente criado com sucesso"
      });
    }
    
    setShowForm(false);
    setEditingAttendant(null);
  };

  const getCATs = () => {
    const cats = [...new Set(attendants.map(a => ({ id: a.catId, name: a.catName })))];
    return cats;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Atendentes</h2>
          <p className="text-gray-600">Controle e monitoramento dos atendentes</p>
        </div>
        <Button onClick={handleAddAttendant} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Adicionar Atendente</span>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{attendants.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendants.filter(a => a.status === 'online').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Trabalhadas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {attendants.reduce((total, a) => total + a.totalHours, 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(attendants.reduce((total, a) => total + a.rating, 0) / attendants.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar atendentes..."
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
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="busy">Ocupado</SelectItem>
            <SelectItem value="break">Pausa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCAT} onValueChange={setFilterCAT}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por CAT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os CATs</SelectItem>
            {getCATs().map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Atendentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAttendants.map((attendant) => (
          <Card key={attendant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{attendant.name}</CardTitle>
                  <p className="text-sm text-gray-600">{attendant.catName}</p>
                </div>
                <Badge className={getStatusColor(attendant.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(attendant.status)}
                    <span className="capitalize">{attendant.status}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Informações de contato */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{attendant.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{attendant.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{attendant.catName}</span>
                </div>
              </div>

              {/* Status atual */}
              {attendant.status === 'online' && attendant.lastCheckIn && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Em atendimento desde {formatTimeAgo(attendant.lastCheckIn)}
                    </span>
                  </div>
                </div>
              )}

              {attendant.status === 'offline' && attendant.lastCheckOut && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Saiu há {formatTimeAgo(attendant.lastCheckOut)}
                    </span>
                  </div>
                </div>
              )}

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{attendant.totalHours}h</p>
                  <p className="text-xs text-gray-600">Horas trabalhadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{attendant.rating}⭐</p>
                  <p className="text-xs text-gray-600">Avaliação</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{attendant.totalVisitors}</p>
                  <p className="text-xs text-gray-600">Visitantes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{attendant.totalDays}</p>
                  <p className="text-xs text-gray-600">Dias trabalhados</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex space-x-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditAttendant(attendant)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteAttendant(attendant.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário de Atendente */}
      {showForm && (
        <AttendantForm
          attendant={editingAttendant}
          cats={getCATs()}
          onSave={handleSaveAttendant}
          onCancel={() => {
            setShowForm(false);
            setEditingAttendant(null);
          }}
        />
      )}
    </div>
  );
};

// Componente de formulário para Atendente
interface AttendantFormProps {
  attendant: Attendant | null;
  cats: { id: string; name: string }[];
  onSave: (data: Partial<Attendant>) => void;
  onCancel: () => void;
}

const AttendantForm: React.FC<AttendantFormProps> = ({ attendant, cats, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: attendant?.name || '',
    email: attendant?.email || '',
    phone: attendant?.phone || '',
    catId: attendant?.catId || '',
    catName: attendant?.catName || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCAT = cats.find(cat => cat.id === formData.catId);
    onSave({
      ...formData,
      catName: selectedCAT?.name || ''
    });
  };

  return (
    <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <CardContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">
          {attendant ? 'Editar Atendente' : 'Adicionar Novo Atendente'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Atendente *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: João Silva"
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
                placeholder="Ex: joao@cat-bonito.ms.gov.br"
                required
              />
            </div>
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
              <Label htmlFor="catId">CAT *</Label>
              <Select value={formData.catId} onValueChange={(value) => setFormData(prev => ({ ...prev, catId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o CAT" />
                </SelectTrigger>
                <SelectContent>
                  {cats.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {attendant ? 'Atualizar' : 'Criar'} Atendente
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendantManagementCard;
