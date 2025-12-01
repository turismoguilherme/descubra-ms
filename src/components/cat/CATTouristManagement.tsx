/**
 * CAT Tourist Management
 * Gestão padronizada de turistas para atendentes dos CATs
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Plus, 
  Star, 
  MapPin,
  Phone,
  Mail,
  Eye,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { touristService, Tourist } from '@/services/cat/touristService';
import { attendanceService } from '@/services/cat/attendanceService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CATTouristManagementProps {
  catId?: string;
}

const CATTouristManagement: React.FC<CATTouristManagementProps> = ({ catId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [touristStats, setTouristStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    origin_country: '',
    origin_state: '',
    origin_city: '',
    email: '',
    phone: '',
    interests: [] as string[]
  });

  useEffect(() => {
    if (user?.id) {
      loadTourists();
      loadTouristStats();
    }
  }, [user, catId]);

  const loadTourists = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await touristService.getTourists({
        attendant_id: user.id,
        cat_id: catId,
        startDate: new Date().toISOString().split('T')[0]
      });
      setTourists(data);
    } catch (error) {
      console.error('Erro ao carregar turistas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os turistas',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTouristStats = async () => {
    if (!user?.id) return;
    try {
      const stats = await touristService.getTouristStats({
        attendant_id: user.id
      });
      setTouristStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleRegisterTourist = async () => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await touristService.registerTourist({
        cat_id: catId,
        attendant_id: user.id,
        ...formData
      });

      toast({
        title: 'Sucesso',
        description: 'Turista registrado com sucesso'
      });

      setFormData({
        name: '',
        origin_country: '',
        origin_state: '',
        origin_city: '',
        email: '',
        phone: '',
        interests: []
      });
      setShowForm(false);
      await loadTourists();
      await loadTouristStats();
    } catch (error) {
      console.error('Erro ao registrar turista:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o turista',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterAttendance = async (touristId: string) => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    try {
      await attendanceService.saveAttendanceRecord({
        attendant_id: user.id,
        cat_id: catId,
        tourist_id: touristId,
        service_type: 'information',
        topic: 'Atendimento geral',
        duration_minutes: 5,
        language: 'pt-BR',
        resolved: true
      });

      toast({
        title: 'Sucesso',
        description: 'Atendimento registrado com sucesso'
      });

      await loadTourists();
    } catch (error) {
      console.error('Erro ao registrar atendimento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o atendimento',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <SectionWrapper 
        variant="default" 
        title="Gestão de Turistas"
        actions={
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Turista
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <CardBox>
            <div className="text-3xl font-bold text-blue-600 mb-2 text-center">
              {touristStats?.today || 0}
            </div>
            <div className="text-sm text-slate-600 text-center">Turistas Hoje</div>
          </CardBox>
          
          <CardBox>
            <div className="text-3xl font-bold text-green-600 mb-2 text-center">
              {touristStats?.averageRating?.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-slate-600 text-center">Avaliação Média</div>
          </CardBox>
          
          <CardBox>
            <div className="text-3xl font-bold text-purple-600 mb-2 text-center">
              {touristStats?.thisWeek || 0}
            </div>
            <div className="text-sm text-slate-600 text-center">Esta Semana</div>
          </CardBox>
          
          <CardBox>
            <div className="text-3xl font-bold text-orange-600 mb-2 text-center">
              {touristStats?.thisMonth || 0}
            </div>
            <div className="text-sm text-slate-600 text-center">Este Mês</div>
          </CardBox>
        </div>
      </SectionWrapper>

      {/* Formulário de Registro */}
      {showForm && (
        <SectionWrapper 
          variant="default" 
          title="Registrar Novo Turista"
        >
          <CardBox>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do turista"
                />
              </div>

              <div>
                <Label htmlFor="origin_country">País de Origem</Label>
                <Input
                  id="origin_country"
                  value={formData.origin_country}
                  onChange={(e) => setFormData({ ...formData, origin_country: e.target.value })}
                  placeholder="Ex: Brasil"
                />
              </div>

              <div>
                <Label htmlFor="origin_state">Estado</Label>
                <Input
                  id="origin_state"
                  value={formData.origin_state}
                  onChange={(e) => setFormData({ ...formData, origin_state: e.target.value })}
                  placeholder="Ex: São Paulo"
                />
              </div>

              <div>
                <Label htmlFor="origin_city">Cidade</Label>
                <Input
                  id="origin_city"
                  value={formData.origin_city}
                  onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                  placeholder="Ex: São Paulo"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleRegisterTourist}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    name: '',
                    origin_country: '',
                    origin_state: '',
                    origin_city: '',
                    email: '',
                    phone: '',
                    interests: []
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardBox>
        </SectionWrapper>
      )}

      {/* Lista de Turistas */}
      <SectionWrapper 
        variant="default" 
        title="Turistas Atendidos Hoje"
        subtitle={`${tourists.length} turista(s) registrado(s)`}
      >
        {isLoading ? (
          <CardBox>
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          </CardBox>
        ) : tourists.length === 0 ? (
          <CardBox>
            <p className="text-center text-slate-500 py-8">
              Nenhum turista atendido hoje.
            </p>
          </CardBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tourists.map((tourist) => (
              <CardBox key={tourist.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">
                      {tourist.name || 'Sem nome'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {tourist.origin_city && tourist.origin_state 
                        ? `${tourist.origin_city}, ${tourist.origin_state}`
                        : tourist.origin_country || 'Origem não informada'}
                    </p>
                  </div>
                  {tourist.rating && (
                    <span className="rounded-full text-xs font-medium px-2 py-1 bg-green-100 text-green-700">
                      <Star className="h-3 w-3 inline mr-1" />
                      {tourist.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {tourist.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="h-3 w-3" />
                      {tourist.email}
                    </div>
                  )}
                  {tourist.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="h-3 w-3" />
                      {tourist.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {new Date(tourist.visit_time).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-slate-700 text-sm hover:bg-slate-50"
                    onClick={() => handleRegisterAttendance(tourist.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Registrar Atendimento
                  </Button>
                </div>
              </CardBox>
            ))}
          </div>
        )}
      </SectionWrapper>
    </div>
  );
};

export default CATTouristManagement;




























