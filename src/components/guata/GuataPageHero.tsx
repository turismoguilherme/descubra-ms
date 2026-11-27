import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface GuataPageHeroProps {
  icon: LucideIcon;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}

/** Topo escuro padrão das páginas institucionais da Guatá Labs. */
const GuataPageHero: React.FC<GuataPageHeroProps> = ({ icon: Icon, eyebrow, title, subtitle, lead, children }) => (
  <section className="relative overflow-hidden bg-guata-deep text-guata-cream">
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          'linear-gradient(hsl(var(--guata-gold) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--guata-gold) / 0.5) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }}
    />
    <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-guata-gold/15 blur-3xl" />
    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-guata-gold/40 bg-guata-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-guata-gold-light">
          <Icon className="h-4 w-4" />
          {eyebrow}
        </div>
        <h1 className="font-guata text-4xl font-bold leading-tight text-guata-cream md:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && <p className="mt-5 text-lg font-medium text-guata-cream/90 md:text-xl">{subtitle}</p>}
        {lead && <p className="mt-4 max-w-2xl text-base leading-relaxed text-guata-cream/70 md:text-lg">{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  </section>
);

export default GuataPageHero;
