import React from 'react';

/** Símbolo da Guatá Labs: um "G" em forma de rota terminando num ponto de localização. */
const GuataLogoMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <rect width="48" height="48" rx="12" fill="hsl(var(--guata-forest))" />
    <path
      d="M33 15.5A12 12 0 1 0 36 24h-11"
      fill="none"
      stroke="hsl(var(--guata-gold))"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <circle cx="25" cy="24" r="3.4" fill="hsl(var(--guata-cream))" />
  </svg>
);

export default GuataLogoMark;
