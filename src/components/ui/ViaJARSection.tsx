import React from 'react';
import { cn } from '@/lib/utils';

interface ViaJARSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ViaJARSection: React.FC<ViaJARSectionProps> = ({
  title,
  description,
  icon,
  actions,
  children,
  className
}) => {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
};
