/**
 * Profile Completion Component
 * Guia usuário para completar perfil com gamificação
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Circle, 
  Upload, 
  Image as ImageIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Wifi,
  Coffee,
  Car,
  Utensils,
  Sparkles,
  Gift,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileData {
  photos: File[];
  description: string;
  phone: string;
  website: string;
  openingHours: {
    open: string;
    close: string;
  };
  amenities: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface ProfileCompletionProps {
  onComplete: (data: ProfileData) => void;
  initialData?: Partial<ProfileData>;
}

interface CompletionStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  required: boolean;
  weight: number; // Peso para cálculo da porcentagem
}

export default function ProfileCompletion({ onComplete, initialData }: ProfileCompletionProps) {
  const [profileData, setProfileData] = useState<ProfileData>({
    photos: [],
    description: '',
    phone: '',
    website: '',
    openingHours: { open: '08:00', close: '18:00' },
    amenities: [],
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    ...initialData
  });

  const AVAILABLE_AMENITIES = [
    { id: 'wifi', name: 'Wi-Fi', icon: <Wifi className="h-4 w-4" /> },
    { id: 'breakfast', name: 'Café da Manhã', icon: <Coffee className="h-4 w-4" /> },
    { id: 'parking', name: 'Estacionamento', icon: <Car className="h-4 w-4" /> },
    { id: 'restaurant', name: 'Restaurante', icon: <Utensils className="h-4 w-4" /> },
  ];

  // Calcula steps de completude
  const steps: CompletionStep[] = [
    {
      id: 'photos',
      title: 'Adicionar Fotos',
      description: 'Mínimo 3 fotos do estabelecimento',
      icon: <ImageIcon className="h-5 w-5" />,
      completed: profileData.photos.length >= 3,
      required: true,
      weight: 25
    },
    {
      id: 'description',
      title: 'Descrição',
      description: 'Conte sobre seu estabelecimento',
      icon: <Sparkles className="h-5 w-5" />,
      completed: profileData.description.length >= 100,
      required: true,
      weight: 20
    },
    {
      id: 'contact',
      title: 'Informações de Contato',
      description: 'Telefone e email',
      icon: <Phone className="h-5 w-5" />,
      completed: profileData.phone.length > 0,
      required: true,
      weight: 15
    },
    {
      id: 'hours',
      title: 'Horário de Funcionamento',
      description: 'Quando você está aberto',
      icon: <Clock className="h-5 w-5" />,
      completed: profileData.openingHours.open !== '' && profileData.openingHours.close !== '',
      required: true,
      weight: 15
    },
    {
      id: 'location',
      title: 'Endereço Completo',
      description: 'Para clientes te encontrarem',
      icon: <MapPin className="h-5 w-5" />,
      completed: profileData.location.address !== '' && profileData.location.city !== '',
      required: true,
      weight: 15
    },
    {
      id: 'amenities',
      title: 'Comodidades',
      description: 'O que você oferece',
      icon: <Coffee className="h-5 w-5" />,
      completed: profileData.amenities.length >= 2,
      required: false,
      weight: 10
    }
  ];

  // Calcula porcentagem de completude
  const completionPercentage = Math.round(
    steps.reduce((acc, step) => acc + (step.completed ? step.weight : 0), 0)
  );

  const isProfileComplete = completionPercentage === 100;
  const requiredStepsComplete = steps.filter(s => s.required).every(s => s.completed);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProfileData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 20) // Máximo 20 fotos
    }));
  };

  const removePhoto = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setProfileData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleSubmit = () => {
    if (requiredStepsComplete) {
      onComplete(profileData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Complete Seu Perfil</h2>
            <p className="text-sm text-muted-foreground">
              Quanto mais completo, mais visibilidade você terá!
            </p>
          </div>
          
          {/* Badge de Completude */}
          <Badge 
            variant={isProfileComplete ? "default" : "secondary"}
            className={cn(
              "text-lg px-4 py-2",
              isProfileComplete && "bg-green-600"
            )}
          >
            <Trophy className="h-4 w-4 mr-1" />
            {completionPercentage}%
          </Badge>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <Progress value={completionPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {steps.filter(s => s.completed).length} de {steps.length} etapas concluídas
          </p>
        </div>

        {/* Incentivo */}
        {isProfileComplete ? (
          <Alert className="border-green-500 bg-green-50">
            <Gift className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>🎉 Parabéns!</strong> Seu perfil está 100% completo! 
              Você ganhou <strong>1 mês grátis</strong> no plano Professional!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Complete 100% e ganhe 1 mês grátis!</strong> Faltam apenas {100 - completionPercentage}%
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Lista de Etapas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => (
          <Card 
            key={step.id}
            className={cn(
              "border-2 transition-all",
              step.completed && "border-green-500 bg-green-50/50"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {step.icon}
                  <CardTitle className="text-sm">{step.title}</CardTitle>
                </div>
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <CardDescription className="text-xs">
                {step.description}
                {step.required && (
                  <Badge variant="destructive" className="ml-2 text-xs">Obrigatório</Badge>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Formulário Detalhado */}
      <div className="space-y-6">
        {/* 1. Fotos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Fotos do Estabelecimento
              {profileData.photos.length >= 3 && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
            <CardDescription>
              Adicione pelo menos 3 fotos. Máximo: 20 fotos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="h-4 w-4" />
                Adicionar Fotos
              </Button>
              <span className="text-sm text-muted-foreground">
                {profileData.photos.length}/20 fotos
              </span>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Preview */}
            {profileData.photos.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {profileData.photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(idx)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Descrição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Descrição
              {profileData.description.length >= 100 && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
            <CardDescription>
              Mínimo 100 caracteres. Conte sobre seu estabelecimento, diferenciais e o que torna você especial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: Localizado no centro de Bonito, nosso hotel oferece uma experiência única em ecoturismo..."
              value={profileData.description}
              onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-32"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {profileData.description.length}/100 caracteres mínimos
            </p>
          </CardContent>
        </Card>

        {/* 3. Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informações de Contato
              {profileData.phone && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  type="tel"
                  placeholder="(67) 99999-9999"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website (opcional)</label>
                <Input
                  type="url"
                  placeholder="https://seusite.com.br"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horário de Funcionamento
              {profileData.openingHours.open && profileData.openingHours.close && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Abertura</label>
                <Input
                  type="time"
                  value={profileData.openingHours.open}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    openingHours: { ...prev.openingHours, open: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fechamento</label>
                <Input
                  type="time"
                  value={profileData.openingHours.close}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    openingHours: { ...prev.openingHours, close: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
              {profileData.location.address && profileData.location.city && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Endereço</label>
              <Input
                placeholder="Rua, número, complemento"
                value={profileData.location.address}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value }
                }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade</label>
                <Input
                  placeholder="Bonito"
                  value={profileData.location.city}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Input
                  placeholder="MS"
                  maxLength={2}
                  value={profileData.location.state}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    location: { ...prev.location, state: e.target.value.toUpperCase() }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CEP</label>
                <Input
                  placeholder="79290-000"
                  value={profileData.location.zipCode}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    location: { ...prev.location, zipCode: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Comodidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Comodidades
              {profileData.amenities.length >= 2 && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
            <CardDescription>
              Selecione pelo menos 2 comodidades oferecidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AVAILABLE_AMENITIES.map((amenity) => (
                <Button
                  key={amenity.id}
                  variant={profileData.amenities.includes(amenity.id) ? "default" : "outline"}
                  className="gap-2 h-auto py-3"
                  onClick={() => toggleAmenity(amenity.id)}
                >
                  {amenity.icon}
                  <span className="text-sm">{amenity.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 pt-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {/* Salvar rascunho */}}
        >
          Salvar Rascunho
        </Button>
        <Button
          className="flex-1"
          size="lg"
          disabled={!requiredStepsComplete}
          onClick={handleSubmit}
        >
          {isProfileComplete ? (
            <>
              <Gift className="mr-2 h-4 w-4" />
              Finalizar e Ganhar 1 Mês Grátis
            </>
          ) : (
            'Continuar →'
          )}
        </Button>
      </div>
    </div>
  );
}


