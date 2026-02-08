import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, MapPin, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const QUESTION_TYPES = [
  'Informação turística',
  'Localização/roteiro',
  'Hospedagem',
  'Gastronomia',
  'Eventos',
  'Transporte',
  'Acessibilidade',
  'Outros'
];

const TRAVEL_MOTIVATIONS = [
  'Lazer',
  'Negócios',
  'Visita a familiares',
  'Eventos',
  'Natureza/aventura',
  'Cultura',
  'Gastronomia',
  'Compras',
  'Outros'
];

const AGE_RANGES = [
  '18-25',
  '26-35',
  '36-45',
  '46-55',
  '56-65',
  '65+'
];

export default function TouristSurveyForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [catId, setCatId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tourist_name: '',
    tourist_origin: '',
    tourist_age_range: '',
    question_asked: '',
    question_type: [] as string[],
    travel_motivation: [] as string[],
    observations: '',
  });

  useEffect(() => {
    fetchAttendantCAT();
  }, [user]);

  const fetchAttendantCAT = async () => {
    if (!user?.id) return;

    try {
      // Buscar CAT associado ao atendente
      const { data, error } = await supabase
        .from('attendant_location_assignments')
        .select('location_id')
        .eq('attendant_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar CAT:', error);
      } else if (data) {
        setCatId(data.location_id);
      }
    } catch (error) {
      console.error('Erro ao buscar CAT do atendente:', error);
    }
  };

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      question_type: checked
        ? [...prev.question_type, type]
        : prev.question_type.filter(t => t !== type)
    }));
  };

  const handleTravelMotivationChange = (motivation: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      travel_motivation: checked
        ? [...prev.travel_motivation, motivation]
        : prev.travel_motivation.filter(m => m !== motivation)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações
    if (!formData.tourist_origin) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe a origem do turista',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (!formData.question_asked) {
      toast({
        title: 'Campo obrigatório',
        description: 'Descreva a pergunta feita pelo turista',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (formData.question_type.length === 0) {
      toast({
        title: 'Campo obrigatório',
        description: 'Selecione pelo menos um tipo de pergunta',
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
        .from('tourist_surveys')
        .insert({
          attendant_id: user.id,
          cat_id: catId,
          tourist_name: formData.tourist_name || null,
          tourist_origin: formData.tourist_origin,
          tourist_age_range: formData.tourist_age_range || null,
          question_asked: formData.question_asked,
          question_type: formData.question_type,
          travel_motivation: formData.travel_motivation,
          observations: formData.observations || null,
          client_slug: 'ms',
        });

      if (error) throw error;

      toast({
        title: 'Pesquisa registrada!',
        description: 'Dados do turista foram salvos com sucesso.',
      });

      // Limpar formulário
      setFormData({
        tourist_name: '',
        tourist_origin: '',
        tourist_age_range: '',
        question_asked: '',
        question_type: [],
        travel_motivation: [],
        observations: '',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar pesquisa:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar pesquisa',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Pesquisa com Turista
        </CardTitle>
        <CardDescription>
          Registre informações sobre a interação com o turista
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>LGPD:</strong> O nome do turista é opcional. Coletamos apenas dados necessários para melhorar o atendimento.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Turista */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados do Turista
            </h3>

            <div>
              <Label htmlFor="tourist_name">Nome (Opcional)</Label>
              <Input
                id="tourist_name"
                value={formData.tourist_name}
                onChange={(e) => setFormData({ ...formData, tourist_name: e.target.value })}
                placeholder="Nome do turista (opcional)"
              />
            </div>

            <div>
              <Label htmlFor="tourist_origin">Origem *</Label>
              <Input
                id="tourist_origin"
                value={formData.tourist_origin}
                onChange={(e) => setFormData({ ...formData, tourist_origin: e.target.value })}
                placeholder="Ex: São Paulo, Argentina, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="tourist_age_range">Faixa Etária</Label>
              <select
                id="tourist_age_range"
                value={formData.tourist_age_range}
                onChange={(e) => setFormData({ ...formData, tourist_age_range: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">Selecione...</option>
                {AGE_RANGES.map(range => (
                  <option key={range} value={range}>{range} anos</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pergunta Feita */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Pergunta Feita
            </h3>

            <div>
              <Label htmlFor="question_asked">O que o turista perguntou? *</Label>
              <Textarea
                id="question_asked"
                value={formData.question_asked}
                onChange={(e) => setFormData({ ...formData, question_asked: e.target.value })}
                placeholder="Descreva a pergunta ou solicitação do turista..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label>Tipo de Pergunta *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {QUESTION_TYPES.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`question_type_${type}`}
                      checked={formData.question_type.includes(type)}
                      onCheckedChange={(checked) => handleQuestionTypeChange(type, checked as boolean)}
                    />
                    <label
                      htmlFor={`question_type_${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Motivação da Viagem */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Motivação da Viagem
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {TRAVEL_MOTIVATIONS.map(motivation => (
                <div key={motivation} className="flex items-center space-x-2">
                  <Checkbox
                    id={`motivation_${motivation}`}
                    checked={formData.travel_motivation.includes(motivation)}
                    onCheckedChange={(checked) => handleTravelMotivationChange(motivation, checked as boolean)}
                  />
                  <label
                    htmlFor={`motivation_${motivation}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {motivation}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observations">Observações Adicionais</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Informações adicionais sobre a interação..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Registrar Pesquisa
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

