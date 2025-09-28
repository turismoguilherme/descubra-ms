import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCommercialPartners, NewCommercialPartner } from '@/hooks/useCommercialPartners';
import { Building, Mail, Phone, Globe, MapPin, Briefcase, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  company_name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  contact_email: z.string().email('Email inválido'),
  contact_phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  business_type: z.string().min(1, 'Tipo de negócio é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  services: z.string().min(5, 'Serviços devem ter pelo menos 5 caracteres'),
  target_audience: z.string().min(5, 'Público-alvo deve ter pelo menos 5 caracteres'),
  subscription_plan: z.enum(['basic', 'premium', 'enterprise']),
});

type FormData = z.infer<typeof formSchema>;

const CommercialPartnerForm: React.FC = () => {
  const { createPartner } = useCommercialPartners();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscription_plan: 'basic',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const newPartner: NewCommercialPartner = {
        ...data,
        website: data.website || undefined,
      };

      await createPartner.mutateAsync(newPartner);
      toast.success('Solicitação de parceria enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
      console.error('Erro ao criar parceiro:', error);
    }
  };

  const businessTypes = [
    'Tecnologia',
    'Consultoria',
    'Marketing',
    'Design',
    'Desenvolvimento',
    'Infraestrutura',
    'Segurança',
    'Analytics',
    'Comunicação',
    'Outros',
  ];

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Building className="w-6 h-6 mr-2 text-blue-600" />
            Torne-se um Parceiro Comercial
          </CardTitle>
          <p className="text-gray-600">
            Preencha o formulário abaixo para se candidatar a ser um parceiro comercial da OverFlow One.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações da Empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informações da Empresa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Nome da Empresa *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="company_name"
                      {...register('company_name')}
                      className="pl-10"
                      placeholder="Digite o nome da empresa"
                    />
                  </div>
                  {errors.company_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="business_type">Tipo de Negócio *</Label>
                  <Select onValueChange={(value) => setValue('business_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de negócio" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.business_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição da Empresa *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descreva sua empresa, produtos e serviços oferecidos"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="website">Website (opcional)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="website"
                    {...register('website')}
                    className="pl-10"
                    placeholder="https://www.exemplo.com"
                  />
                </div>
                {errors.website && (
                  <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                )}
              </div>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informações de Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email de Contato *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="contact_email"
                      type="email"
                      {...register('contact_email')}
                      className="pl-10"
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  {errors.contact_email && (
                    <p className="text-red-500 text-sm mt-1">{errors.contact_email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact_phone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="contact_phone"
                      {...register('contact_phone')}
                      className="pl-10"
                      placeholder="(67) 99999-9999"
                    />
                  </div>
                  {errors.contact_phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.contact_phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="city"
                      {...register('city')}
                      className="pl-10"
                      placeholder="Digite a cidade"
                    />
                  </div>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Select onValueChange={(value) => setValue('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informações Comerciais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informações Comerciais
              </h3>
              
              <div>
                <Label htmlFor="services">Serviços Oferecidos *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="services"
                    {...register('services')}
                    className="pl-10"
                    placeholder="Descreva os serviços que sua empresa oferece"
                  />
                </div>
                {errors.services && (
                  <p className="text-red-500 text-sm mt-1">{errors.services.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="target_audience">Público-Alvo *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="target_audience"
                    {...register('target_audience')}
                    className="pl-10"
                    placeholder="Descreva seu público-alvo"
                  />
                </div>
                {errors.target_audience && (
                  <p className="text-red-500 text-sm mt-1">{errors.target_audience.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="subscription_plan">Plano de Assinatura *</Label>
                <Select onValueChange={(value) => setValue('subscription_plan', value as 'basic' | 'premium' | 'enterprise')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Básico - R$ 99/mês
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Premium - R$ 299/mês
                      </div>
                    </SelectItem>
                    <SelectItem value="enterprise">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Enterprise - R$ 999/mês
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.subscription_plan && (
                  <p className="text-red-500 text-sm mt-1">{errors.subscription_plan.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommercialPartnerForm;
