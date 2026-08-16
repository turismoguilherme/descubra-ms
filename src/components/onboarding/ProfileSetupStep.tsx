/**
 * Etapa de Configuração do Perfil
 * Coleta informações básicas sobre o negócio do usuário
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Users, 
  Calendar,
  Star,
  CheckCircle
} from 'lucide-react';

interface ProfileSetupStepProps {
  data: unknown;
  onNext: (data?: unknown) => void;
  onPrevious: () => void;
}

const ProfileSetupStep: React.FC<ProfileSetupStepProps> = ({ data, onNext }) => {
  const dataObj = data as Record<string, unknown>;
  const [formData, setFormData] = useState({
    businessName: (dataObj.businessName as string) || '',
    businessType: (dataObj.businessType as string) || '',
    location: (dataObj.location as string) || '',
    experience: (dataObj.experience as string) || '',
    description: '',
    website: '',
    phone: '',
    email: ''
  });

  const businessTypes = [
    { value: 'hotel', label: 'Hotel', icon: '🏨', description: 'Hospedagem e acomodações' },
    { value: 'pousada', label: 'Pousada', icon: '🏡', description: 'Hospedagem familiar' },
    { value: 'restaurante', label: 'Restaurante', icon: '🍽️', description: 'Gastronomia e alimentação' },
    { value: 'agencia', label: 'Agência de Turismo', icon: '🎯', description: 'Pacotes e roteiros' },
    { value: 'guia', label: 'Guia de Turismo', icon: '🗺️', description: 'Acompanhamento e orientação' },
    { value: 'atracao', label: 'Atrativo Turístico', icon: '🎪', description: 'Pontos de interesse' },
    { value: 'transporte', label: 'Transporte', icon: '🚌', description: 'Locomoção e deslocamento' },
    { value: 'evento', label: 'Eventos', icon: '🎉', description: 'Organização de eventos' },
    { value: 'outro', label: 'Outro', icon: '🏢', description: 'Outro tipo de negócio' }
  ];

  const experienceLevels = [
    { value: 'iniciante', label: 'Iniciante (0-2 anos)', description: 'Estou começando no turismo' },
    { value: 'intermediario', label: 'Intermediário (2-5 anos)', description: 'Tenho alguma experiência' },
    { value: 'avancado', label: 'Avançado (5-10 anos)', description: 'Sou experiente na área' },
    { value: 'expert', label: 'Expert (10+ anos)', description: 'Sou especialista em turismo' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const isFormValid = formData.businessName && formData.businessType && formData.location;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          Conte-nos sobre seu negócio
        </h2>
        <p className="text-gray-600">
          Essas informações nos ajudam a personalizar sua experiência
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário Principal */}
        <div className="space-y-6">
          {/* Nome do Negócio */}
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-medium">
              Nome do seu negócio *
            </Label>
            <Input
              id="businessName"
              placeholder="Ex: Hotel Pantanal, Restaurante Sabores do MS"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Tipo de Negócio */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tipo de negócio *
            </Label>
            <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo do seu negócio" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{type.icon}</span>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Localização *
            </Label>
            <Input
              id="location"
              placeholder="Ex: Bonito - MS, Campo Grande - MS"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Experiência */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sua experiência no turismo
            </Label>
            <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu nível de experiência" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-gray-500">{level.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição do negócio (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Conte-nos um pouco sobre seu negócio, seus diferenciais, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full"
              rows={3}
            />
          </div>

          {/* Contato (Opcional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Telefone (opcional)
              </Label>
              <Input
                id="phone"
                placeholder="(67) 99999-9999"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email (opcional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@seunegocio.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium">
              Website (opcional)
            </Label>
            <Input
              id="website"
              placeholder="https://www.seunegocio.com"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Preview do Perfil */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Preview do seu perfil
          </h3>
          
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {formData.businessName || 'Nome do negócio'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {businessTypes.find(t => t.value === formData.businessType)?.label || 'Tipo de negócio'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{formData.location || 'Localização'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {experienceLevels.find(e => e.value === formData.experience)?.label || 'Experiência'}
                    </span>
                  </div>
                </div>

                {formData.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {formData.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {formData.businessType && (
                    <Badge variant="secondary" className="text-xs">
                      {businessTypes.find(t => t.value === formData.businessType)?.icon} 
                      {businessTypes.find(t => t.value === formData.businessType)?.label}
                    </Badge>
                  )}
                  
                  {formData.experience && (
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {experienceLevels.find(e => e.value === formData.experience)?.label}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              💡 Dicas para um melhor diagnóstico
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Seja específico sobre o tipo de negócio</li>
              <li>• A localização ajuda na personalização</li>
              <li>• A experiência influencia as recomendações</li>
              <li>• Você pode alterar essas informações depois</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validação */}
      {!isFormValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Preencha os campos obrigatórios (marcados com *) para continuar
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSetupStep;
