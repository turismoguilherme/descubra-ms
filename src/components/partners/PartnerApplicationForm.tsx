import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';

const partnerSchema = z.object({
  name: z.string().min(2, 'Nome da empresa é obrigatório'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  partner_type: z.string().min(1, 'Selecione o tipo de negócio'),
  youtube_url: z.string().url('URL inválida').optional().or(z.literal('')),
  website_url: z.string().url('URL inválida').optional().or(z.literal('')),
  contact_email: z.string().email('Email inválido'),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof partnerSchema>;

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

export const PartnerApplicationForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(partnerSchema),
  });

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
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // 1. Criar registro do parceiro
      const { data: partner, error: insertError } = await supabase
        .from('institutional_partners')
        .insert([{
          name: data.name,
          description: data.description,
          partner_type: data.partner_type,
          website_url: data.website_url || null,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone || null,
          address: data.address || null,
          youtube_url: data.youtube_url || null,
          status: 'pending',
          is_active: false,
        }])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // 2. Upload das fotos (se houver)
      if (photos.length > 0 && partner) {
        const photoUrls = await uploadPhotosToStorage(partner.id);
        
        // Atualizar parceiro com as URLs das fotos
        if (photoUrls.length > 0) {
          await supabase
            .from('institutional_partners')
            .update({ 
              logo_url: photoUrls[0], // Primeira foto como logo/capa
              gallery_images: photoUrls // Todas as fotos na galeria
            })
            .eq('id', partner.id);
        }
      }

      setIsSuccess(true);
      reset();
      setPhotos([]);
      setPhotosPreviews([]);

      toast({
        title: '🎉 Solicitação enviada!',
        description: 'Sua solicitação foi recebida. Entraremos em contato em breve.',
      });

    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
            <Select onValueChange={(value) => setValue('partner_type', value)}>
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

export default PartnerApplicationForm;
