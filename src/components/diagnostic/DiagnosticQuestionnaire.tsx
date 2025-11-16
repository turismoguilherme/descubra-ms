<<<<<<< HEAD
/**
 * Diagnostic Questionnaire Component
 * Componente placeholder - funcionalidade em desenvolvimento
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionnaireAnswers } from '@/types/diagnostic';

interface DiagnosticQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onProgress?: (progress: number) => void;
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
    <Card>
      <CardHeader>
        <CardTitle>Diagnóstico Inteligente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            O questionário de diagnóstico está em desenvolvimento.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Por enquanto, você pode pular esta etapa e continuar com o dashboard.
          </p>
          <Button onClick={handleSkip} className="bg-blue-600 hover:bg-blue-700 text-white">
            Pular e Continuar
          </Button>
        </div>
      </CardContent>
=======
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface QuestionnaireAnswers {
  business_type: string;
  [key: string]: any;
}

export interface DiagnosticAnswers extends QuestionnaireAnswers {
  business_type: string;
}

interface DiagnosticQuestionnaireProps {
  onComplete?: (answers: QuestionnaireAnswers) => void;
}

const DiagnosticQuestionnaire: React.FC<DiagnosticQuestionnaireProps> = ({ onComplete }) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Questionário de Diagnóstico</h3>
      <p className="text-muted-foreground">
        Complete o questionário para receber uma análise personalizada do seu negócio.
      </p>
      <Button 
        className="mt-4" 
        onClick={() => onComplete?.({ business_type: 'hotel' })}
      >
        Iniciar Questionário
      </Button>
>>>>>>> d0cd2ce2a6af1f17bf0d27c8bd765cd104c8c0ce
    </Card>
  );
};

export default DiagnosticQuestionnaire;
<<<<<<< HEAD
export type { QuestionnaireAnswers };

=======
>>>>>>> d0cd2ce2a6af1f17bf0d27c8bd765cd104c8c0ce
