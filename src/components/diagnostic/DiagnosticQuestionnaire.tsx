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
    </Card>
  );
};

export default DiagnosticQuestionnaire;
