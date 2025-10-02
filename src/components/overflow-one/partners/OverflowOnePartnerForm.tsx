import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Building2, Upload } from 'lucide-react';
import { useOverflowOnePartners, NewOverflowOnePartner } from '@/hooks/useOverflowOnePartners';
import { useToast } from '@/hooks/use-toast';

const partnerSchema = z.object({
  company_name: z.string().min(2, 'Nome da empresa é obrigatório'),
  trade_name: z.string().optional(),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  business_type: z.enum(['technology', 'consulting', 'marketing', 'design', 'development', 'infrastructure', 'security', 'analytics', 'communication', 'other']),
  company_size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  country: z.string().default('Brasil'),
  website_url: z.string().url('URL inválida').optional().or(z.literal('')),
  contact_email: z.string().email('Email inválido'),
  contact_phone: z.string().optional(),
  contact_whatsapp: z.string().optional(),
  services_offered: z.array(z.string()).min(1, 'Pelo menos um serviço deve ser informado'),
  target_audience: z.array(z.string()).min(1, 'Pelo menos um público-alvo deve ser informado'),
  subscription_plan: z.enum(['basic', 'premium', 'enterprise']),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

const businessTypes = [
  { value: 'technology', label: 'Tecnologia' },
  { value: 'consulting', label: 'Consultoria' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Desenvolvimento' },
  { value: 'infrastructure', label: 'Infraestrutura' },
  { value: 'security', label: 'Segurança' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'communication', label: 'Comunicação' },
  { value: 'other', label: 'Outros' }
];

const companySizes = [
  { value: 'startup', label: 'Startup (1-10 funcionários)' },
  { value: 'small', label: 'Pequena (11-50 funcionários)' },
  { value: 'medium', label: 'Média (51-200 funcionários)' },
  { value: 'large', label: 'Grande (201-1000 funcionários)' },
  { value: 'enterprise', label: 'Enterprise (1000+ funcionários)' }
];

const subscriptionPlans = [
  { value: 'basic', label: 'Básico - R$ 99/mês', description: 'Até 5 produtos, analytics básico' },
  { value: 'premium', label: 'Premium - R$ 299/mês', description: 'Até 20 produtos, analytics avançado' },
  { value: 'enterprise', label: 'Enterprise - R$ 999/mês', description: 'Produtos ilimitados, consultoria dedicada' }
];

const OverflowOnePartnerForm: React.FC = () => {
  const [services, setServices] = useState<string[]>(['']);
  const [targetAudiences, setTargetAudiences] = useState<string[]>(['']);
  const [newService, setNewService] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('');
  
  const { submitRequest, isSubmitting } = useOverflowOnePartners();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      country: 'Brasil',
      subscription_plan: 'basic'
    }
  });

  const addService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const addTargetAudience = () => {
    if (newTargetAudience.trim()) {
      setTargetAudiences([...targetAudiences, newTargetAudience.trim()]);
      setNewTargetAudience('');
    }
  };

  const removeTargetAudience = (index: number) => {
    setTargetAudiences(targetAudiences.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PartnerFormData) => {
    const validServices = services.filter(s => s.trim());
    const validTargetAudiences = targetAudiences.filter(t => t.trim());

    if (validServices.length === 0) {
      toast({
        title: "Erro",
        description: "Pelo menos um serviço deve ser informado",
        variant: "destructive"
      });
      return;
    }

    if (validTargetAudiences.length === 0) {
      toast({
        title: "Erro",
        description: "Pelo menos um público-alvo deve ser informado",
        variant: "destructive"
      });
      return;
    }

    const partnerData: NewOverflowOnePartner = {
      ...data,
      services_offered: validServices,
      target_audience: validTargetAudiences
    };

    submitRequest(partnerData);
    reset();
    setServices(['']);
    setTargetAudiences(['']);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Torne-se um Parceiro Overflow One
          </CardTitle>
          <p className="text-muted-foreground">
            Preencha o formulário abaixo para se tornar um parceiro da nossa plataforma
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações da Empresa</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome da Empresa *</label>
                  <Input
                    {...register('company_name')}
                    placeholder="Ex: Tech Solutions Ltda"
                    className={errors.company_name ? 'border-red-500' : ''}
                  />
                  {errors.company_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.company_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Nome Fantasia</label>
                  <Input
                    {...register('trade_name')}
                    placeholder="Ex: TechSol"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Descrição da Empresa *</label>
                <Textarea
                  {...register('description')}
                  placeholder="Descreva sua empresa, seus valores e o que a torna única..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Negócio *</label>
                  <Select onValueChange={(value) => setValue('business_type', value as any)}>
                    <SelectTrigger className={errors.business_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o tipo de negócio" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.business_type && (
                    <p className="text-sm text-red-500 mt-1">{errors.business_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Porte da Empresa *</label>
                  <Select onValueChange={(value) => setValue('company_size', value as any)}>
                    <SelectTrigger className={errors.company_size ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o porte" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.company_size && (
                    <p className="text-sm text-red-500 mt-1">{errors.company_size.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Localização</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Cidade *</label>
                  <Input
                    {...register('city')}
                    placeholder="Ex: São Paulo"
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Estado *</label>
                  <Input
                    {...register('state')}
                    placeholder="Ex: SP"
                    className={errors.state ? 'border-red-500' : ''}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">País</label>
                  <Input
                    {...register('country')}
                    placeholder="Brasil"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    {...register('contact_email')}
                    type="email"
                    placeholder="contato@empresa.com"
                    className={errors.contact_email ? 'border-red-500' : ''}
                  />
                  {errors.contact_email && (
                    <p className="text-sm text-red-500 mt-1">{errors.contact_email.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    {...register('contact_phone')}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">WhatsApp</label>
                  <Input
                    {...register('contact_whatsapp')}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    {...register('website_url')}
                    placeholder="https://www.empresa.com"
                    className={errors.website_url ? 'border-red-500' : ''}
                  />
                  {errors.website_url && (
                    <p className="text-sm text-red-500 mt-1">{errors.website_url.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Serviços */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Serviços Oferecidos *</h3>
              
              <div className="space-y-2">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={service}
                      onChange={(e) => {
                        const newServices = [...services];
                        newServices[index] = e.target.value;
                        setServices(newServices);
                      }}
                      placeholder="Ex: Desenvolvimento de Software"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeService(index)}
                      disabled={services.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Adicionar novo serviço"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  />
                  <Button type="button" size="sm" onClick={addService}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Público-Alvo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Público-Alvo *</h3>
              
              <div className="space-y-2">
                {targetAudiences.map((audience, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={audience}
                      onChange={(e) => {
                        const newAudiences = [...targetAudiences];
                        newAudiences[index] = e.target.value;
                        setTargetAudiences(newAudiences);
                      }}
                      placeholder="Ex: Pequenas e médias empresas"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeTargetAudience(index)}
                      disabled={targetAudiences.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center gap-2">
                  <Input
                    value={newTargetAudience}
                    onChange={(e) => setNewTargetAudience(e.target.value)}
                    placeholder="Adicionar novo público-alvo"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetAudience())}
                  />
                  <Button type="button" size="sm" onClick={addTargetAudience}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Plano de Assinatura */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Plano de Assinatura *</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan) => (
                  <Card 
                    key={plan.value}
                    className={`cursor-pointer transition-all ${
                      watch('subscription_plan') === plan.value 
                        ? 'ring-2 ring-blue-500 border-blue-500' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setValue('subscription_plan', plan.value as any)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h4 className="font-semibold">{plan.label}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {errors.subscription_plan && (
                <p className="text-sm text-red-500">{errors.subscription_plan.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => reset()}>
                Limpar
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

export default OverflowOnePartnerForm;





