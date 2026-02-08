import { HelpTooltip } from './HelpTooltip';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  helpText?: string;
}

export function AdminPageHeader({ title, description, helpText }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 text-center">
      <div className="flex items-center justify-center gap-2 mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {helpText && <HelpTooltip content={helpText} />}
      </div>
      <p className="text-gray-600 mt-1 mx-auto max-w-3xl">{description}</p>
    </div>
  );
}

