/**
 * Formulário Unificado para Cadastro de Eventos
 * Permite cadastrar eventos gratuitos ou solicitar destaque (pago)
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
  CreditCard,
  Image as ImageIcon,
  Upload,
  X
} from "lucide-react";
import { redirectToEventCheckout } from "@/services/stripe/eventCheckoutService";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
  
  // Banner
  banner_url: z.string().url("URL inválida").optional().or(z.literal("")),
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
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

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

  // Função para fazer upload do banner
  const uploadBanner = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingBanner(true);
      const BUCKET_NAME = 'event-images';
      
      // Validar arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Use JPG, JPEG, PNG ou WEBP",
          variant: "destructive",
        });
        return null;
      }

      // Validar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O banner deve ter no máximo 10MB",
          variant: "destructive",
        });
        return null;
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `banners/${uuidv4()}.${fileExt}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        // Se o bucket não existir, mostrar mensagem mais amigável
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          console.warn('⚠️ Bucket event-images não encontrado. O evento será enviado sem banner.');
          return null; // Retorna null silenciosamente, o onSubmit vai tratar
        }
        toast({
          title: "Erro no upload",
          description: uploadError.message || "Erro ao fazer upload da imagem",
          variant: "destructive",
        });
        return null;
      }

      // Obter URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;
    } catch (error: any) {
      console.error('Erro ao fazer upload do banner:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao fazer upload da imagem",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Handler para seleção de arquivo
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler para remover arquivo
  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const onSubmit = async (data: EventFormData) => {
    console.log('🚀 Iniciando envio do evento...', data);
    setIsSubmitting(true);
    try {
      // Fazer upload do banner se houver arquivo
      let bannerImageUrl = data.banner_url || null;
      console.log('📸 Banner URL inicial:', bannerImageUrl);
      
      if (bannerFile) {
        console.log('📤 Fazendo upload do banner...', bannerFile.name);
        const uploadedUrl = await uploadBanner(bannerFile);
        if (uploadedUrl) {
          bannerImageUrl = uploadedUrl;
          console.log('✅ Upload do banner concluído:', uploadedUrl);
        } else {
          console.warn('⚠️ Falha no upload do banner, continuando sem banner');
          // Se o upload falhar, continua sem banner (banner é opcional)
          toast({
            title: "Aviso",
            description: "Não foi possível fazer upload do banner. O evento será enviado sem imagem.",
            variant: "default",
          });
        }
      }

      // Preparar data de início e fim com horário (formato ISO)
      const startDateTime = new Date(`${data.data_inicio}T${data.horario_inicio}:00`).toISOString();
      const endDateTime = data.data_fim
        ? new Date(`${data.data_fim}T${data.horario_fim}:00`).toISOString()
        : new Date(`${data.data_inicio}T${data.horario_fim}:00`).toISOString();

      console.log('📅 Datas preparadas:', { startDateTime, endDateTime });

      const eventData = {
        name: data.titulo,
        description: data.descricao,
        start_date: startDateTime,
        end_date: endDateTime,
        location: `${data.local}, ${data.cidade}`,
        image_url: bannerImageUrl,
        site_oficial: data.site_oficial || null,
        video_url: data.video_promocional || null,
        organizador_nome: data.organizador_nome,
        organizador_email: data.organizador_email,
        organizador_telefone: data.organizador_telefone,
        is_visible: false, // Precisa de aprovação
        is_sponsored: data.tipo === "destaque",
        sponsor_payment_status: data.tipo === "destaque" ? "pending" : null,
        sponsor_amount: data.tipo === "destaque" ? 499.90 : null,
        // category: data.categoria, // Temporariamente removido - coluna não existe no banco
      };

      console.log('📦 Dados do evento preparados:', eventData);

      // Criar evento no banco usando cliente Supabase autenticado
      console.log('💾 Inserindo evento no banco de dados...');
      const { data: createdEvents, error: insertError } = await supabase
        .from('events')
        .insert(eventData)
        .select();

      if (insertError) {
        console.error('❌ Erro ao criar evento:', insertError);
        console.error('❌ Detalhes do erro:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        toast({
          title: "Erro ao enviar evento",
          description: insertError.message || "Tente novamente mais tarde.",
          variant: "destructive",
        });
        throw new Error(insertError.message || 'Erro ao enviar evento');
      }

      console.log('✅ Evento criado com sucesso!', createdEvents);

      if (!createdEvents || createdEvents.length === 0) {
        console.error('❌ Nenhum evento foi retornado após inserção');
        throw new Error('Erro ao criar evento');
      }

      const eventId = createdEvents[0]?.id;

      // Se for evento em destaque, redirecionar para checkout Stripe
      if (data.tipo === "destaque" && eventId) {
        toast({
          title: "Redirecionando para pagamento...",
          description: "Você será redirecionado para a página de pagamento seguro.",
        });

        // Pequeno delay para mostrar o toast
        await new Promise(resolve => setTimeout(resolve, 1000));

        await redirectToEventCheckout({
          eventId,
          eventName: data.titulo,
          organizerEmail: data.organizador_email,
          organizerName: data.organizador_nome,
        });
        return; // Não mostra tela de sucesso, vai redirecionar
      }

      // Evento gratuito - mostra sucesso
      setSubmitSuccess(true);
      toast({
        title: "Evento enviado com sucesso!",
        description: "Seu evento será analisado e publicado em breve.",
      });
    } catch (error: any) {
      console.error('❌ Erro geral ao enviar evento:', error);
      console.error('❌ Stack trace:', error.stack);
      toast({
        title: "Erro ao enviar evento",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Processo de envio finalizado');
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
            {tipoSelecionado === "destaque" 
              ? "Recebemos sua solicitação. Nossa equipe irá analisar e entrar em contato para confirmar o pagamento."
              : "Recebemos seu evento. Após análise, ele será publicado no calendário."}
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Próximos passos:</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
              <li>Análise do evento (até 24h)</li>
              {tipoSelecionado === "destaque" && <li>Envio do link de pagamento por email</li>}
              <li>Publicação no calendário de eventos</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleFormSubmit = (data: EventFormData) => {
    console.log('📝 Formulário submetido!', data);
    console.log('📝 Erros de validação:', errors);
    onSubmit(data);
  };

  const handleFormError = (errors: any) => {
    console.log('❌ Erros de validação do formulário:', errors);
    
    // Mapear nomes de campos para nomes amigáveis
    const fieldNames: Record<string, string> = {
      titulo: 'Título',
      descricao: 'Descrição',
      categoria: 'Categoria',
      data_inicio: 'Data de início',
      horario_inicio: 'Horário de início',
      horario_fim: 'Horário de término',
      local: 'Local',
      cidade: 'Cidade',
      organizador_nome: 'Nome do organizador',
      organizador_email: 'Email do organizador',
      organizador_telefone: 'Telefone do organizador',
    };
    
    // Mostrar toast com os erros
    const errorMessages = Object.keys(errors).map(key => {
      const fieldName = fieldNames[key] || key;
      const message = errors[key]?.message || `${fieldName} é obrigatório`;
      return `${fieldName}: ${message}`;
    });
    
    toast({
      title: "Formulário incompleto",
      description: errorMessages.length > 0 
        ? errorMessages[0] + (errorMessages.length > 1 ? ` e mais ${errorMessages.length - 1} campo(s)` : '')
        : "Por favor, preencha todos os campos obrigatórios",
      variant: "destructive",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="space-y-8">
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
                    R$ 499,90
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

      {/* Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-ms-primary-blue" />
            Banner do Evento (opcional)
          </CardTitle>
          <CardDescription>
            Adicione uma imagem de destaque para seu evento. Você pode fazer upload de uma imagem ou informar uma URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de arquivo */}
          <div>
            <Label htmlFor="banner_file">Upload de Imagem</Label>
            {!bannerFile ? (
              <div className="mt-2">
                <label
                  htmlFor="banner_file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (máx. 10MB)</p>
                  </div>
                  <input
                    id="banner_file"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleBannerFileChange}
                    disabled={isUploadingBanner}
                  />
                </label>
              </div>
            ) : (
              <div className="mt-2 relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={bannerPreview || ''}
                    alt="Preview do banner"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{bannerFile.name}</p>
              </div>
            )}
            {isUploadingBanner && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Fazendo upload da imagem...
              </div>
            )}
          </div>

          {/* Divisor OU */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">ou</span>
            </div>
          </div>

          {/* URL de imagem */}
          <div>
            <Label htmlFor="banner_url">URL da Imagem</Label>
            <Input
              id="banner_url"
              {...register("banner_url")}
              placeholder="https://exemplo.com/imagem.jpg"
              disabled={!!bannerFile}
            />
            {errors.banner_url && (
              <p className="text-red-500 text-sm mt-1">{errors.banner_url.message}</p>
            )}
            {bannerFile && (
              <p className="text-xs text-gray-500 mt-1">
                Remova o arquivo para usar uma URL
              </p>
            )}
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
                  <p className="text-2xl font-bold">R$ 499,90 <span className="text-lg font-normal text-white/80">/ 30 dias</span></p>
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
              onClick={() => {
                console.log('🖱️ Botão de submit clicado!');
                console.log('🖱️ Estado do formulário:', { isSubmitting, errors });
              }}
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
              ? "* Após enviar, nossa equipe irá analisar e enviar o link de pagamento por email."
              : "* Seu evento será analisado antes de ser publicado no calendário."}
          </p>
        </CardContent>
      </Card>
    </form>
  );
};

export default EventSubmissionForm;

