import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  TrendingUp,
  Eye,
  Map,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  catLocationService, 
  CATLocation, 
  AttendanceRecord, 
  CATStats 
} from '@/services/catLocationService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CATManagementProps {
  userRole: string;
  userRegion?: string;
}

const CATManagement = ({ userRole, userRegion }: CATManagementProps) => {
  const [cats, setCats] = useState<CATLocation[]>([]);
  const [activeAttendants, setActiveAttendants] = useState<AttendanceRecord[]>([]);
  const [catStats, setCatStats] = useState<CATStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCAT, setEditingCAT] = useState<CATLocation | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    region: userRegion || '',
    latitude: '',
    longitude: '',
    tolerance_meters: '50',
    phone: '',
    email: '',
    manager_name: '',
    services: [] as string[],
    hours: {
      monday: '08:00-18:00',
      tuesday: '08:00-18:00',
      wednesday: '08:00-18:00',
      thursday: '08:00-18:00',
      friday: '08:00-18:00',
      saturday: '09:00-17:00',
      sunday: '09:00-17:00'
    }
  });

  const availableServices = [
    'Informações turísticas',
    'Reservas de hotéis',
    'Venda de passagens',
    'Aluguel de veículos',
    'Guias turísticos',
    'Eventos culturais',
    'Produtos regionais',
    'Assistência médica',
    'Segurança turística'
  ];

  useEffect(() => {
    loadData();
  }, [selectedTimeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsData, attendantsData, statsData] = await Promise.all([
        catLocationService.getAllCATs(),
        catLocationService.getActiveAttendants(),
        catLocationService.getCATStats(undefined, {
          start: new Date(Date.now() - parseInt(selectedTimeRange) * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        })
      ]);

      setCats(catsData);
      setActiveAttendants(attendantsData);
      setCatStats(statsData);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos CATs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      toast({
        title: "Dados obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const catData = {
        ...formData,
        coordinates: {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude)
        },
        tolerance_meters: parseInt(formData.tolerance_meters),
        contact: {
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          manager_name: formData.manager_name || undefined
        },
        active: true
      };

      if (editingCAT) {
        await catLocationService.updateCAT(editingCAT.id, catData);
        toast({
          title: "CAT Atualizado",
          description: "CAT atualizado com sucesso"
        });
      } else {
        await catLocationService.createCAT(catData);
        toast({
          title: "CAT Cadastrado",
          description: "CAT cadastrado com sucesso"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('❌ Erro ao salvar CAT:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o CAT",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (cat: CATLocation) => {
    setEditingCAT(cat);
    setFormData({
      name: cat.name,
      description: cat.description,
      address: cat.address,
      city: cat.city,
      region: cat.region,
      latitude: cat.coordinates.lat.toString(),
      longitude: cat.coordinates.lng.toString(),
      tolerance_meters: cat.tolerance_meters.toString(),
      phone: cat.contact?.phone || '',
      email: cat.contact?.email || '',
      manager_name: cat.contact?.manager_name || '',
      services: cat.services,
      hours: cat.hours
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (catId: string) => {
    if (!confirm('Tem certeza que deseja desativar este CAT?')) return;

    try {
      await catLocationService.updateCAT(catId, { active: false });
      toast({
        title: "CAT Desativado",
        description: "CAT desativado com sucesso"
      });
      loadData();
    } catch (error) {
      console.error('❌ Erro ao desativar CAT:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar o CAT",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      region: userRegion || '',
      latitude: '',
      longitude: '',
      tolerance_meters: '50',
      phone: '',
      email: '',
      manager_name: '',
      services: [],
      hours: {
        monday: '08:00-18:00',
        tuesday: '08:00-18:00',
        wednesday: '08:00-18:00',
        thursday: '08:00-18:00',
        friday: '08:00-18:00',
        saturday: '09:00-17:00',
        sunday: '09:00-17:00'
      }
    });
    setEditingCAT(null);
  };

  const getCurrentAttendants = (catId: string) => {
    return activeAttendants.filter(att => att.cat_id === catId).length;
  };

  const getCATStats = (catId: string) => {
    return catStats.find(stat => stat.cat_id === catId);
  };

  const exportReport = () => {
    const report = {
      cats: cats,
      active_attendants: activeAttendants,
      stats: catStats,
      generated_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cat_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório Exportado",
      description: "Relatório baixado com sucesso"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de CATs</h2>
          <p className="text-gray-600">Gerencie os Centros de Atendimento ao Turista</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo CAT
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCAT ? 'Editar CAT' : 'Cadastrar Novo CAT'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do CAT *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: CAT Centro"
                    />
                  </div>
                  <div>
                    <Label>Cidade *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Ex: Campo Grande"
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descreva o CAT e seus serviços..."
                  />
                </div>

                <div>
                  <Label>Endereço Completo *</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Ex: Av. Afonso Pena, 123 - Centro"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Latitude *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      placeholder="Ex: -20.4486"
                    />
                  </div>
                  <div>
                    <Label>Longitude *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      placeholder="Ex: -54.6295"
                    />
                  </div>
                  <div>
                    <Label>Tolerância (metros)</Label>
                    <Input
                      type="number"
                      value={formData.tolerance_meters}
                      onChange={(e) => setFormData({...formData, tolerance_meters: e.target.value})}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(67) 3314-9966"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="cat@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <Label>Responsável</Label>
                  <Input
                    value={formData.manager_name}
                    onChange={(e) => setFormData({...formData, manager_name: e.target.value})}
                    placeholder="Nome do responsável"
                  />
                </div>

                <div>
                  <Label>Serviços Oferecidos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {availableServices.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={formData.services.includes(service)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                services: [...formData.services, service]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                services: formData.services.filter(s => s !== service)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={service} className="text-sm">{service}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCAT ? 'Atualizar CAT' : 'Cadastrar CAT'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de CATs</p>
                <p className="text-2xl font-bold">{cats.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atendentes Ativos</p>
                <p className="text-2xl font-bold">{activeAttendants.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Trabalhadas</p>
                <p className="text-2xl font-bold">
                  {catStats.reduce((sum, stat) => sum + stat.total_hours_worked, 0).toFixed(0)}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Presença</p>
                <p className="text-2xl font-bold">
                  {catStats.length > 0 
                    ? (catStats.reduce((sum, stat) => sum + stat.attendance_rate, 0) / catStats.length).toFixed(1)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de CATs */}
      <Card>
        <CardHeader>
          <CardTitle>CATs Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : cats.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum CAT cadastrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cats.map((cat) => {
                const stats = getCATStats(cat.id);
                const currentAttendants = getCurrentAttendants(cat.id);
                
                return (
                  <div key={cat.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{cat.name}</h3>
                          <Badge variant={cat.active ? "default" : "secondary"}>
                            {cat.active ? "Ativo" : "Inativo"}
                          </Badge>
                          {currentAttendants > 0 && (
                            <Badge variant="outline" className="text-green-600">
                              {currentAttendants} ativo(s)
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{cat.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Localização:</span>
                            <p className="text-gray-600">{cat.address}, {cat.city}</p>
                            <p className="text-gray-500 text-xs">
                              {cat.coordinates.lat.toFixed(6)}, {cat.coordinates.lng.toFixed(6)}
                            </p>
                          </div>
                          
                          <div>
                            <span className="font-medium">Contato:</span>
                            {cat.contact?.phone && <p className="text-gray-600">{cat.contact.phone}</p>}
                            {cat.contact?.email && <p className="text-gray-600">{cat.contact.email}</p>}
                            {cat.contact?.manager_name && (
                              <p className="text-gray-600">Responsável: {cat.contact.manager_name}</p>
                            )}
                          </div>
                          
                          <div>
                            <span className="font-medium">Estatísticas ({selectedTimeRange} dias):</span>
                            {stats ? (
                              <div className="text-gray-600">
                                <p>Dias trabalhados: {stats.total_attendance_days}</p>
                                <p>Horas: {stats.total_hours_worked.toFixed(1)}h</p>
                                <p>Presença: {stats.attendance_rate.toFixed(1)}%</p>
                              </div>
                            ) : (
                              <p className="text-gray-500">Sem dados</p>
                            )}
                          </div>
                        </div>
                        
                        {cat.services.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium text-sm">Serviços:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {cat.services.map((service) => (
                                <Badge key={service} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cat)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CATManagement; 