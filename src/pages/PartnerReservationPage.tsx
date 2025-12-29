import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Users, DollarSign, Loader2, ArrowLeft, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface Partner {
  id: string;
  name: string;
  address?: string;
  logo_url?: string;
}

export default function PartnerReservationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [pricingList, setPricingList] = useState<PartnerPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [selectedService, setSelectedService] = useState<string>('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (id) {
      loadPartnerData();
      loadPricing();
    }
  }, [id]);

  // Removido redirecionamento automático - mostra mensagem na página em vez disso

  const loadPartnerData = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('id, name, address, logo_url')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      setPartner(data);
    } catch (error: any) {
      console.error('Erro ao carregar parceiro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as informações do parceiro.',
        variant: 'destructive',
      });
    }
  };

  const loadPricing = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_pricing')
        .select('*')
        .eq('partner_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('Tabela partner_pricing ainda não foi criada.');
          setPricingList([]);
          return;
        }
        throw error;
      }

      setPricingList(data || []);
      if (data && data.length > 0) {
        setSelectedService(data[0].id);
        setGuests(data[0].min_guests);
      }
    } catch (error: any) {
      console.error('Erro ao carregar preços:', error);
      if (error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os preços.',
          variant: 'destructive',
        });
      }
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

    if (!selectedService || !reservationDate || !id) {
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
          partnerId: id,
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
          successUrl: `${window.location.origin}/minhas-reservas`,
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
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error);
      toast({
        title: 'Erro ao criar reserva',
        description: error.message || 'Não foi possível criar a reserva. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <UniversalLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-ms-primary-blue mx-auto mb-4" />
            <p className="text-gray-500">Carregando informações...</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  if (!partner) {
    return (
      <UniversalLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Parceiro não encontrado</p>
            <Button asChild>
              <Link to="/descubramatogrossodosul/parceiros">Voltar para Parceiros</Link>
            </Button>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  if (pricingList.length === 0) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PartnerReservationPage.tsx:257',message:'No pricing available - showing unavailable message',data:{pricingListLength:pricingList.length,partnerId:id,loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return (
      <UniversalLayout>
        <div className="ms-container py-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/descubramatogrossodosul/parceiros">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Parceiros
            </Link>
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Reserva Indisponível</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Este parceiro ainda não possui serviços disponíveis para reserva online.
              </p>
              <Button asChild>
                <Link to="/descubramatogrossodosul/parceiros">Voltar para Parceiros</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <main className="flex-grow">
        {/* Header */}
        <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal py-12">
          <div className="ms-container">
            <Button variant="ghost" asChild className="mb-6 text-white hover:text-white/80">
              <Link to="/descubramatogrossodosul/parceiros">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Parceiros
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              {partner.logo_url && (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-lg"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{partner.name}</h1>
                {partner.address && (
                  <p className="text-white/90 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {partner.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="ms-container py-12">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-ms-primary-blue/5 to-ms-discovery-teal/5 border-2 border-ms-primary-blue/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-ms-primary-blue" />
                  <CardTitle className="text-2xl">Reservar Agora</CardTitle>
                </div>
                <p className="text-gray-600 mt-2">
                  Preencha os dados abaixo para finalizar sua reserva. O pagamento será processado de forma segura.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="service-select">Serviço *</Label>
                  <Select value={selectedService} onValueChange={(value) => {
                    setSelectedService(value);
                    const pricing = pricingList.find(p => p.id === value);
                    if (pricing) {
                      setGuests(pricing.min_guests);
                    }
                  }}>
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
                    <p className="text-sm text-gray-500 mt-2">{selectedPricing.description}</p>
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
                        className="flex-1"
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
                      className="flex-1"
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
                  <div className="bg-white rounded-lg p-6 border-2 border-ms-primary-blue/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Valor Total</p>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-4xl font-bold text-ms-primary-blue">
                        R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {selectedPricing.pricing_type === 'per_person' && selectedPricing.price_per_person && (
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedPricing.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + 
                        {' '}({guests} × {selectedPricing.price_per_person.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                      </p>
                    )}
                  </div>
                )}

                {!user ? (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-800 font-semibold mb-2">
                      ⚠️ Login necessário
                    </p>
                    <p className="text-yellow-700 text-sm mb-4">
                      Você precisa estar logado para fazer uma reserva. Faça login e volte aqui para continuar.
                    </p>
                    <Button
                      asChild
                      className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white"
                    >
                      <Link to="/auth?redirect=/descubramatogrossodosul/parceiros">
                        Fazer Login
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleReserve}
                    disabled={processing || !selectedService || !reservationDate}
                    className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white h-12 text-base font-semibold"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Finalizar Reserva'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
}

