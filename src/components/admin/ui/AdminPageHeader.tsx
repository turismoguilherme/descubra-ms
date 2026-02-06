import { HelpTooltip } from './HelpTooltip';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  helpText?: string;
}

export function AdminPageHeader({ title, description, helpText }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {helpText && <HelpTooltip content={helpText} />}
      </div>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
  );
}

