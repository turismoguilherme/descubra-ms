/**
 * Formulário Unificado para Cadastro de Eventos (gratuito)
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
  Megaphone,
  Gift
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EventImageUpload from "./EventImageUpload";


const eventSchema = z.object({
  // Dados do evento


  // Dados do evento
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  descricao: z.string().min(30, "Descrição deve ter pelo menos 30 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),

  // Datas
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  data_fim: z.string().min(1, "Data de término é obrigatória"),
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
})
  .refine(
    (data) => !data.data_inicio || !data.data_fim || data.data_fim >= data.data_inicio,
    {
      message: "Data de término deve ser igual ou posterior à data de início",
      path: ["data_fim"],
    }
  )
  .refine(
    (data) => {
      if (data.data_inicio !== data.data_fim) return true;
      return (data.horario_fim || '') >= (data.horario_inicio || '');
    },
    {
      message: "No mesmo dia, o horário de término deve ser igual ou posterior ao de início",
      path: ["horario_fim"],
    }
  );



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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },

  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      cidade: "",
      categoria: "",
    },
  });


  // Função para detectar a região turística baseada na cidade
  const detectTouristRegion = async (cidade: string): Promise<string | null> => {
    try {
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
          const { data: regions, error } = await supabase
            .from("tourist_regions")
            .select("id")
            .eq("slug", regionSlug)
            .limit(1);

          if (!error && regions && regions.length > 0) {
            return regions[0].id;
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
      // Detectar automaticamente a região turística baseada na cidade
      const touristRegionId = await detectTouristRegion(data.cidade);

      const eventData: Record<string, any> = {
        external_id: `submission-${Date.now()}`,
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        local: `${data.local}, ${data.cidade}`,
        cidade: data.cidade,
        site_oficial: data.site_oficial || null,
        video_promocional: data.video_promocional || null,
        imagem_principal: data.logo_evento || null,
        organizador: data.organizador_nome,
        contato_email: data.organizador_email,
        contato_telefone: data.organizador_telefone,
        is_visible: false,
        is_sponsored: false,
        start_time: data.horario_inicio,
        end_time: data.horario_fim,
      };

      if (touristRegionId) {
        eventData.tourist_region_id = touristRegionId;
      }

      // Criar evento no banco
      const { error: insertError } = await supabase
        .from("events")
        .insert(eventData as any)
        .select("id");

      if (insertError) {
        const statusLabel = (insertError as any)?.code ? ` [${(insertError as any).code}]` : "";
        throw new Error(`${insertError.message || "Erro ao enviar evento"}${statusLabel}`);
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
      const isAuthPolicyError =
        err.message.includes("401") ||
        err.message.toLowerCase().includes("row-level security") ||
        err.message.toLowerCase().includes("permission denied");
      toast({
        title: "Erro ao enviar evento",
        description: isAuthPolicyError
          ? "O envio público de eventos está temporariamente bloqueado por regra de segurança. Já estamos aplicando a correção."
          : (err.message || "Tente novamente mais tarde."),
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
      {/* Cadastro gratuito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            Cadastro gratuito de evento
          </CardTitle>
          <CardDescription>
            O cadastro é 100% gratuito. Após a análise da equipe, seu evento aparece no calendário do Descubra MS.
          </CardDescription>
        </CardHeader>
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
              <Label htmlFor="data_fim">Data de Término *</Label>
              <Input
                id="data_fim"
                type="date"
                min={watch("data_inicio") || undefined}
                {...register("data_fim")}
              />
              {errors.data_fim && (
                <p className="text-red-500 text-sm mt-1">{errors.data_fim.message}</p>
              )}
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
            Links (opcional)
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
          </div>
        </CardContent>
      </Card>


      {/* Resumo e Envio */}
      <Card className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-white">
              <p className="text-white/80 text-sm">Cadastro:</p>
              <p className="text-2xl font-bold">Gratuito</p>
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
                <><Megaphone className="w-4 h-4 mr-2" /> Cadastrar Evento</>
              )}
            </Button>
          </div>
          <p className="text-white/70 text-sm mt-4">
            * Seu evento será analisado antes de ser publicado no calendário.
          </p>
        </CardContent>
      </Card>

    </form>
  );
};

export default EventSubmissionForm;

