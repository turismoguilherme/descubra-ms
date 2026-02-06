import React from 'react';

interface SectionWrapperProps {
  variant?: 'inventario' | 'cats' | 'default';
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  variant = 'default',
  title,
  subtitle,
  actions,
  children
}) => {
  // Definir classes de background e borda baseado no variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'inventario':
        return 'bg-green-50 border-green-100';
      case 'cats':
        return 'bg-orange-50 border-orange-100';
      case 'default':
      default:
        return 'bg-white border-slate-200';
    }
  };

  return (
    <div className={`rounded-xl shadow-sm p-6 mb-8 border ${getVariantClasses()}`}>
      {/* Header responsivo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {children}
    </div>
  );
};

export default SectionWrapper;

