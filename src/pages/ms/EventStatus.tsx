import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Loader2, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EventStatus() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setError('ID do evento não fornecido');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (fetchError) {
          throw new Error(fetchError.message || 'Evento não encontrado');
        }

        if (!data) {
          throw new Error('Evento não encontrado');
        }

        setEvent(data);
      } catch (err: any) {
        console.error('Erro ao carregar evento:', err);
        setError(err.message || 'Erro ao carregar evento');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const getStatusInfo = () => {
    if (!event) return null;

    if (event.approval_status === 'approved' && event.is_visible) {
      return {
        icon: CheckCircle2,
        label: 'Aprovado',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    }

    if (event.approval_status === 'rejected') {
      return {
        icon: XCircle,
        label: 'Rejeitado',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    }

    return {
      icon: Clock,
      label: 'Pendente',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    };
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <UniversalLayout>
        <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-discovery-teal/5 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-ms-primary-blue mx-auto" />
                <h2 className="text-2xl font-bold text-gray-900">Carregando...</h2>
                <p className="text-gray-600">Buscando informações do evento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  if (error || !event) {
    return (
      <UniversalLayout>
        <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-discovery-teal/5 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-red-500">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Erro</h2>
                  <p className="text-gray-600">{error || 'Evento não encontrado'}</p>
                </div>
                <Button onClick={() => navigate('/descubrams/eventos')} className="w-full">
                  Voltar para Eventos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-discovery-teal/5 flex items-center justify-center p-6">
        <Card className={`max-w-2xl w-full border-2 ${statusInfo?.borderColor} shadow-xl`}>
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              {/* Status Icon */}
              <div className={`w-20 h-20 rounded-full ${statusInfo?.bgColor} flex items-center justify-center mx-auto`}>
                <StatusIcon className={`h-10 w-10 ${statusInfo?.textColor}`} />
              </div>

              {/* Status Badge */}
              <div>
                <Badge className={`${statusInfo?.color} text-white px-4 py-2 text-lg`}>
                  {statusInfo?.label}
                </Badge>
              </div>

              {/* Event Name */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">{event.name}</h2>
                {event.description && (
                  <p className="text-gray-600">{event.description.substring(0, 200)}...</p>
                )}
              </div>

              {/* Event Details */}
              <div className={`p-6 ${statusInfo?.bgColor} rounded-lg border-2 ${statusInfo?.borderColor} text-left space-y-3`}>
                <h3 className="font-semibold text-gray-900 text-xl mb-4">Informações do Evento:</h3>
                {event.start_date && (
                  <p className="text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <strong>Data:</strong> {formatDate(event.start_date)}
                    {event.start_time && ` às ${event.start_time}`}
                  </p>
                )}
                {event.location && (
                  <p className="text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <strong>Local:</strong> {event.location}
                  </p>
                )}
                {event.is_sponsored && (
                  <p className="text-yellow-700 flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <strong>Evento em Destaque</strong>
                  </p>
                )}
              </div>

              {/* Status Message */}
              <div className="space-y-2">
                {event.approval_status === 'approved' && event.is_visible && (
                  <p className="text-lg text-gray-700">
                    Seu evento está aprovado e visível na plataforma!
                  </p>
                )}
                {event.approval_status === 'rejected' && (
                  <p className="text-lg text-gray-700">
                    Infelizmente, seu evento não pôde ser aprovado no momento.
                  </p>
                )}
                {(!event.approval_status || event.approval_status === 'pending') && (
                  <p className="text-lg text-gray-700">
                    Seu evento está aguardando aprovação. Você receberá um e-mail quando for analisado.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  size="lg"
                  className="w-full max-w-sm bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white gap-2"
                  onClick={() => navigate(`/descubrams/eventos?evento=${event.id}`)}
                >
                  Ver Evento
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full max-w-sm border-ms-primary-blue/30 hover:bg-ms-primary-blue/10 gap-2"
                  onClick={() => navigate('/descubrams/eventos')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para Eventos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UniversalLayout>
  );
}

