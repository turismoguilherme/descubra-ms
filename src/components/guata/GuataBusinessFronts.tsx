import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Lightbulb, Compass, ArrowRight } from 'lucide-react';

const FRONTS = [
  {
    icon: LayoutDashboard,
    tag: 'Produto',
    title: 'Painéis por assinatura',
    text: 'Empresas e gestores públicos assinam painéis com dados, inteligência de mercado e IA para decidir melhor.',
    to: '/precos',
    cta: 'Ver planos',
  },
  {
    icon: Compass,
    tag: 'Serviço',
    title: 'Consultoria',
    text: 'Diagnóstico, planejamento e acompanhamento para destinos e negócios turísticos.',
    to: '/contato?objetivo=consultoria',
    cta: 'Solicitar proposta',
  },
  {
    icon: Lightbulb,
    tag: 'Serviço',
    title: 'Projetos de inovação',
    text: 'Criamos plataformas sob medida, como o Descubra MS e o Passaporte Digital.',
    to: '/contato?objetivo=inovacao',
    cta: 'Conversar sobre um projeto',
  },
  {
    icon: GraduationCap,
    tag: 'Serviço',
    title: 'Instrutoria e capacitação',
    text: 'Treinamentos para equipes públicas e para o trade turístico usarem dados e IA no dia a dia.',
    to: '/contato?objetivo=instrutoria',
    cta: 'Agendar treinamento',
  },
];

/** Mostra as frentes de atuação da empresa Guatá Labs. */
const GuataBusinessFronts: React.FC = () => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {FRONTS.map(({ icon: Icon, tag, title, text, to, cta }) => (
      <Link
        key={title}
        to={to}
        className="group flex flex-col rounded-2xl border border-guata-forest/10 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-guata-gold/50 hover:shadow-lg"
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-guata-deep text-guata-gold">
            <Icon className="h-5 w-5" />
          </span>
          <span className="rounded-full bg-guata-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-guata-forest">{tag}</span>
        </div>
        <h3 className="text-lg font-semibold text-guata-deep">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-guata-bark/80">{text}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-guata-forest">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    ))}
  </div>
);

export default GuataBusinessFronts;
