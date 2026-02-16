import { Label } from '@/components/ui/label';
import { HelpTooltip } from './HelpTooltip';

interface LabelWithHelpProps {
  htmlFor: string;
  label: string;
  helpText?: string;
}

export function LabelWithHelp({ htmlFor, label, helpText }: LabelWithHelpProps) {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {helpText && <HelpTooltip content={helpText} />}
    </div>
  );
}









