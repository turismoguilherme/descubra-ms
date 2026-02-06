import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Save, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PartnerAvailability {
  id: string;
  partner_id: string;
  service_id: string;
  date: string;
  available: boolean;
  max_guests?: number;
  booked_guests: number;
  notes?: string;
}

interface PartnerPricing {
  id: string;
  service_name: string;
  service_type: string;
}

interface PartnerAvailabilityEditorProps {
  partnerId: string;
  onUpdate?: () => void;
}

export default function PartnerAvailabilityEditor({ partnerId, onUpdate }: PartnerAvailabilityEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricingList, setPricingList] = useState<PartnerPricing[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Map<string, PartnerAvailability>>(new Map());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    available: true,
    max_guests: undefined as number | undefined,
    notes: '',
  });

  useEffect(() => {
    loadPricing();
  }, [partnerId]);

  useEffect(() => {
    if (selectedService) {
      loadAvailability();
    }
  }, [selectedService, currentMonth]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_pricing')
        .select('id, service_name, service_type')
        .eq('partner_id', partnerId)
        .eq('is_active', true)
        .order('service_name');

      if (error) throw error;

      setPricingList(data || []);
      if (data && data.length > 0) {
        setSelectedService(data[0].id);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar preços:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    if (!selectedService) return;

    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from('partner_availability')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('service_id', selectedService)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));

      if (error) throw error;

      const availabilityMap = new Map<string, PartnerAvailability>();
      (data || []).forEach((item) => {
        availabilityMap.set(item.date, item);
      });
      setAvailability(availabilityMap);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar disponibilidade:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a disponibilidade',
        variant: 'destructive',
      });
    }
  };

  const handleDateClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const existing = availability.get(dateString);
    
    setEditingDate(dateString);
    setEditForm({
      available: existing?.available ?? true,
      max_guests: existing?.max_guests,
      notes: existing?.notes || '',
    });
  };

  const handleSaveDate = async () => {
    if (!selectedService || !editingDate) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('partner_availability')
        .upsert({
          partner_id: partnerId,
          service_id: selectedService,
          date: editingDate,
          available: editForm.available,
          max_guests: editForm.max_guests || null,
          notes: editForm.notes || null,
        }, {
          onConflict: 'partner_id,service_id,date',
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Disponibilidade atualizada',
      });

      setEditingDate(null);
      await loadAvailability();
      onUpdate?.();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar disponibilidade:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a disponibilidade',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDate = async (dateString: string) => {
    if (!selectedService) return;

    try {
      const { error } = await supabase
        .from('partner_availability')
        .delete()
        .eq('partner_id', partnerId)
        .eq('service_id', selectedService)
        .eq('date', dateString);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Disponibilidade removida',
      });

      await loadAvailability();
      onUpdate?.();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao remover disponibilidade:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a disponibilidade',
        variant: 'destructive',
      });
    }
  };

  const getDateAvailability = (date: Date): PartnerAvailability | null => {
    const dateString = format(date, 'yyyy-MM-dd');
    return availability.get(dateString) || null;
  };

  const getDateStatus = (date: Date) => {
    const avail = getDateAvailability(date);
    if (!avail) return 'default'; // Sem configuração = disponível por padrão
    if (!avail.available) return 'blocked';
    if (avail.max_guests && avail.booked_guests >= avail.max_guests) return 'full';
    return 'available';
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const selectedPricing = pricingList.find(p => p.id === selectedService);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (pricingList.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Nenhum serviço cadastrado</p>
          <p className="text-sm text-gray-500">
            Adicione serviços na aba "Preços" para gerenciar disponibilidade
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Disponibilidade</h3>
        <p className="text-sm text-gray-600">
          Configure a disponibilidade de cada serviço por data. Clique em uma data para editar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Selecione o Serviço</CardTitle>
              <CardDescription>Escolha o serviço para gerenciar disponibilidade</CardDescription>
            </div>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {pricingList.map((pricing) => (
                  <SelectItem key={pricing.id} value={pricing.id}>
                    {pricing.service_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedService && (
            <div className="space-y-6">
              {/* Navegação do mês */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  ← Mês Anterior
                </Button>
                <h4 className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  Próximo Mês →
                </Button>
              </div>

              {/* Calendário */}
              <div className="grid grid-cols-7 gap-2">
                {/* Cabeçalho dos dias da semana */}
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}

                {/* Dias do mês */}
                {daysInMonth.map((date) => {
                  const dateString = format(date, 'yyyy-MM-dd');
                  const status = getDateStatus(date);
                  const avail = getDateAvailability(date);
                  const isPast = date < new Date();
                  const isToday = isSameDay(date, new Date());
                  const isEditing = editingDate === dateString;

                  return (
                    <button
                      key={dateString}
                      onClick={() => !isPast && handleDateClick(date)}
                      disabled={isPast}
                      className={cn(
                        'relative p-2 rounded-lg border-2 transition-all text-sm',
                        isPast && 'opacity-50 cursor-not-allowed',
                        !isPast && 'hover:border-ms-primary-blue cursor-pointer',
                        isToday && 'ring-2 ring-ms-primary-blue',
                        status === 'blocked' && 'bg-red-100 border-red-300',
                        status === 'full' && 'bg-yellow-100 border-yellow-300',
                        status === 'available' && 'bg-green-50 border-green-200',
                        status === 'default' && 'bg-gray-50 border-gray-200',
                        isEditing && 'ring-2 ring-blue-500 border-blue-500'
                      )}
                    >
                      <div className="font-semibold">{format(date, 'd')}</div>
                      {avail && (
                        <div className="text-xs mt-1">
                          {avail.max_guests && (
                            <div className="text-gray-600">
                              {avail.booked_guests}/{avail.max_guests}
                            </div>
                          )}
                        </div>
                      )}
                      {status === 'blocked' && (
                        <XCircle className="w-3 h-3 absolute top-1 right-1 text-red-500" />
                      )}
                      {status === 'full' && (
                        <AlertCircle className="w-3 h-3 absolute top-1 right-1 text-yellow-500" />
                      )}
                      {status === 'available' && (
                        <CheckCircle2 className="w-3 h-3 absolute top-1 right-1 text-green-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded" />
                  <span>Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded" />
                  <span>Lotado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
                  <span>Bloqueado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded" />
                  <span>Sem configuração</span>
                </div>
              </div>

              {/* Formulário de edição */}
              {editingDate && (
                <Card className="border-2 border-ms-primary-blue">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        Editar: {format(new Date(editingDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setEditingDate(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="available"
                        checked={editForm.available}
                        onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="available">Data disponível</Label>
                    </div>

                    {editForm.available && (
                      <div>
                        <Label htmlFor="max_guests">Número máximo de vagas (opcional)</Label>
                        <Input
                          id="max_guests"
                          type="number"
                          min="1"
                          value={editForm.max_guests || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            max_guests: e.target.value ? parseInt(e.target.value) : undefined,
                          })}
                          placeholder="Deixe vazio para sem limite"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Se não definir, não haverá limite de vagas para esta data
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Input
                        id="notes"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        placeholder="Ex: Feriado, evento especial..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveDate}
                        disabled={saving}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteDate(editingDate)}
                        disabled={saving}
                      >
                        Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

