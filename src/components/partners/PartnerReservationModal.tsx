import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Users, DollarSign, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PartnerPricing {
  id: string;
  service_name: string;
  pricing_type: 'fixed' | 'per_person' | 'per_night' | 'package';
  base_price: number;
  price_per_person?: number;
  price_per_night?: number;
  min_guests: number;
  max_guests?: number;
  description?: string;
}

interface PartnerReservationModalProps {
  partnerId: string;
  partnerName: string;
  isOpen: boolean;
  onClose: () => void;
  suggestedDate?: string;
  suggestedGuests?: number;
}

export function PartnerReservationModal({
  partnerId,
  partnerName,
  isOpen,
  onClose,
  suggestedDate,
  suggestedGuests = 2,
}: PartnerReservationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pricingList, setPricingList] = useState<PartnerPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [selectedService, setSelectedService] = useState<string>('');
  const [reservationDate, setReservationDate] = useState(suggestedDate || '');
  const [reservationTime, setReservationTime] = useState('');
  const [guests, setGuests] = useState(suggestedGuests);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (isOpen && partnerId) {
      loadPricing();
    }
  }, [isOpen, partnerId]);

  useEffect(() => {
    if (suggestedDate) {
      setReservationDate(suggestedDate);
    }
    if (suggestedGuests) {
      setGuests(suggestedGuests);
    }
  }, [suggestedDate, suggestedGuests]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_pricing')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('Parceiro não tem preços cadastrados');
          setPricingList([]);
          return;
        }
        throw error;
      }

      setPricingList(data || []);
      if (data && data.length > 0) {
        setSelectedService(data[0].id);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar preços:', err);
      setPricingList([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedPricing = pricingList.find(p => p.id === selectedService);

  const calculateTotal = () => {
    if (!selectedPricing) return 0;

    let total = selectedPricing.base_price;

    if (selectedPricing.pricing_type === 'per_person' && selectedPricing.price_per_person) {
      total = selectedPricing.base_price + (selectedPricing.price_per_person * guests);
    } else if (selectedPricing.pricing_type === 'per_night' && selectedPricing.price_per_night) {
      total = selectedPricing.base_price + (selectedPricing.price_per_night * 1);
    }

    return total;
  };

  const handleReserve = async () => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para fazer uma reserva',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedService || !reservationDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione um serviço e uma data',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedPricing) return;

    if (guests < selectedPricing.min_guests) {
      toast({
        title: 'Número mínimo de pessoas',
        description: `Este serviço requer no mínimo ${selectedPricing.min_guests} ${selectedPricing.min_guests === 1 ? 'pessoa' : 'pessoas'}`,
        variant: 'destructive',
      });
      return;
    }

    if (selectedPricing.max_guests && guests > selectedPricing.max_guests) {
      toast({
        title: 'Número máximo de pessoas',
        description: `Este serviço aceita no máximo ${selectedPricing.max_guests} pessoas`,
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const totalAmount = calculateTotal();

      // Chamar Edge Function para criar checkout
      const { data, error } = await supabase.functions.invoke('reservation-checkout', {
        body: {
          partnerId,
          reservationType: 'other',
          serviceName: selectedPricing.service_name,
          reservationDate,
          reservationTime: reservationTime || null,
          guests,
          totalAmount,
          guestName: user.user_metadata?.full_name || user.email,
          guestEmail: user.email,
          guestPhone: user.user_metadata?.phone || null,
          specialRequests: specialRequests || null,
          successUrl: `${window.location.origin}/descubrams/profile?reservation_success=true`,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        // Redirecionar para Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao criar reserva:', err);
      toast({
        title: 'Erro ao criar reserva',
        description: err.message || 'Não foi possível criar a reserva. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-ms-primary-blue" />
            Fazer Reserva com {partnerName}
          </DialogTitle>
          <DialogDescription>
            Complete os dados abaixo para fazer sua reserva. O pagamento será processado de forma segura.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-ms-primary-blue mx-auto mb-4" />
            <p className="text-gray-500">Carregando informações...</p>
          </div>
        ) : pricingList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Este parceiro ainda não cadastrou preços. Entre em contato diretamente.
            </p>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="service-select">Serviço *</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-select">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {pricingList.map((pricing) => (
                    <SelectItem key={pricing.id} value={pricing.id}>
                      {pricing.service_name} - R$ {pricing.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPricing?.description && (
                <p className="text-xs text-gray-500 mt-1">{selectedPricing.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reservation-date">Data *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Input
                    id="reservation-date"
                    type="date"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reservation-time">Horário (opcional)</Label>
                <Input
                  id="reservation-time"
                  type="time"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="guests">Número de Pessoas *</Label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <Input
                  id="guests"
                  type="number"
                  min={selectedPricing?.min_guests || 1}
                  max={selectedPricing?.max_guests || undefined}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              {selectedPricing && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPricing.min_guests} {selectedPricing.min_guests === 1 ? 'pessoa' : 'pessoas'} mín.
                  {selectedPricing.max_guests && ` • ${selectedPricing.max_guests} máx.`}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="special-requests">Observações (opcional)</Label>
              <Input
                id="special-requests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Alguma observação especial?"
              />
            </div>

            {selectedPricing && (
              <Card className="bg-gradient-to-br from-ms-primary-blue/5 to-ms-discovery-teal/5 border-2 border-ms-primary-blue/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="text-3xl font-bold text-ms-primary-blue">
                        R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {selectedPricing.pricing_type === 'per_person' && selectedPricing.price_per_person && (
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedPricing.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + 
                          {' '}({guests} × {selectedPricing.price_per_person.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleReserve}
                disabled={processing || !user || !selectedService || !reservationDate}
                className="flex-1 bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Reservar Agora'
                )}
              </Button>
            </div>

            {!user && (
              <p className="text-sm text-center text-red-600">
                Você precisa estar logado para fazer uma reserva
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

