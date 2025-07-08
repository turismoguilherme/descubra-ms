
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface CollaborationQuestionProps {
  wantsToCollaborate: boolean | null;
  setWantsToCollaborate: (value: boolean) => void;
  error?: boolean;
  disabled?: boolean;
}

const CollaborationQuestion: React.FC<CollaborationQuestionProps> = ({
  wantsToCollaborate,
  setWantsToCollaborate,
  error,
  disabled,
}) => {
  return (
    <div className={cn("p-4 border rounded-md", error ? 'border-red-500' : 'border-gray-200')}>
      <Label className="font-semibold text-gray-700">
        Você é morador de Mato Grosso do Sul e gostaria de colaborar com sugestões para melhorar o turismo da sua cidade?
      </Label>
      <RadioGroup
        value={wantsToCollaborate === null ? '' : String(wantsToCollaborate)}
        onValueChange={(value) => setWantsToCollaborate(value === 'true')}
        className="mt-3 space-y-2"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id="wantsToCollaborateYes" disabled={disabled} />
          <Label htmlFor="wantsToCollaborateYes" className="font-normal">Sim, quero colaborar</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="wantsToCollaborateNo" disabled={disabled} />
          <Label htmlFor="wantsToCollaborateNo" className="font-normal">Não, só estou explorando o app</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default CollaborationQuestion;
