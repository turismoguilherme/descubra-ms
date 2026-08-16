import { HelpTooltip } from './HelpTooltip';

interface AdminSectionHeaderProps {
  title: string;
  description?: string;
  helpText?: string;
}

/**
 * Componente para cabeçalhos de seções dentro de módulos admin.
 * Menor que AdminPageHeader, usado para subseções e abas.
 */
export function AdminSectionHeader({ title, description, helpText }: AdminSectionHeaderProps) {
  return (
    <div className="mb-4 text-center">
      <div className="flex items-center justify-center gap-2 mx-auto max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {helpText && <HelpTooltip content={helpText} />}
      </div>
      {description && (
        <p className="text-gray-600 text-sm mt-1 mx-auto max-w-2xl">{description}</p>
      )}
    </div>
  );
}
