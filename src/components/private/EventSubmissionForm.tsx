// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, MapPin, FileText, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EVENT_CATEGORIES = [
  'Cultural',
  'Gastronômico',
  'Esportivo',
  'Religioso',
  'Entretenimento',
  'Negócios',
  'Natureza',
  'Outros'
];

interface SubmittedEvent {
  id: string;
  title: string;
  start_date: string;
  approval_status: string;
  created_at: string;
}

export default function EventSubmissionForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isMSUser, setIsMSUser] = useState(false);
  const [checkingState, setCheckingState] = useState(true);
  const [submittedEvents, setSubmittedEvents] = useState<SubmittedEvent[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    category: '',
  });

  useEffect(() => {
    checkUserState();
    fetchSubmittedEvents();
  }, [user]);

  const checkUserState = async () => {
    if (!user?.id) {
      setCheckingState(false);
      return;
    }

    try {
      // Verificar estado do usuário no perfil
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('state, city_id, cities(state, name)')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Verificar se é do MS
      // Pode estar em profile.state ou em cities.state
      const state = profile?.state?.toUpperCase() || 
                   (profile?.cities as any)?.state?.toUpperCase() || 
                   null;
      
      setIsMSUser(state === 'MS' || state === 'MATO GROSSO DO SUL');
    } catch (error) {
      console.error('Erro ao verificar estado do usuário:', error);
    } finally {
      setCheckingState(false);
    }
  };

  const fetchSubmittedEvents = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_date, approval_status, created_at')
        .eq('company_id', user.id)
        .eq('source', 'viajar')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmittedEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos enviados:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações
    if (!formData.title || !formData.start_date || !formData.location || !formData.category) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description || null,
          start_date: formData.start_date,
          end_date: formData.end_date || formData.start_date,
          location: formData.location,
          category: formData.category,
          company_id: user.id,
          submitted_by: user.id,
          source: 'viajar',
          approval_status: 'pending',
          status: 'planned',
        });

      if (error) throw error;

      toast({
        title: 'Evento enviado!',
        description: 'Seu evento foi enviado para aprovação. Você será notificado quando for aprovado.',
      });

      // Limpar formulário
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        category: '',
      });

      // Atualizar lista
      await fetchSubmittedEvents();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao enviar evento:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao enviar evento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Aguardando Aprovação</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><AlertCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (checkingState) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isMSUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Envio de Eventos</CardTitle>
          <CardDescription>
            Envie eventos para o calendário público do Descubra Mato Grosso do Sul
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta funcionalidade está disponível apenas para empresas do Mato Grosso do Sul.
              Se sua empresa está localizada no MS, atualize seu perfil com o estado correto.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Enviar Evento para Aprovação
          </CardTitle>
          <CardDescription>
            Envie seu evento para o calendário público do Descubra Mato Grosso do Sul. 
            O evento será revisado antes de ser publicado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Após o envio, seu evento ficará aguardando aprovação. Você será notificado quando for aprovado ou rejeitado.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Festival de Inverno de Bonito"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o evento..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data de Início *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">Data de Término</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Bonito - MS"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Enviar para Aprovação
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Eventos Enviados */}
      {submittedEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Meus Eventos Enviados</CardTitle>
            <CardDescription>
              Acompanhe o status de aprovação dos seus eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submittedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.start_date).toLocaleDateString('pt-BR')} • 
                      Enviado em {new Date(event.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(event.approval_status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

