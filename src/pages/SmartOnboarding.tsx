/**
 * Smart Onboarding Page
 * Onboarding inteligente que detecta automaticamente o negócio e configura tudo
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  ArrowRight, 
  CheckCircle, 
  Zap,
  Shield,
  Target,
  Users,
  Globe,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import SmartSetupWizard from '@/components/ai/SmartSetupWizard';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';

type OnboardingStep = 'info' | 'detection' | 'setup' | 'complete';

const SmartOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('info');
  const [userData, setUserData] = useState({
    companyName: '',
    businessCategory: '',
    website: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    description: ''
  });
  const [setupResult, setSetupResult] = useState<any>(null);

  const handleInfoSubmit = () => {
    if (userData.companyName && userData.businessCategory) {
      setCurrentStep('detection');
    }
  };

  const handleSetupComplete = (result: any) => {
    setSetupResult(result);
    setCurrentStep('complete');
  };

  const handleCancel = () => {
    navigate('/viajar');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'info': return 'Informações do Negócio';
      case 'detection': return 'Detecção Inteligente';
      case 'setup': return 'Configuração Automática';
      case 'complete': return 'Configuração Completa';
      default: return 'Onboarding Inteligente';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'info': return 'Conte-nos sobre seu negócio para personalizarmos sua experiência';
      case 'detection': return 'Nossa IA está analisando seu negócio para configuração personalizada';
      case 'setup': return 'Configurando automaticamente as melhores funcionalidades para seu negócio';
      case 'complete': return 'Sua ViaJAR está configurada e funcionando perfeitamente!';
      default: return '';
    }
  };

  const renderInfoStep = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Onboarding Inteligente</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Conte-nos sobre seu negócio e nossa IA configurará tudo automaticamente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <Input
                id="companyName"
                value={userData.companyName}
                onChange={(e) => setUserData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Ex: Pousada do Sol"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="businessCategory">Categoria do Negócio *</Label>
              <select
                id="businessCategory"
                value={userData.businessCategory}
                onChange={(e) => setUserData(prev => ({ ...prev, businessCategory: e.target.value }))}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Selecione uma categoria</option>
                <option value="hotel">Hotel/Pousada</option>
                <option value="agency">Agência de Viagem</option>
                <option value="restaurant">Restaurante</option>
                <option value="attraction">Atração Turística</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div>
              <Label htmlFor="website">Website (opcional)</Label>
              <Input
                id="website"
                value={userData.website}
                onChange={(e) => setUserData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="Ex: pousadadosol.com.br"
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
              <Input
                id="whatsapp"
                value={userData.whatsapp}
                onChange={(e) => setUserData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="Ex: (67) 99999-9999"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="facebook">Facebook (opcional)</Label>
              <Input
                id="facebook"
                value={userData.facebook}
                onChange={(e) => setUserData(prev => ({ ...prev, facebook: e.target.value }))}
                placeholder="Ex: facebook.com/pousadadosol"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram (opcional)</Label>
              <Input
                id="instagram"
                value={userData.instagram}
                onChange={(e) => setUserData(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="Ex: @pousadadosol"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição do Negócio (opcional)</Label>
          <Textarea
            id="description"
            value={userData.description}
            onChange={(e) => setUserData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Conte-nos mais sobre seu negócio..."
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">Como funciona?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Nossa IA analisará suas informações e configurará automaticamente as melhores
                funcionalidades para seu tipo de negócio. Você só precisa aprovar as configurações!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetectionStep = () => {
    return (
      <SmartSetupWizard
        userData={{
          companyName: userData.companyName,
          businessCategory: userData.businessCategory,
          website: userData.website,
          socialMedia: {
            whatsapp: userData.whatsapp,
            facebook: userData.facebook,
            instagram: userData.instagram
          },
          description: userData.description
        }}
        onComplete={handleSetupComplete}
        onCancel={() => setCurrentStep('info')}
      />
    );
  };

  const renderCompleteStep = () => {
    return (
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
          <h2 className="text-3xl font-bold text-green-600">Parabéns!</h2>
        </div>
        
        <p className="text-lg text-muted-foreground">
          Sua ViaJAR está configurada e funcionando perfeitamente!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Funcionalidades Ativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {setupResult?.configuredFeatures?.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {setupResult?.nextSteps?.map((step: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span>{step}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Sua ViaJAR está pronta!</h4>
              <p className="text-sm text-green-700">
                Todas as funcionalidades foram configuradas automaticamente baseadas no seu tipo de negócio.
                Você pode começar a usar imediatamente ou personalizar ainda mais no dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/viajar/dashboard')}>
            Ir para Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/viajar')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'info': return renderInfoStep();
      case 'detection': return renderDetectionStep();
      case 'setup': return renderDetectionStep();
      case 'complete': return renderCompleteStep();
      default: return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 'info') {
      return userData.companyName && userData.businessCategory;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20">
      <ViaJARNavbar />
      
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Brain className="w-8 h-8 text-primary" />
                {getStepTitle()}
              </h1>
              <p className="text-muted-foreground mt-1">
                {getStepDescription()}
              </p>
            </div>
            
            {currentStep === 'complete' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Configurado
              </Badge>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            {['info', 'detection', 'setup', 'complete'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep === step ? 'bg-primary text-white' :
                    ['info', 'detection', 'setup', 'complete'].indexOf(currentStep) > index ? 
                    'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}
                `}>
                  {['info', 'detection', 'setup', 'complete'].indexOf(currentStep) > index ? 
                    <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    ['info', 'detection', 'setup', 'complete'].indexOf(currentStep) > index ? 
                    'bg-green-600' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep === 'info' && (
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              onClick={handleInfoSubmit}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartOnboarding;
