/**
 * Tourist Service Registration Component
 * Componente para registro rápido de atendimentos presenciais aos turistas
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  Clock, 
  MapPin, 
  Star, 
  Save, 
  X,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { touristServiceService, TouristService } from '@/services/public/touristServiceService';

interface TouristServiceRegistrationProps {
  catName?: string;
}

const TouristServiceRegistration: React.FC<TouristServiceRegistrationProps> = ({ catName = 'CAT Centro' }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [todayServices, setTodayServices] = useState<TouristService[]>([]);
  const [formData, setFormData] = useState<Partial<TouristService>>({
    service_type: 'informacao',
    service_duration_minutes: undefined,
    satisfaction_rating: undefined,
  });

  useEffect(() => {
    loadTodayServices();
  }, [user]);

  const loadTodayServices = async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const services = await touristServiceService.getAttendantServices(
        user.id,
        today,
        tomorrow
      );
      setTodayServices(services);
    } catch (error) {
      console.error('Erro ao carregar atendimentos do dia:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const service: TouristService = {
        attendant_id: user.id,
        cat_name: catName,
        service_date: new Date(),
        service_type: formData.service_type || 'informacao',
        tourist_origin_country: formData.tourist_origin_country || undefined,
        tourist_origin_state: formData.tourist_origin_state || undefined,
        tourist_origin_city: formData.tourist_origin_city || undefined,
        tourist_motive: formData.tourist_motive || undefined,
        service_duration_minutes: formData.service_duration_minutes || undefined,
        satisfaction_rating: formData.satisfaction_rating || undefined,
        notes: formData.notes || undefined,
      };

      await touristServiceService.createService(service);

      toast({
        title: 'Sucesso',
        description: 'Atendimento registrado com sucesso!',
      });

      // Limpar formulário
      setFormData({
        service_type: 'informacao',
        service_duration_minutes: undefined,
        satisfaction_rating: undefined,
      });

      // Recarregar lista
      await loadTodayServices();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao registrar atendimento:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível registrar o atendimento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      informacao: 'Informação',
      orientacao: 'Orientação',
      venda: 'Venda',
      reclamacao: 'Reclamação',
      outro: 'Outro',
    };
    return labels[type] || type;
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Card de Resumo do Dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Registro de Atendimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm text-slate-600">Atendimentos hoje</p>
              <p className="text-3xl font-bold text-blue-900">{todayServices.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Local</p>
              <p className="text-lg font-semibold text-blue-900">{catName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Registro Rápido */}
      <Card>
        <CardHeader>
          <CardTitle>Novo Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Atendimento */}
              <div>
                <Label htmlFor="service_type">Tipo de Atendimento *</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData({ ...formData, service_type: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informacao">Informação</SelectItem>
                    <SelectItem value="orientacao">Orientação</SelectItem>
                    <SelectItem value="venda">Venda</SelectItem>
                    <SelectItem value="reclamacao">Reclamação</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duração */}
              <div>
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.service_duration_minutes || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    service_duration_minutes: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  className="mt-1"
                  placeholder="Ex: 15"
                />
              </div>
            </div>

            {/* Origem do Turista */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.tourist_origin_country || ''}
                  onChange={(e) => setFormData({ ...formData, tourist_origin_country: e.target.value })}
                  className="mt-1"
                  placeholder="Ex: Brasil"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.tourist_origin_state || ''}
                  onChange={(e) => setFormData({ ...formData, tourist_origin_state: e.target.value })}
                  className="mt-1"
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.tourist_origin_city || ''}
                  onChange={(e) => setFormData({ ...formData, tourist_origin_city: e.target.value })}
                  className="mt-1"
                  placeholder="Ex: São Paulo"
                />
              </div>
            </div>

            {/* Motivo */}
            <div>
              <Label htmlFor="motive">Motivo da Visita</Label>
              <Textarea
                id="motive"
                value={formData.tourist_motive || ''}
                onChange={(e) => setFormData({ ...formData, tourist_motive: e.target.value })}
                className="mt-1"
                placeholder="Descreva o motivo da visita ou interesse do turista..."
                rows={2}
              />
            </div>

            {/* Satisfação */}
            <div>
              <Label htmlFor="satisfaction">Satisfação (1-5)</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, satisfaction_rating: rating })}
                    className={`p-2 rounded-lg transition-colors ${
                      formData.satisfaction_rating === rating
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        formData.satisfaction_rating && formData.satisfaction_rating >= rating
                          ? 'fill-current'
                          : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1"
                placeholder="Observações adicionais sobre o atendimento..."
                rows={2}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Registrar Atendimento
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    service_type: 'informacao',
                    service_duration_minutes: undefined,
                    satisfaction_rating: undefined,
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Atendimentos do Dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Atendimentos de Hoje
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadTodayServices}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayServices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum atendimento registrado hoje.
            </p>
          ) : (
            <div className="space-y-3">
              {todayServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {getServiceTypeLabel(service.service_type)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatTime(service.service_date)}
                      </span>
                      {service.service_duration_minutes && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.service_duration_minutes} min
                        </span>
                      )}
                    </div>
                    {(service.tourist_origin_country || service.tourist_origin_state || service.tourist_origin_city) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <MapPin className="h-3 w-3" />
                        {[
                          service.tourist_origin_city,
                          service.tourist_origin_state,
                          service.tourist_origin_country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                    {service.tourist_motive && (
                      <p className="text-sm text-gray-700 mt-1">{service.tourist_motive}</p>
                    )}
                    {service.satisfaction_rating && (
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className={`h-4 w-4 ${
                              rating <= service.satisfaction_rating!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TouristServiceRegistration;

