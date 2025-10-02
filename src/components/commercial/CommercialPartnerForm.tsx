import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCommercialPartners, type NewCommercialPartner } from "@/hooks/useCommercialPartners";
import { Building, Mail, Phone, Globe, MapPin } from "lucide-react";

const commercialPartnerSchema = z.object({
  company_name: z.string().min(2, "Nome da empresa é obrigatório"),
  trade_name: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos"),
  business_type: z.enum(['hotel', 'pousada', 'resort', 'agencia_turismo', 'restaurante', 'atrativo_turistico', 'transporte', 'guia_turismo', 'artesanato', 'evento', 'outro']),
  company_size: z.enum(['micro', 'small', 'medium', 'large']),
  contact_person: z.string().min(2, "Nome do contato é obrigatório"),
  contact_email: z.string().email("Email inválido"),
  contact_phone: z.string().optional(),
  contact_whatsapp: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal("")),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
  target_audience: z.array(z.string()).optional(),
  price_range: z.enum(['budget', 'mid_range', 'luxury', 'ultra_luxury']).optional(),
  subscription_plan: z.enum(['basic', 'premium', 'enterprise']),
});

type FormData = z.infer<typeof commercialPartnerSchema>;

export const CommercialPartnerForm = () => {
  const { submitRequest, isSubmitting } = useCommercialPartners();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(commercialPartnerSchema),
    defaultValues: {
      subscription_plan: 'basic',
      company_size: 'small',
    }
  });

  const businessTypes = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'pousada', label: 'Pousada' },
    { value: 'resort', label: 'Resort' },
    { value: 'agencia_turismo', label: 'Agência de Turismo' },
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'atrativo_turistico', label: 'Atrativo Turístico' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'guia_turismo', label: 'Guia de Turismo' },
    { value: 'artesanato', label: 'Artesanato' },
    { value: 'evento', label: 'Evento' },
    { value: 'outro', label: 'Outro' }
  ];

  const companySizes = [
    { value: 'micro', label: 'Microempresa' },
    { value: 'small', label: 'Pequena Empresa' },
    { value: 'medium', label: 'Média Empresa' },
    { value: 'large', label: 'Grande Empresa' }
  ];

  const servicesOptions = [
    'Hospedagem', 'Alimentação', 'Transporte', 'Passeios', 'Eventos',
    'Consultoria', 'Marketing', 'Fotografia', 'Guias', 'Equipamentos'
  ];

  const audienceOptions = [
    'Turistas Nacionais', 'Turistas Internacionais', 'Famílias',
    'Casais', 'Grupos', 'Corporativo', 'Aventura', 'Ecoturismo',
    'Turismo Rural', 'Terceira Idade'
  ];

  const onSubmit = async (data: FormData) => {
    const formData: NewCommercialPartner = {
      company_name: data.company_name!,
      trade_name: data.trade_name,
      cnpj: data.cnpj!,
      business_type: data.business_type!,
      company_size: data.company_size!,
      contact_person: data.contact_person!,
      contact_email: data.contact_email!,
      contact_phone: data.contact_phone,
      contact_whatsapp: data.contact_whatsapp,
      website_url: data.website_url,
      description: data.description,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      services_offered: selectedServices.length > 0 ? selectedServices : undefined,
      target_audience: selectedAudience.length > 0 ? selectedAudience : undefined,
      price_range: data.price_range,
      subscription_plan: data.subscription_plan!,
    };
    
    submitRequest(formData);
    reset();
    setSelectedServices([]);
    setSelectedAudience([]);
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, service]);
    } else {
      setSelectedServices(selectedServices.filter(s => s !== service));
    }
  };

  const handleAudienceChange = (audience: string, checked: boolean) => {
    if (checked) {
      setSelectedAudience([...selectedAudience, audience]);
    } else {
      setSelectedAudience(selectedAudience.filter(a => a !== audience));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Cadastro de Parceiro Comercial
        </CardTitle>
        <p className="text-muted-foreground">
          Preencha os dados da sua empresa para se tornar um parceiro
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações da Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome da Empresa *</Label>
              <Input
                id="company_name"
                {...register("company_name")}
                placeholder="Digite o nome da empresa"
              />
              {errors.company_name && (
                <p className="text-sm text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade_name">Nome Fantasia</Label>
              <Input
                id="trade_name"
                {...register("trade_name")}
                placeholder="Nome fantasia (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                {...register("cnpj")}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              {errors.cnpj && (
                <p className="text-sm text-destructive">{errors.cnpj.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Tipo de Negócio *</Label>
              <Select onValueChange={(value) => setValue("business_type", value as any)}>
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
              {errors.business_type && (
                <p className="text-sm text-destructive">{errors.business_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_size">Porte da Empresa *</Label>
              <Select onValueChange={(value) => setValue("company_size", value as any)}>
                <SelectTrigger>
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
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informações de Contato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Pessoa de Contato *</Label>
                <Input
                  id="contact_person"
                  {...register("contact_person")}
                  placeholder="Nome da pessoa responsável"
                />
                {errors.contact_person && (
                  <p className="text-sm text-destructive">{errors.contact_person.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register("contact_email")}
                  placeholder="email@empresa.com"
                />
                {errors.contact_email && (
                  <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Telefone</Label>
                <Input
                  id="contact_phone"
                  {...register("contact_phone")}
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_whatsapp">WhatsApp</Label>
                <Input
                  id="contact_whatsapp"
                  {...register("contact_whatsapp")}
                  placeholder="(00) 90000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  {...register("website_url")}
                  placeholder="https://www.empresa.com"
                />
                {errors.website_url && (
                  <p className="text-sm text-destructive">{errors.website_url.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  {...register("zip_code")}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição da Empresa</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva sua empresa, seus serviços e diferenciais..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Serviços Oferecidos */}
          <div className="space-y-4">
            <Label>Serviços Oferecidos</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {servicesOptions.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                  />
                  <Label htmlFor={`service-${service}`} className="text-sm">
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Público-Alvo */}
          <div className="space-y-4">
            <Label>Público-Alvo</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {audienceOptions.map((audience) => (
                <div key={audience} className="flex items-center space-x-2">
                  <Checkbox
                    id={`audience-${audience}`}
                    checked={selectedAudience.includes(audience)}
                    onCheckedChange={(checked) => handleAudienceChange(audience, checked as boolean)}
                  />
                  <Label htmlFor={`audience-${audience}`} className="text-sm">
                    {audience}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Plano de Assinatura */}
          <div className="space-y-2">
            <Label htmlFor="subscription_plan">Plano de Assinatura *</Label>
            <Select onValueChange={(value) => setValue("subscription_plan", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico - R$ 49,90/mês</SelectItem>
                <SelectItem value="premium">Premium - R$ 99,90/mês</SelectItem>
                <SelectItem value="enterprise">Enterprise - R$ 199,90/mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommercialPartnerForm;