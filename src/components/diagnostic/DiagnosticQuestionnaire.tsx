/**
 * Diagnostic Questionnaire Component
 * Componente padronizado com SectionWrapper e CardBox
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AlertCircle } from 'lucide-react';

interface DiagnosticQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onProgress?: (progress: number) => void;
}

export interface DiagnosticAnswers extends QuestionnaireAnswers {
  business_type: string;
}

const DiagnosticQuestionnaire: React.FC<DiagnosticQuestionnaireProps> = ({ 
  onComplete,
  onProgress 
}) => {
  const handleSkip = () => {
    // Criar respostas padrão
    const defaultAnswers: QuestionnaireAnswers = {
      business_type: 'hotel',
      experience_years: '5-10',
      revenue_monthly: '50000-100000',
      occupancy_rate: '60-80',
      marketing_channels: ['website', 'social_media'],
      digital_presence: 'moderate',
      customer_service: 'good',
      main_challenges: ['marketing', 'technology'],
      technology_usage: ['booking_system'],
      sustainability: 'moderate'
    };
    onComplete(defaultAnswers);
  };

  return (
    <SectionWrapper 
      variant="default" 
      title="Diagnóstico Inteligente"
      subtitle="Complete o questionário para receber uma análise personalizada do seu negócio"
    >
      <CardBox>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <p className="text-slate-600 mb-4 font-medium">
            O questionário de diagnóstico está em desenvolvimento.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Por enquanto, você pode pular esta etapa e continuar com o dashboard.
          </p>
          <Button 
            onClick={handleSkip} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Pular e Continuar
          </Button>
        </div>
      </CardBox>
    </SectionWrapper>
  );
};

export default DiagnosticQuestionnaire;
export type { QuestionnaireAnswers };
