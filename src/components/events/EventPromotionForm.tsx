import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { redirectToEventCheckout } from "@/services/stripe/eventCheckoutService";
import EventImageUpload from "./EventImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Calendar, 
  MapPin, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Link as LinkIcon,
  Image,
  Video,
  Star,
  Sparkles,
  Crown,
  CheckCircle2,
  Loader2
} from "lucide-react";

const eventPromotionSchema = z.object({
  // Dados do evento
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  descricao: z.string().min(50, "Descrição deve ter pelo menos 50 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),

  // Datas
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  data_fim: z.string().optional(),
  horario_inicio: z.string().min(1, "Horário de início é obrigatório"),
  horario_fim: z.string().min(1, "Horário de término é obrigatório"),

  // Local
  local: z.string().min(3, "Local é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  endereco_completo: z.string().optional(),

  // Organizador
  organizador_nome: z.string().min(3, "Nome do organizador é obrigatório"),
  organizador_email: z.string().email("Email inválido"),
  organizador_telefone: z.string().min(10, "Telefone inválido"),
  organizador_empresa: z.string().optional(),

  // Links
  site_oficial: z.string().url("URL inválida").min(1, "Site oficial é obrigatório"),
  link_inscricao: z.string().url("URL inválida").optional().or(z.literal("")),
  video_promocional: z.string().optional(),
  logo_evento: z.string().optional(),
}).refine((data) => {
  // Vídeo promocional OU logo do evento deve ser fornecido
  return data.video_promocional || data.logo_evento;
}, {
  message: "Vídeo promocional ou logotipo do evento é obrigatório",
  path: ["video_promocional"], // Mostra erro no campo video_promocional
});

type EventPromotionFormData = z.infer<typeof eventPromotionSchema>;

const plano = {
  id: "destaque",
  nome: "Evento em Destaque",
  preco: "R$ 499,90",
  valor: 499.90,
  icon: Crown,
  cor: "from-ms-primary-blue to-ms-discovery-teal",
  beneficios: [
    "Badge 'Em Destaque' no seu evento",
    "Posição privilegiada no calendário",
    "Banner na página de eventos",
    "Compartilhamento nas redes sociais",
    "Notificações para usuários da plataforma",
    "Suporte prioritário",
    "Válido por 30 dias",
  ]
};

const categorias = [
  { value: "cultural", label: "Cultural" },
  { value: "gastronomico", label: "Gastronômico" },
  { value: "esportivo", label: "Esportivo" },
  { value: "musical", label: "Musical/Show" },
  { value: "religioso", label: "Religioso" },
  { value: "empresarial", label: "Empresarial" },
  { value: "educativo", label: "Educativo" },
  { value: "festival", label: "Festival" },
  { value: "outro", label: "Outro" },
];

export const EventPromotionForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventPromotionFormData>({
    resolver: zodResolver(eventPromotionSchema),
    defaultValues: {
      cidade: "",
      categoria: "",
    },
  });

  const onSubmit = async (data: EventPromotionFormData) => {
    setIsSubmitting(true);
    try {
      const eventData = {
        external_id: `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        data_inicio: new Date(data.data_inicio).toISOString(),
        data_fim: data.data_fim ? new Date(data.data_fim).toISOString() : null,
        local: data.local,
        cidade: data.cidade,
        estado: "Mato Grosso do Sul",
        organizador: data.organizador_nome,
        organizador_nome: data.organizador_nome,
        organizador_email: data.organizador_email,
        organizador_telefone: data.organizador_telefone,
        organizador_empresa: data.organizador_empresa || null,
        site_oficial: data.site_oficial || null,
        link_inscricao: data.link_inscricao || null,
        video_promocional: data.video_promocional || null,
        logo_evento: data.logo_evento || null,
        is_sponsored: true,
        sponsor_tier: 'destaque',
        sponsor_amount: plano.valor,
        sponsor_payment_status: 'pending',
        sponsor_start_date: new Date().toISOString().split('T')[0],
        sponsor_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fonte: 'manual',
        processado_por_ia: false,
        confiabilidade: 100,
      };

      const { data: createdEvent, error } = await supabase
        .from('events')
        .insert([eventData])
        .select('id')
        .single();

      if (error) throw error;

      const eventId = createdEvent.id;

      // Redirecionar para checkout Stripe
      toast({
        title: "Redirecionando para pagamento...",
        description: "Você será redirecionado para a página de pagamento seguro.",
      });

      // Pequeno delay para mostrar o toast
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirecionar para Payment Link do Stripe
      const paymentUrl = `https://buy.stripe.com/test_bJe3cxaliec5gR65mH43S00?prefilled_email=${encodeURIComponent(data.organizador_email)}&client_reference_id=${eventId}`;
      window.location.href = paymentUrl;
      // Não mostra tela de sucesso, vai redirecionar
    } catch (error: any) {
      console.error('Erro ao enviar evento:', error);
      toast({
        title: "Erro ao enviar evento",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Redirecionando para Pagamento
          </h2>
          <p className="text-gray-600 mb-6">
            Seu evento foi criado com sucesso! Você será redirecionado para a página segura de pagamento.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">O que acontece agora:</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
              <li>Redirecionamento automático para checkout Stripe</li>
              <li>Pagamento seguro de R$ 499,90</li>
              <li>Após pagamento, seu evento será destacado por 30 dias</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Plano Único */}
      <Card className="border-2 border-ms-primary-blue/20 bg-gradient-to-br from-blue-50 to-teal-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${plano.cor} flex items-center justify-center flex-shrink-0`}>
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl font-bold text-ms-primary-blue mb-1">{plano.nome}</h2>
              <p className="text-3xl font-bold text-gray-900">{plano.preco}</p>
              <p className="text-gray-600 text-sm">por 30 dias de destaque</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {plano.beneficios.map((beneficio, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{beneficio}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dados do Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ms-primary-blue" />
            Dados do Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título do Evento *</Label>
            <Input
              id="titulo"
              {...register("titulo")}
              placeholder="Ex: Festival Gastronômico de Bonito 2025"
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="descricao">Descrição Completa *</Label>
            <Textarea
              id="descricao"
              {...register("descricao")}
              placeholder="Descreva seu evento com detalhes: atrações, programação, público-alvo..."
              rows={5}
            />
            {errors.descricao && (
              <p className="text-red-500 text-sm mt-1">{errors.descricao.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <select
              id="categoria"
              {...register("categoria")}
              className="w-full border rounded-md p-2"
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <p className="text-red-500 text-sm mt-1">{errors.categoria.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <Input
                id="data_inicio"
                type="date"
                {...register("data_inicio")}
              />
              {errors.data_inicio && (
                <p className="text-red-500 text-sm mt-1">{errors.data_inicio.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="data_fim">Data de Término (opcional)</Label>
              <Input
                id="data_fim"
                type="date"
                {...register("data_fim")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horario_inicio">Horário de Início *</Label>
              <Input
                id="horario_inicio"
                type="time"
                {...register("horario_inicio")}
              />
              {errors.horario_inicio && (
                <p className="text-red-500 text-sm mt-1">{errors.horario_inicio.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="horario_fim">Horário de Término *</Label>
              <Input
                id="horario_fim"
                type="time"
                {...register("horario_fim")}
              />
              {errors.horario_fim && (
                <p className="text-red-500 text-sm mt-1">{errors.horario_fim.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-ms-primary-blue" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="local">Local/Estabelecimento *</Label>
              <Input
                id="local"
                {...register("local")}
                placeholder="Ex: Praça da Liberdade"
              />
              {errors.local && (
                <p className="text-red-500 text-sm mt-1">{errors.local.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                {...register("cidade")}
                placeholder="Ex: Bonito"
              />
              {errors.cidade && (
                <p className="text-red-500 text-sm mt-1">{errors.cidade.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="endereco_completo">Endereço Completo (opcional)</Label>
            <Input
              id="endereco_completo"
              {...register("endereco_completo")}
              placeholder="Rua, número, bairro..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Organizador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-ms-primary-blue" />
            Dados do Organizador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizador_nome">Nome Completo *</Label>
              <Input
                id="organizador_nome"
                {...register("organizador_nome")}
                placeholder="Seu nome completo"
              />
              {errors.organizador_nome && (
                <p className="text-red-500 text-sm mt-1">{errors.organizador_nome.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="organizador_empresa">Empresa/Organização</Label>
              <Input
                id="organizador_empresa"
                {...register("organizador_empresa")}
                placeholder="Nome da empresa (opcional)"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizador_email">Email *</Label>
              <Input
                id="organizador_email"
                type="email"
                {...register("organizador_email")}
                placeholder="seu@email.com"
              />
              {errors.organizador_email && (
                <p className="text-red-500 text-sm mt-1">{errors.organizador_email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="organizador_telefone">Telefone/WhatsApp *</Label>
              <Input
                id="organizador_telefone"
                {...register("organizador_telefone")}
                placeholder="(67) 99999-9999"
              />
              {errors.organizador_telefone && (
                <p className="text-red-500 text-sm mt-1">{errors.organizador_telefone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-ms-primary-blue" />
            Links e Mídia
          </CardTitle>
          <CardDescription>Adicione links para mais informações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site_oficial">Site Oficial *</Label>
            <Input
              id="site_oficial"
              {...register("site_oficial")}
              placeholder="https://www.seuevento.com.br"
            />
            {errors.site_oficial && (
              <p className="text-red-500 text-sm mt-1">{errors.site_oficial.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="link_inscricao">Link de Inscrição/Ingressos</Label>
            <Input
              id="link_inscricao"
              {...register("link_inscricao")}
              placeholder="https://www.sympla.com.br/seu-evento"
            />
          </div>
          <div>
            <Label htmlFor="video_promocional">Vídeo Promocional (YouTube)</Label>
            <Input
              id="video_promocional"
              {...register("video_promocional")}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div>
            <Label htmlFor="logo_evento">Logotipo do Evento</Label>
            <EventImageUpload
              label="Logotipo do Evento"
              value=""
              onChange={(url) => setValue("logo_evento", url)}
              folder="event-images"
              placeholder="Clique para fazer upload do logotipo"
            />
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ Vídeo promocional OU logotipo é obrigatório
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumo e Envio */}
      <Card className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/80 text-sm">Investimento:</p>
              <p className="text-2xl font-bold">
                {plano.preco} <span className="text-lg font-normal text-white/80">/ 30 dias</span>
              </p>
            </div>
            <Button 
              type="submit" 
              size="lg"
              disabled={isSubmitting}
              className="bg-white text-ms-primary-blue hover:bg-white/90 font-bold px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Solicitar Destaque
                </>
              )}
            </Button>
          </div>
          <p className="text-white/70 text-sm mt-4">
            * Após enviar, você será redirecionado automaticamente para o checkout seguro.
          </p>
        </CardContent>
      </Card>
    </form>
  );
};

export default EventPromotionForm;

