// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Upload, 
  X, 
  Youtube,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  User,
  Briefcase
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Função para criar schema dinâmico baseado em includePassword
const createPartnerSchema = (includePassword: boolean) => {
  const baseSchema = z.object({
    name: z.string().min(2, 'Nome da empresa é obrigatório'),
    description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
    partner_type: z.string().min(1, 'Selecione o tipo de negócio'),
    person_type: z.enum(['pf', 'pj'], { required_error: 'Selecione o tipo de pessoa' }),
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    youtube_url: z.string().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, {
      message: 'URL inválida',
    }),
    website_url: z.string().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, {
      message: 'URL inválida',
    }),
    contact_email: z.string().email('Email inválido'),
    contact_phone: z.string().optional(),
    address: z.string().optional(),
  });

  // Adicionar campos de senha apenas se includePassword for true
  if (includePassword) {
    return baseSchema.extend({
      password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
      confirmPassword: z.string().min(6, 'Confirme sua senha'),
    }).refine((data) => data.password === data.confirmPassword, {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    }).refine((data) => {
      // CPF obrigatório para pessoa física
      if (data.person_type === 'pf') {
        const cpfClean = data.cpf?.replace(/\D/g, '') || '';
        return cpfClean.length >= 11;
      }
      return true;
    }, {
      message: 'CPF é obrigatório para pessoa física (mínimo 11 dígitos)',
      path: ['cpf'],
    }).refine((data) => {
      // CNPJ obrigatório para pessoa jurídica
      if (data.person_type === 'pj') {
        const cnpjClean = data.cnpj?.replace(/\D/g, '') || '';
        return cnpjClean.length >= 14;
      }
      return true;
    }, {
      message: 'CNPJ é obrigatório para pessoa jurídica (mínimo 14 dígitos)',
      path: ['cnpj'],
    });
  }

  // Schema sem senha
  return baseSchema.refine((data) => {
    // CPF obrigatório para pessoa física
    if (data.person_type === 'pf') {
      const cpfClean = data.cpf?.replace(/\D/g, '') || '';
      return cpfClean.length >= 11;
    }
    return true;
  }, {
    message: 'CPF é obrigatório para pessoa física (mínimo 11 dígitos)',
    path: ['cpf'],
  }).refine((data) => {
    // CNPJ obrigatório para pessoa jurídica
    if (data.person_type === 'pj') {
      const cnpjClean = data.cnpj?.replace(/\D/g, '') || '';
      return cnpjClean.length >= 14;
    }
    return true;
  }, {
    message: 'CNPJ é obrigatório para pessoa jurídica (mínimo 14 dígitos)',
    path: ['cnpj'],
  });
};

type FormData = z.infer<ReturnType<typeof createPartnerSchema>>;

const businessTypes = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'pousada', label: 'Pousada' },
  { value: 'resort', label: 'Resort' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'atrativo_turistico', label: 'Atrativo Turístico' },
  { value: 'agencia_turismo', label: 'Agência de Turismo' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'guia_turismo', label: 'Guia de Turismo' },
  { value: 'artesanato', label: 'Artesanato' },
  { value: 'evento', label: 'Eventos' },
  { value: 'outro', label: 'Outro' }
];

interface PartnerApplicationFormProps {
  onComplete?: (data: {
    partnerId: string;
    partnerName: string;
    partnerEmail: string;
    password: string;
  }) => void;
  includePassword?: boolean;
}

export const PartnerApplicationForm = ({ onComplete, includePassword = false }: PartnerApplicationFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  console.log('📋 [PartnerApplicationForm] Componente renderizado', { includePassword, hasOnComplete: !!onComplete });

  const partnerSchema = createPartnerSchema(includePassword);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(partnerSchema),
    mode: 'onSubmit',
    defaultValues: {
      person_type: 'pj', // Setar valor padrão
      partner_type: '', // Inicializar vazio para forçar seleção
    },
  });

  // Chave para localStorage
  const STORAGE_KEY = 'partner_application_form_progress';

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('📥 [PartnerApplicationForm] Carregando dados salvos do localStorage');
        
        // Restaurar campos (exceto senhas por segurança)
        Object.keys(parsed).forEach((key) => {
          if (key !== 'password' && key !== 'confirmPassword' && parsed[key] !== undefined && parsed[key] !== '') {
            setValue(key as any, parsed[key], { shouldValidate: false });
          }
        });
        
        toast({
          title: 'Dados restaurados',
          description: 'Seus dados foram restaurados automaticamente.',
          duration: 3000,
        });
      }
    } catch (error) {
      console.warn('Erro ao carregar dados salvos:', error);
    }
  }, []);

  // Salvar progresso automaticamente (com debounce)
  useEffect(() => {
    const subscription = watch((data) => {
      // Debounce: aguardar 1 segundo após última mudança
      const timeoutId = setTimeout(() => {
        try {
          // Não salvar senhas por segurança
          const dataToSave = { ...data };
          delete dataToSave.password;
          delete dataToSave.confirmPassword;
          
          // Salvar apenas se houver dados relevantes
          const hasRelevantData = Object.values(dataToSave).some(
            (value) => value !== undefined && value !== null && value !== ''
          );
          
          if (hasRelevantData) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            console.log('💾 [PartnerApplicationForm] Progresso salvo automaticamente');
          }
        } catch (error) {
          console.warn('Erro ao salvar progresso:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  // Garantir que person_type seja setado inicialmente
  useEffect(() => {
    const currentPersonType = watch('person_type');
    if (!currentPersonType) {
      setValue('person_type', 'pj', { shouldValidate: false });
    }
  }, [setValue, watch]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 5) {
      toast({
        title: 'Limite de fotos',
        description: 'Você pode enviar no máximo 5 fotos.',
        variant: 'destructive',
      });
      return;
    }

    const newPhotos = [...photos, ...files].slice(0, 5);
    setPhotos(newPhotos);

    // Criar previews
    const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
    setPhotosPreviews(newPreviews);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photosPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotosPreviews(newPreviews);
  };

  const uploadPhotosToStorage = async (partnerId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${partnerId}/${Date.now()}_${i}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('partner-images')
        .upload(fileName, file);

      if (error) {
        console.error('Erro ao fazer upload:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('partner-images')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
      
      setUploadProgress(((i + 1) / photos.length) * 100);
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: FormData) => {
    console.log('🚀 [PartnerApplicationForm] onSubmit chamado', { data, includePassword, hasOnComplete: !!onComplete });
    
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      console.log('📝 [PartnerApplicationForm] Iniciando processo de cadastro...');
      // 1. Se includePassword, criar conta no Supabase Auth primeiro
      let authUserId: string | null = null;
      if (includePassword && data.password) {
        console.log('🔐 [PartnerApplicationForm] Criando conta no Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.contact_email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/descubrams/partner/login`,
          },
        });

        if (authError) {
          console.warn('⚠️ [PartnerApplicationForm] Erro ao criar conta:', authError);
          // Se email já existe, verificar se já existe um parceiro com esse email
          if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
            console.log('🔄 [PartnerApplicationForm] Email já existe, verificando se já existe parceiro...');
            
            // Verificar se já existe um parceiro com esse email
            const { data: existingPartner, error: checkError } = await supabase
              .from('institutional_partners')
              .select('id, name, contact_email')
              .eq('contact_email', data.contact_email)
              .maybeSingle();
            
            if (existingPartner) {
              // Parceiro já existe com esse email
              throw new Error('Já existe uma solicitação de parceria com este email. Entre em contato conosco se precisar de ajuda.');
            }
            
            // Email existe no auth mas não há parceiro
            // NÃO criar parceiro sem conta no Auth (segurança e para garantir que login funcione)
            throw new Error('Este email já está cadastrado em nossa plataforma. Por favor, faça login primeiro ou use outro email para criar uma nova conta de parceiro.');
          } else {
            throw new Error(`Erro ao criar conta: ${authError.message}`);
          }
        } else {
          authUserId = authData?.user?.id || null;
          console.log('✅ [PartnerApplicationForm] Conta criada com sucesso');
          
          // Garantir que sempre temos authUserId quando includePassword é true
          if (!authUserId) {
            throw new Error('Falha ao criar conta: usuário não foi criado corretamente. Tente novamente.');
          }
        }
      }

      // Validação de segurança: se includePassword é true, authUserId deve existir
      if (includePassword && !authUserId) {
        console.error('❌ [PartnerApplicationForm] Tentativa de criar parceiro sem authUserId quando includePassword é true');
        throw new Error('Falha na autenticação: não foi possível criar a conta. Por favor, tente novamente.');
      }

      // 2. Criar registro do parceiro
      console.log('💾 [PartnerApplicationForm] Criando registro do parceiro...');
      const partnerData = {
        name: data.name,
        description: data.description,
        partner_type: data.partner_type,
        person_type: data.person_type,
        cpf: data.person_type === 'pf' ? data.cpf : null,
        cnpj: data.person_type === 'pj' ? data.cnpj : null,
        website_url: data.website_url || null,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        address: data.address || null,
        youtube_url: data.youtube_url || null,
        status: 'pending',
        is_active: false,
        created_by: authUserId,
        stripe_connect_status: 'pending',
      };
      console.log('📦 [PartnerApplicationForm] Dados do parceiro:', partnerData);
      
      // Usar função stored procedure para bypassar RLS
      const { data: functionResult, error: functionError } = await supabase.rpc('insert_partner_application', {
        p_name: partnerData.name,
        p_description: partnerData.description,
        p_partner_type: partnerData.partner_type,
        p_person_type: partnerData.person_type,
        p_cpf: partnerData.cpf,
        p_cnpj: partnerData.cnpj,
        p_website_url: partnerData.website_url,
        p_contact_email: partnerData.contact_email,
        p_contact_phone: partnerData.contact_phone,
        p_address: partnerData.address,
        p_youtube_url: partnerData.youtube_url,
        p_created_by: partnerData.created_by,
      });

      // Converter resultado da função para formato esperado
      const partner = functionResult && Array.isArray(functionResult) && functionResult.length > 0 ? {
        id: functionResult[0].partner_id,
        name: functionResult[0].partner_name,
        contact_email: functionResult[0].partner_email,
      } : null;
      const insertError = functionError;

      if (insertError) {
        console.error('❌ [PartnerApplicationForm] Erro ao inserir parceiro:', insertError);
        console.error('❌ [PartnerApplicationForm] Erro completo:', JSON.stringify(insertError, null, 2));
        throw new Error(insertError.message);
      }

      if (!partner) {
        console.error('❌ [PartnerApplicationForm] Insert retornou sem erro mas também sem partner!');
        console.error('❌ [PartnerApplicationForm] insertError:', insertError);
        console.error('❌ [PartnerApplicationForm] partner:', partner);
        throw new Error('Falha ao criar parceiro: nenhum dado retornado');
      }

      console.log('✅ [PartnerApplicationForm] Parceiro criado com sucesso:', partner?.id);

      // 3. Upload das fotos (se houver)
      if (photos.length > 0 && partner) {
        console.log(`📸 [PartnerApplicationForm] Fazendo upload de ${photos.length} foto(s)...`);
        const photoUrls = await uploadPhotosToStorage(partner.id);
        
        // Atualizar parceiro com as URLs das fotos
        if (photoUrls.length > 0) {
          console.log('🖼️ [PartnerApplicationForm] Atualizando parceiro com URLs das fotos...');
          await supabase
            .from('institutional_partners')
            .update({ 
              logo_url: photoUrls[0], // Primeira foto como logo/capa
              gallery_images: photoUrls // Todas as fotos na galeria
            })
            .eq('id', partner.id);
          console.log('✅ [PartnerApplicationForm] Fotos atualizadas com sucesso');
        }
      }

      // Limpar dados salvos após submissão bem-sucedida
      try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🧹 [PartnerApplicationForm] Dados salvos limpos após submissão bem-sucedida');
      } catch (error) {
        console.warn('Erro ao limpar dados salvos:', error);
      }

      // 4. Se onComplete existe (wizard), chamar callback
      if (onComplete && includePassword) {
        console.log('🎯 [PartnerApplicationForm] Chamando callback onComplete do wizard...');
        onComplete({
          partnerId: partner.id,
          partnerName: data.name,
          partnerEmail: data.contact_email,
          password: data.password || '',
        });
        console.log('✅ [PartnerApplicationForm] Callback executado, retornando...');
        return; // Não mostrar tela de sucesso, wizard continua
      }

      // 5. Comportamento padrão (sem wizard)
      setIsSuccess(true);
      reset();
      setPhotos([]);
      setPhotosPreviews([]);
      
      // Limpar dados salvos também no comportamento padrão
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn('Erro ao limpar dados salvos:', error);
      }

      toast({
        title: '🎉 Solicitação enviada!',
        description: 'Sua solicitação foi recebida. Entraremos em contato em breve.',
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PartnerApplicationForm] Erro ao enviar solicitação:', err);
      console.error('❌ [PartnerApplicationForm] Stack trace:', err.stack);
      console.error('❌ [PartnerApplicationForm] Erro completo:', error);
      toast({
        title: 'Erro ao enviar',
        description: err.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      console.log('🏁 [PartnerApplicationForm] Finalizando processo...');
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Solicitação Enviada!
          </h3>
          <p className="text-green-700 mb-6">
            Recebemos sua solicitação de parceria. Nossa equipe entrará em contato 
            em até 48 horas para discutir os próximos passos.
          </p>
          <Button 
            onClick={() => setIsSuccess(false)}
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-100"
          >
            Enviar outra solicitação
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleFormSubmit = handleSubmit(
    onSubmit,
    (errors) => {
      console.error('❌ [PartnerApplicationForm] Erros de validação:', errors);
      console.error('❌ [PartnerApplicationForm] Campos com erro:', Object.keys(errors));
      toast({
        title: 'Erro de validação',
        description: 'Por favor, verifique os campos marcados em vermelho.',
        variant: 'destructive',
      });
    }
  );

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {/* Dados da Empresa */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-ms-primary-blue">
          <Building2 className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Dados da Empresa</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nome oficial da empresa"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="partner_type">Tipo de Negócio *</Label>
            <Select 
              value={watch('partner_type') || ''}
              onValueChange={(value) => {
                setValue('partner_type', value, { shouldValidate: true });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.partner_type && (
              <p className="text-sm text-red-500">{errors.partner_type.message}</p>
            )}
          </div>

          {/* Tipo de Pessoa (PF/PJ) */}
          <div className="space-y-3 md:col-span-2">
            <Label>Tipo de Cadastro *</Label>
            <RadioGroup
              value={watch('person_type') || 'pj'}
              onValueChange={(value: 'pf' | 'pj') => {
                setValue('person_type', value, { shouldValidate: true });
                // Limpar CPF/CNPJ quando mudar o tipo
                if (value === 'pf') {
                  setValue('cnpj', '');
                } else {
                  setValue('cpf', '');
                }
              }}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pj" id="pj" />
                <Label htmlFor="pj" className="flex items-center gap-2 cursor-pointer">
                  <Briefcase className="w-4 h-4 text-ms-primary-blue" />
                  Pessoa Jurídica (CNPJ)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pf" id="pf" />
                <Label htmlFor="pf" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4 text-ms-primary-blue" />
                  Pessoa Física (CPF)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* CNPJ (para PJ) */}
          {watch('person_type') === 'pj' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                {...register('cnpj')}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              {errors.cnpj && (
                <p className="text-sm text-red-500">{errors.cnpj.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Necessário para receber pagamentos via Stripe
              </p>
            </div>
          )}

          {/* CPF (para PF) */}
          {watch('person_type') === 'pf' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                {...register('cpf')}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.cpf && (
                <p className="text-sm text-red-500">{errors.cpf.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Necessário para receber pagamentos via Stripe
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição do Empreendimento *</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Descreva sua empresa, serviços oferecidos, diferenciais..."
            rows={4}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Fotos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-ms-primary-blue">
          <Upload className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Fotos (máximo 5)</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {photosPreviews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={preview}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {photos.length < 5 && (
            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-ms-primary-blue hover:bg-blue-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Adicionar</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-sm text-gray-500">
          A primeira foto será usada como imagem principal do seu empreendimento.
        </p>
      </div>

      {/* Vídeo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-ms-primary-blue">
          <Youtube className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Vídeo Promocional (opcional)</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube_url">Link do YouTube</Label>
          <Input
            id="youtube_url"
            {...register('youtube_url')}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {errors.youtube_url && (
            <p className="text-sm text-red-500">{errors.youtube_url.message}</p>
          )}
        </div>
      </div>

      {/* Contato */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-ms-primary-blue">
          <Mail className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Contato</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email *</Label>
            <Input
              id="contact_email"
              type="email"
              {...register('contact_email')}
              placeholder="contato@empresa.com"
            />
            {errors.contact_email && (
              <p className="text-sm text-red-500">{errors.contact_email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Telefone / WhatsApp</Label>
            <Input
              id="contact_phone"
              {...register('contact_phone')}
              placeholder="(67) 90000-0000"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="website_url">Site</Label>
            <div className="flex items-center">
              <Globe className="w-4 h-4 text-gray-400 mr-2" />
              <Input
                id="website_url"
                {...register('website_url')}
                placeholder="https://www.seusite.com.br"
                className="flex-1"
              />
            </div>
            {errors.website_url && (
              <p className="text-sm text-red-500">{errors.website_url.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-ms-primary-blue">
          <MapPin className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Localização</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço completo</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Rua, número, bairro - Cidade, MS"
          />
        </div>
      </div>

      {/* Senha (apenas se includePassword) */}
      {includePassword && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-ms-primary-blue">
            <Lock className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Criar Senha</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Mínimo 6 caracteres"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="Digite a senha novamente"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Enviando fotos...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-ms-primary-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-ms-secondary-yellow text-black hover:bg-ms-secondary-yellow/90 font-bold py-6 text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar Solicitação de Parceria'
        )}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        Ao enviar, você concorda com nossos termos de parceria. 
        Nossa equipe entrará em contato para discutir os detalhes.
      </p>
    </form>
  );
};

// Export both named and default for compatibility
export default PartnerApplicationForm;
