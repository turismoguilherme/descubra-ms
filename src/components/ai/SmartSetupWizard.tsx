/**
 * Smart Setup Wizard Component
 * Assistente inteligente para configuração automática da ViaJAR
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Zap,
  Shield,
  ArrowRight,
  ArrowLeft,
  Target,
  Users,
  MessageSquare,
  Globe,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  detectBusinessType, 
  requestAutoSetupPermission, 
  executeAutoSetup,
  type DetectionResult,
  type BusinessProfile 
} from '@/services/ai/SmartBusinessDetector';

interface SmartSetupWizardProps {
  userData: {
    companyName: string;
    businessCategory: string;
    website?: string;
    socialMedia?: {
      whatsapp?: string;
      facebook?: string;
      instagram?: string;
    };
    description?: string;
  };
  onComplete: (result: any) => void;
  onCancel: () => void;
  className?: string;
}

type WizardStep = 'detection' | 'permissions' | 'configuration' | 'testing' | 'complete';

const SmartSetupWizard: React.FC<SmartSetupWizardProps> = ({
  userData,
  onComplete,
  onCancel,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('detection');
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configurationResult, setConfigurationResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    performDetection();
  }, []);

  const performDetection = async () => {
    try {
      const result = await detectBusinessType(userData);
      setDetectionResult(result);
      setProgress(20);
    } catch (error) {
      console.error('Erro na detecção:', error);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleNext = async () => {
    switch (currentStep) {
      case 'detection':
        if (detectionResult?.autoSetupAvailable) {
          setCurrentStep('permissions');
          setProgress(40);
        } else {
          setCurrentStep('configuration');
          setProgress(60);
        }
        break;
      
      case 'permissions':
        const permissionResult = await requestAutoSetupPermission(
          detectionResult!.businessProfile,
          selectedFeatures
        );
        setPermissions(permissionResult.permissions);
        setCurrentStep('configuration');
        setProgress(60);
        break;
      
      case 'configuration':
        await startConfiguration();
        break;
      
      case 'testing':
        setCurrentStep('complete');
        setProgress(100);
        break;
    }
  };

  const startConfiguration = async () => {
    setIsConfiguring(true);
    setCurrentStep('testing');
    setProgress(80);

    try {
      const result = await executeAutoSetup(
        detectionResult!.businessProfile,
        permissions
      );
      
      setConfigurationResult(result);
      
      if (result.success) {
        setCurrentStep('complete');
        setProgress(100);
      } else {
        // Mostrar erros e permitir retry
        setCurrentStep('configuration');
        setProgress(60);
      }
    } catch (error) {
      console.error('Erro na configuração:', error);
      setCurrentStep('configuration');
      setProgress(60);
    } finally {
      setIsConfiguring(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'detection': return 'Detecção Inteligente';
      case 'permissions': return 'Permissões Necessárias';
      case 'configuration': return 'Configuração Automática';
      case 'testing': return 'Testando Configuração';
      case 'complete': return 'Configuração Completa';
      default: return 'Assistente Inteligente';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'detection': return 'Analisando seu negócio para configuração personalizada';
      case 'permissions': return 'Precisamos de algumas permissões para configurar automaticamente';
      case 'configuration': return 'Configurando funcionalidades selecionadas';
      case 'testing': return 'Testando se tudo está funcionando corretamente';
      case 'complete': return 'Sua ViaJAR está configurada e funcionando!';
      default: return '';
    }
  };

  const renderDetectionStep = () => {
    if (!detectionResult) {
      return (
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Analisando seu negócio...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold">Negócio Detectado!</h3>
          </div>
          <p className="text-muted-foreground">
            Identificamos que você é um{' '}
            <span className="font-semibold text-primary">
              {detectionResult.businessProfile.type === 'hotel' ? 'hotel' :
               detectionResult.businessProfile.type === 'agency' ? 'agência de viagem' :
               detectionResult.businessProfile.type === 'restaurant' ? 'restaurante' :
               detectionResult.businessProfile.type === 'attraction' ? 'atração turística' :
               'negócio turístico'}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Funcionalidades Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {detectionResult.suggestedFeatures.map((feature, index) => (
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
                <Globe className="w-5 h-5" />
                Canais Detectados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {detectionResult.businessProfile.channels.whatsapp && (
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-600" />
                  <span className="text-sm">WhatsApp</span>
                </div>
              )}
              {detectionResult.businessProfile.channels.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Website</span>
                </div>
              )}
              {detectionResult.businessProfile.channels.facebook && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </div>
              )}
              {detectionResult.businessProfile.channels.instagram && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-pink-600" />
                  <span className="text-sm">Instagram</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {detectionResult.autoSetupAvailable ? (
          <Alert>
            <Zap className="w-4 h-4" />
            <AlertDescription>
              Podemos configurar automaticamente as funcionalidades para seu negócio!
              Quer que configuremos agora?
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Para configuração automática, precisamos de acesso a pelo menos um canal
              (WhatsApp, site, redes sociais). Você pode nos fornecer essas informações?
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderPermissionsStep = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold">Permissões Necessárias</h3>
          </div>
          <p className="text-muted-foreground">
            Para configurar automaticamente, precisamos de algumas permissões
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Funcionalidades Disponíveis:</h4>
          {detectionResult?.suggestedFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={feature}
                checked={selectedFeatures.includes(feature)}
                onCheckedChange={() => handleFeatureToggle(feature)}
              />
              <Label htmlFor={feature} className="flex-1 cursor-pointer">
                <div className="font-medium">{feature}</div>
                <div className="text-sm text-muted-foreground">
                  {getFeatureDescription(feature)}
                </div>
              </Label>
            </div>
          ))}
        </div>

        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            <strong>Privacidade:</strong> Todas as permissões são solicitadas de forma transparente
            e você pode revogá-las a qualquer momento. Não acessamos dados pessoais sem permissão.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  const renderConfigurationStep = () => {
    if (isConfiguring) {
      return (
        <div className="text-center space-y-6">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Configurando ViaJAR...</h3>
            <p className="text-muted-foreground">
              Instalando funcionalidades selecionadas
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Configurando Guilherme...
            </div>
            <div className="text-sm text-muted-foreground">
              Integrando com seus canais...
            </div>
            <div className="text-sm text-muted-foreground">
              Testando configurações...
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Settings className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold">Configuração Automática</h3>
          </div>
          <p className="text-muted-foreground">
            Vamos configurar as funcionalidades selecionadas automaticamente
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Funcionalidades a serem configuradas:</h4>
          {selectedFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {configurationResult && !configurationResult.success && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Erro na configuração:</strong> {configurationResult.errors.join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderTestingStep = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h3 className="text-2xl font-bold">Configuração Concluída!</h3>
          </div>
          <p className="text-muted-foreground">
            Sua ViaJAR está configurada e funcionando
          </p>
        </div>

        {configurationResult?.configuredFeatures.map((feature: string, index: number) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium">{feature}</span>
            <Badge variant="secondary" className="ml-auto">Ativo</Badge>
          </div>
        ))}

        <div className="space-y-3">
          <h4 className="font-semibold">Próximos passos:</h4>
          {configurationResult?.nextSteps.map((step: string, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <ArrowRight className="w-4 h-4 text-primary" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCompleteStep = () => {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
          <h3 className="text-3xl font-bold text-green-600">Parabéns!</h3>
        </div>
        <p className="text-lg text-muted-foreground">
          Sua ViaJAR está configurada e funcionando perfeitamente!
        </p>
        <div className="space-y-2">
          <p className="font-semibold">Funcionalidades ativas:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {configurationResult?.configuredFeatures.map((feature: string, index: number) => (
              <Badge key={index} variant="secondary">{feature}</Badge>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getFeatureDescription = (feature: string): string => {
    const descriptions: Record<string, string> = {
      'Guilherme': 'Atendimento automático 24/7',
      'WhatsApp Business Integration': 'IA integrada ao seu WhatsApp',
      'Website Chat Integration': 'Chat inteligente no seu site',
      'Facebook Messenger Integration': 'IA no Facebook Messenger',
      'Instagram DM Integration': 'IA no Instagram',
      'Revenue Optimizer': 'Otimização automática de preços',
      'Market Intelligence': 'Análise de concorrência',
      'Lead Generation': 'Captação automática de leads',
      'Sistema de Reservas': 'Reservas online inteligentes'
    };
    return descriptions[feature] || 'Funcionalidade personalizada';
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'detection': return renderDetectionStep();
      case 'permissions': return renderPermissionsStep();
      case 'configuration': return renderConfigurationStep();
      case 'testing': return renderTestingStep();
      case 'complete': return renderCompleteStep();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'detection': return detectionResult !== null;
      case 'permissions': return selectedFeatures.length > 0;
      case 'configuration': return !isConfiguring;
      case 'testing': return true;
      case 'complete': return false;
      default: return false;
    }
  };

  const getNextButtonText = () => {
    switch (currentStep) {
      case 'detection': return 'Continuar';
      case 'permissions': return 'Solicitar Permissões';
      case 'configuration': return 'Configurar Agora';
      case 'testing': return 'Finalizar';
      case 'complete': return 'Concluído';
      default: return 'Próximo';
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">Assistente Inteligente ViaJAR</CardTitle>
        </div>
        <p className="text-muted-foreground">
          {getStepDescription()}
        </p>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Detecção</span>
            <span>Permissões</span>
            <span>Configuração</span>
            <span>Teste</span>
            <span>Concluído</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {renderCurrentStep()}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={currentStep === 'complete'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          {currentStep !== 'complete' && (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {getNextButtonText()}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartSetupWizard;
