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
    </Card>
  );
};

export default DiagnosticQuestionnaire;
export type { QuestionnaireAnswers };

