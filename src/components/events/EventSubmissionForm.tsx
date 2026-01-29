/**
 * Formulário Unificado para Cadastro de Eventos
 * Permite cadastrar eventos gratuitos ou solicitar destaque (pago)
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
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
  Mail, 
  Phone, 
  Link as LinkIcon,
  Star,
  CheckCircle2,
  Loader2,
  Megaphone,
  Gift,
  CreditCard
} from "lucide-react";
import { redirectToEventCheckout } from "@/services/stripe/eventCheckoutService";
import { supabase } from "@/integrations/supabase/client";
import EventImageUpload from "./EventImageUpload";

const eventSchema = z.object({
  // Tipo de cadastro
  tipo: z.enum(["gratuito", "destaque"]),

  // Dados do evento
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  descricao: z.string().min(30, "Descrição deve ter pelo menos 30 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),

  // Datas
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  data_fim: z.string().optional(),
  horario_inicio: z.string().min(1, "Horário de início é obrigatório"),
  horario_fim: z.string().min(1, "Horário de término é obrigatório"),

  // Local
  local: z.string().min(3, "Local é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),

  // Organizador
  organizador_nome: z.string().min(3, "Nome do organizador é obrigatório"),
  organizador_email: z.string().email("Email inválido"),
  organizador_telefone: z.string().min(10, "Telefone inválido"),

  // Links
  site_oficial: z.string().url("URL inválida").optional().or(z.literal("")),
  video_promocional: z.string().optional(),
  logo_evento: z.string().optional(),
}).refine((data) => {
  // Se for evento em destaque, vídeo OU logotipo é obrigatório
  if (data.tipo === "destaque") {
    return data.video_promocional || data.logo_evento;
  }
  return true; // Evento gratuito não precisa de vídeo/logotipo
}, {
  message: "Para eventos em destaque, vídeo promocional ou logotipo é obrigatório",
  path: ["video_promocional"],
});

type EventFormData = z.infer<typeof eventSchema>;

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

export const EventSubmissionForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<"gratuito" | "destaque">("gratuito");
  const [sponsorPrice, setSponsorPrice] = useState<number>(499.90); // Valor padrão

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      tipo: "gratuito",
      cidade: "",
      categoria: "",
    },
  });

  // Buscar preço configurável de eventos em destaque
  useEffect(() => {
    const fetchSponsorPrice = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('platform', 'ms')
          .eq('setting_key', 'event_sponsor_price')
          .single();

        if (!error && data?.setting_value) {
          const priceValue = typeof data.setting_value === 'string' 
            ? data.setting_value 
            : String(data.setting_value);
          const price = parseFloat(priceValue);
          if (!isNaN(price)) {
            setSponsorPrice(price);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar preço configurável:', error);
        // Manter valor padrão se houver erro
      }
    };

    fetchSponsorPrice();
  }, []);

  // Função para detectar a região turística baseada na cidade
  const detectTouristRegion = async (cidade: string): Promise<string | null> => {
    try {
      const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";

      const cidadeLower = cidade.toLowerCase().trim();

      // Mapeamento de cidades para slugs de regiões
      const regionMappings: Record<string, string[]> = {
        'pantanal': ['corumbá', 'ladário', 'aquidauana', 'miranda', 'anastácio'],
        'bonito-serra-bodoquena': ['bonito', 'bodoquena', 'jardim', 'bela vista', 'caracol', 'guia lopes', 'nioaque', 'porto murtinho'],
        'vale-aguas': ['nova andradina', 'angélica', 'batayporã', 'ivinhema', 'jateí', 'novo horizonte do sul', 'taquarussu'],
        'vale-apore': ['cassilândia', 'chapadão do sul', 'inocência'],
        'rota-norte': ['coxim', 'alcinópolis', 'bandeirantes', 'camapuã', 'costa rica', 'figueirão', 'paraíso das águas', 'pedro gomes', 'rio verde de mato grosso', 'são gabriel do oeste', 'sonora'],
        'caminho-ipes': ['campo grande', 'corguinho', 'dois irmãos do buriti', 'jaraguari', 'nova alvorada', 'ribas do rio pardo', 'rio negro', 'sidrolândia', 'terenos'],
        'caminhos-fronteira': ['ponta porã', 'antônio joão', 'laguna carapã'],
        'costa-leste': ['três lagoas', 'água clara', 'aparecida do taboado', 'bataguassu', 'brasilândia', 'paranaíba', 'santa rita do pardo'],
        'grande-dourados': ['dourados', 'caarapó', 'deodápolis', 'douradina', 'fátima do sul', 'glória de dourados', 'itaporã', 'maracaju', 'rio brilhante', 'vicentina']
      };

      // Encontrar a região correspondente
      for (const [regionSlug, cities] of Object.entries(regionMappings)) {
        if (cities.some(city => cidadeLower.includes(city))) {
          // Buscar o ID da região no banco
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/tourist_regions?slug=eq.${regionSlug}&select=id`,
            {
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
              }
            }
          );

          if (response.ok) {
            const regions = await response.json();
            if (regions.length > 0) {
              return regions[0].id;
            }
          }
          break;
        }
      }

      return null; // Nenhuma região encontrada
    } catch (error) {
      console.error('Erro ao detectar região turística:', error);
      return null;
    }
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";

      // Detectar automaticamente a região turística baseada na cidade
      const touristRegionId = await detectTouristRegion(data.cidade);

      const eventData = {
        name: data.titulo,
        description: data.descricao,
        category: data.categoria, // Adicionar categoria
        start_date: data.data_inicio,
        end_date: data.data_fim || data.data_inicio,
        start_time: data.horario_inicio,
        end_time: data.horario_fim,
        location: `${data.local}, ${data.cidade}`,
        site_oficial: data.site_oficial || null,
        video_url: data.video_promocional || null,
        image_url: data.logo_evento || null, // Usar image_url ao invés de logo_evento
        logo_evento: data.logo_evento || null, // Manter para compatibilidade
        organizador_nome: data.organizador_nome,
        organizador_email: data.organizador_email,
        organizador_telefone: data.organizador_telefone,
        tourist_region_id: touristRegionId, // Nova coluna
        is_visible: false, // Precisa de aprovação
        is_sponsored: data.tipo === "destaque",
        sponsor_payment_status: data.tipo === "destaque" ? "pending" : null,
        sponsor_amount: data.tipo === "destaque" ? sponsorPrice : null,
      };

      // Criar evento no banco
      const response = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar evento');
      }

      const createdEvents = await response.json();
      const eventId = createdEvents[0]?.id;

      // Se for evento em destaque, redirecionar para checkout Stripe
      if (data.tipo === "destaque" && eventId) {
        toast({
          title: "Redirecionando para pagamento...",
          description: "Você será redirecionado para a página de pagamento seguro.",
        });

        // Pequeno delay para mostrar o toast
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar se há um link de pagamento configurado no evento
        const { data: eventData } = await supabase
          .from('events')
          .select('stripe_payment_link_url')
          .eq('id', eventId)
          .single();

        // Buscar link padrão se evento não tiver link próprio
        let paymentLink = eventData?.stripe_payment_link_url;
        if (!paymentLink) {
          const { data: defaultLink } = await supabase
            .from('site_settings')
            .select('setting_value')
            .eq('platform', 'ms')
            .eq('setting_key', 'event_sponsorship_payment_link')
            .single();
          
          if (defaultLink?.setting_value) {
            // setting_value é JSONB, pode ser string direta ou objeto
            paymentLink = typeof defaultLink.setting_value === 'string' 
              ? defaultLink.setting_value 
              : (defaultLink.setting_value as any)?.url || defaultLink.setting_value;
          }
        }

        // Se houver link (próprio ou padrão), usar ele (com client_reference_id)
        if (paymentLink) {
          // Salvar return_domain no evento antes de redirecionar
          const returnDomain = window.location.origin;
          await supabase
            .from('events')
            .update({ return_domain: returnDomain })
            .eq('id', eventId);

          const paymentUrl = `${paymentLink}${paymentLink.includes('?') ? '&' : '?'}prefilled_email=${encodeURIComponent(data.organizador_email)}&client_reference_id=${eventId}`;
          window.location.href = paymentUrl;
          return;
        }

        // Caso contrário, usar checkout dinâmico
        try {
          await redirectToEventCheckout({
            eventId,
            eventName: data.titulo,
            organizerEmail: data.organizador_email,
            organizerName: data.organizador_nome,
          });
          return;
        } catch (checkoutError: any) {
          console.error('Erro ao criar checkout:', checkoutError);
          toast({
            title: "Erro no pagamento",
            description: "Não foi possível iniciar o pagamento. Por favor, entre em contato com o suporte.",
            variant: "destructive",
          });
        }
      }

      // Evento gratuito - mostra sucesso
      setSubmitSuccess(true);
      toast({
        title: "Evento enviado com sucesso!",
        description: "Seu evento será analisado e publicado em breve.",
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao enviar evento:', err);
      toast({
        title: "Erro ao enviar evento",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
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
            Evento Enviado!
          </h2>
          <p className="text-gray-600 mb-6">
            Recebemos seu evento. Após análise, ele será publicado no calendário.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Próximos passos:</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
              <li>Análise do evento (até 24h)</li>
              <li>Publicação no calendário de eventos</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Escolha do Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Escolha o tipo de cadastro</CardTitle>
          <CardDescription>
            Você pode cadastrar seu evento gratuitamente ou solicitar destaque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue="gratuito"
            onValueChange={(value) => {
              setTipoSelecionado(value as "gratuito" | "destaque");
              setValue("tipo", value as "gratuito" | "destaque");
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Opção Gratuito */}
            <div className={`relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
              tipoSelecionado === "gratuito" 
                ? "border-ms-primary-blue bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <RadioGroupItem value="gratuito" id="gratuito" className="mt-1" />
              <label htmlFor="gratuito" className="ml-3 cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Gratuito</span>
                </div>
                <p className="text-sm text-gray-600">
                  Cadastre seu evento gratuitamente. Ideal para prefeituras e organizadores.
                </p>
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  <li>✓ Aparece no calendário</li>
                  <li>✓ Visível para todos os usuários</li>
                  <li>✓ Sem custo</li>
                </ul>
              </label>
            </div>

            {/* Opção Destaque */}
            <div className={`relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
              tipoSelecionado === "destaque" 
                ? "border-yellow-400 bg-yellow-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <RadioGroupItem value="destaque" id="destaque" className="mt-1" />
              <label htmlFor="destaque" className="ml-3 cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-gray-900">Em Destaque</span>
                  <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
                    R$ {sponsorPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Destaque seu evento para maior visibilidade.
                </p>
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  <li>⭐ Badge "Em Destaque"</li>
                  <li>⭐ Posição privilegiada</li>
                  <li>⭐ Visual destacado</li>
                  <li>⭐ Válido por 30 dias</li>
                </ul>
              </label>
            </div>
          </RadioGroup>
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
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              {...register("descricao")}
              placeholder="Descreva seu evento com detalhes..."
              rows={4}
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
              <Input id="data_inicio" type="date" {...register("data_inicio")} />
              {errors.data_inicio && (
                <p className="text-red-500 text-sm mt-1">{errors.data_inicio.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="data_fim">Data de Término (opcional)</Label>
              <Input id="data_fim" type="date" {...register("data_fim")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horario_inicio">Horário de Início *</Label>
              <Input id="horario_inicio" type="time" {...register("horario_inicio")} />
              {errors.horario_inicio && (
                <p className="text-red-500 text-sm mt-1">{errors.horario_inicio.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="horario_fim">Horário de Término *</Label>
              <Input id="horario_fim" type="time" {...register("horario_fim")} />
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
              <Input id="local" {...register("local")} placeholder="Ex: Praça da Liberdade" />
              {errors.local && (
                <p className="text-red-500 text-sm mt-1">{errors.local.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input id="cidade" {...register("cidade")} placeholder="Ex: Bonito" />
              {errors.cidade && (
                <p className="text-red-500 text-sm mt-1">{errors.cidade.message}</p>
              )}
            </div>
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
          <div>
            <Label htmlFor="organizador_nome">Nome Completo *</Label>
            <Input id="organizador_nome" {...register("organizador_nome")} placeholder="Seu nome" />
            {errors.organizador_nome && (
              <p className="text-red-500 text-sm mt-1">{errors.organizador_nome.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizador_email">Email *</Label>
              <Input id="organizador_email" type="email" {...register("organizador_email")} placeholder="seu@email.com" />
              {errors.organizador_email && (
                <p className="text-red-500 text-sm mt-1">{errors.organizador_email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="organizador_telefone">Telefone/WhatsApp *</Label>
              <Input id="organizador_telefone" {...register("organizador_telefone")} placeholder="(67) 99999-9999" />
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
            Links {tipoSelecionado === "destaque" ? "(vídeo ou logotipo obrigatório)" : "(opcional)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site_oficial">Site Oficial</Label>
            <Input id="site_oficial" {...register("site_oficial")} placeholder="https://www.seuevento.com.br" />
          </div>
          <div>
            <Label htmlFor="video_promocional">Vídeo Promocional (YouTube)</Label>
            <Input id="video_promocional" {...register("video_promocional")} placeholder="https://www.youtube.com/watch?v=..." />
            <p className="text-xs text-gray-500 mt-1">
              💡 Vídeos do YouTube são exibidos automaticamente. Proporção ideal: 16:9
            </p>
            {errors.video_promocional && (
              <p className="text-red-500 text-sm mt-1">{errors.video_promocional.message}</p>
            )}
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
            <p className="text-xs text-gray-500 mt-1">
              💡 Tamanho ideal: 1920x1080px (16:9) para imagem principal ou 512x512px (quadrado) para logo
            </p>
            {tipoSelecionado === "destaque" && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ Para eventos em destaque, vídeo OU logotipo é obrigatório
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo e Envio */}
      <Card className={tipoSelecionado === "destaque" 
        ? "bg-gradient-to-r from-yellow-400 to-orange-500" 
        : "bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal"
      }>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-white">
              {tipoSelecionado === "destaque" ? (
                <>
                  <p className="text-white/80 text-sm">Investimento:</p>
                  <p className="text-2xl font-bold">R$ {sponsorPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg font-normal text-white/80">/ 30 dias</span></p>
                </>
              ) : (
                <>
                  <p className="text-white/80 text-sm">Cadastro:</p>
                  <p className="text-2xl font-bold">Gratuito</p>
                </>
              )}
            </div>
            <Button 
              type="submit" 
              size="lg"
              disabled={isSubmitting}
              className={tipoSelecionado === "destaque" 
                ? "bg-white text-yellow-600 hover:bg-white/90 font-bold px-8"
                : "bg-white text-ms-primary-blue hover:bg-white/90 font-bold px-8"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  {tipoSelecionado === "destaque" ? (
                    <><Star className="w-4 h-4 mr-2" /> Solicitar Destaque</>
                  ) : (
                    <><Megaphone className="w-4 h-4 mr-2" /> Cadastrar Evento</>
                  )}
                </>
              )}
            </Button>
          </div>
          <p className="text-white/70 text-sm mt-4">
            {tipoSelecionado === "destaque" 
              ? "* Após enviar, você será redirecionado automaticamente para o pagamento seguro."
              : "* Seu evento será analisado antes de ser publicado no calendário."}
          </p>
        </CardContent>
      </Card>
    </form>
  );
};

export default EventSubmissionForm;

