// @ts-nocheck
import React from 'react';
import DiagnosticQuestionnaire, { QuestionnaireAnswers } from '@/components/diagnostic/DiagnosticQuestionnaire';
import { Card } from '@/components/ui/card';

export { QuestionnaireAnswers };

interface PrivateDiagnosticQuestionnaireProps {
  onComplete?: (answers: QuestionnaireAnswers) => void;
}

const PrivateDiagnosticQuestionnaire: React.FC<PrivateDiagnosticQuestionnaireProps> = ({ onComplete }) => {
  return <DiagnosticQuestionnaire onComplete={onComplete} />;
};

export default PrivateDiagnosticQuestionnaire;
