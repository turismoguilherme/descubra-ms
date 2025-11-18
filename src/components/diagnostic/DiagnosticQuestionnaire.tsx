/**
 * Diagnostic Questionnaire Component
 * Questionário completo com configuração básica integrada
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { 
  Building2, 
  MapPin, 
  ArrowRight, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onProgress?: (progress: number) => void;
}

const DiagnosticQuestionnaire: React.FC<DiagnosticQuestionnaireProps> = ({ 
  onComplete,
  onProgress 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'basic' | 'questionnaire'>('basic');
  const [basicInfo, setBasicInfo] = useState({
    businessName: '',
    businessType: '',
    city: '',
    state: 'MS'
  });
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});

  const businessTypes = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'pousada', label: 'Pousada' },
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'agencia', label: 'Agência de Turismo' },
    { value: 'guia', label: 'Guia de Turismo' },
    { value: 'atracao', label: 'Atrativo Turístico' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'evento', label: 'Eventos' },
    { value: 'outro', label: 'Outro' }
  ];

  const handleBasicInfoNext = async () => {
    if (!basicInfo.businessName || !basicInfo.businessType || !basicInfo.city) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    // Salvar informações básicas no perfil
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('users')
          .update({
            business_type: basicInfo.businessType,
            business_name: basicInfo.businessName,
            city: basicInfo.city,
            state: basicInfo.state,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Erro ao salvar informações básicas:', error);
        }
      } catch (error) {
        console.error('Erro ao salvar informações básicas:', error);
      }
    }

    // Avançar para o questionário
    setCurrentStep('questionnaire');
    if (onProgress) {
      onProgress(50);
    }
  };

  const handleQuestionnaireComplete = () => {
    // Combinar informações básicas com respostas do questionário
    const completeAnswers: QuestionnaireAnswers = {
      business_type: basicInfo.businessType,
      location: `${basicInfo.city}, ${basicInfo.state}`,
      experience_years: answers.experience_years || '5-10',
      revenue_monthly: answers.revenue_monthly || '50000-100000',
      occupancy_rate: answers.occupancy_rate || '60-80',
      marketing_channels: answers.marketing_channels || ['website', 'social_media'],
      digital_presence: answers.digital_presence || 'moderate',
      customer_service: answers.customer_service || 'good',
      main_challenges: answers.main_challenges || ['marketing', 'technology'],
      technology_usage: answers.technology_usage || ['booking_system'],
      sustainability: answers.sustainability || 'moderate',
      ...answers
    };

    onComplete(completeAnswers);
  };

  if (currentStep === 'basic') {
    return (
      <SectionWrapper 
        variant="default" 
        title="Configuração Inicial"
        subtitle="Vamos começar configurando seu perfil"
      >
        <CardBox>
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2 pb-6 border-b">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                Bem-vindo ao viajAR
              </h3>
              <p className="text-sm text-slate-600">
                Configure seu perfil para personalizar sua experiência
              </p>
            </div>

            {/* Formulário */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-sm font-medium text-slate-700">
                  Nome do seu negócio *
                </Label>
                <Input
                  id="businessName"
                  placeholder="Ex: Hotel Pantanal, Restaurante Sabores do MS"
                  value={basicInfo.businessName}
                  onChange={(e) => setBasicInfo({ ...basicInfo, businessName: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="businessType" className="text-sm font-medium text-slate-700">
                  Tipo de negócio *
                </Label>
                <Select
                  value={basicInfo.businessType}
                  onValueChange={(value) => setBasicInfo({ ...basicInfo, businessType: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo do seu negócio" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-slate-700">
                    Cidade *
                  </Label>
                  <Input
                    id="city"
                    placeholder="Ex: Campo Grande"
                    value={basicInfo.city}
                    onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-slate-700">
                    Estado
                  </Label>
                  <Select
                    value={basicInfo.state}
                    onValueChange={(value) => setBasicInfo({ ...basicInfo, state: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Botão */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleBasicInfoNext}
                disabled={!basicInfo.businessName || !basicInfo.businessType || !basicInfo.city}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  // Questionário simplificado (pode ser expandido depois)
  return (
    <SectionWrapper 
      variant="default" 
      title="Diagnóstico do Negócio"
      subtitle="Responda algumas perguntas para receber recomendações personalizadas"
    >
      <CardBox>
        <div className="space-y-6">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-slate-600 mb-4 font-medium">
              Configuração básica concluída!
            </p>
            <p className="text-sm text-slate-500 mb-6">
              O questionário completo de diagnóstico está em desenvolvimento. 
              Por enquanto, vamos usar informações padrão baseadas no seu tipo de negócio.
            </p>
            <Button 
              onClick={handleQuestionnaireComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continuar com Análise
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardBox>
    </SectionWrapper>
  );
};

export default DiagnosticQuestionnaire;
export type { QuestionnaireAnswers };
