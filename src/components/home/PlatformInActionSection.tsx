import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Brain, Check, LayoutDashboard, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const demos = [
  {
    title: 'Visão gerencial do destino',
    description: 'Reúna indicadores e informações da operação em uma leitura compartilhada para secretarias e gestores.',
    icon: BarChart3,
    points: ['Visão consolidada', 'Indicadores do destino', 'Rotinas de gestão'],
  },
  {
    title: 'Inteligência para gestores',
    description: 'Consulte tendências, sazonalidade e estratégias com apoio da inteligência artificial aplicada ao turismo.',
    icon: Brain,
    points: ['Consulta contextual', 'Apoio à estratégia', 'Conhecimento aplicado'],
  },
  {
    title: 'Planejamento de demanda',
    description: 'Use cenários e tendências para preparar equipes, orçamento e ações para os diferentes períodos do destino.',
    icon: TrendingUp,
    points: ['Cenários de demanda', 'Planejamento', 'Sazonalidade'],
  },
];

export default function PlatformInActionSection() {
  const [activeDemo, setActiveDemo] = useState(0);
  const active = demos[activeDemo];
  const ActiveIcon = active.icon;

  return (
    <section className="relative overflow-hidden bg-guata-deep py-24 text-guata-cream sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 85% 30%, hsl(var(--guata-gold) / 0.2), transparent 35%)' }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 max-w-3xl"
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-guata-gold-light">Plataforma em ação</p>
          <h2 className="font-guata text-4xl font-semibold leading-tight sm:text-5xl">Uma visão compartilhada para decidir melhor.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-guata-cream/65">
            Tecnologia que aproxima informação, estratégia e operação em um mesmo ambiente de trabalho.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          <div className="space-y-3" role="tablist" aria-label="Recursos da plataforma">
            {demos.map((demo, index) => {
              const Icon = demo.icon;
              const selected = activeDemo === index;
              return (
                <button
                  key={demo.title}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveDemo(index)}
                  className={`w-full rounded-2xl border p-5 text-left transition-all sm:p-6 ${selected ? 'border-guata-gold/45 bg-guata-cream/10' : 'border-guata-cream/10 bg-transparent hover:bg-guata-cream/[0.05]'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl p-3 ${selected ? 'bg-guata-gold text-guata-deep' : 'bg-guata-cream/10 text-guata-gold-light'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-guata text-lg font-semibold">{demo.title}</h3>
                      <p className="text-sm leading-relaxed text-guata-cream/55">{demo.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            <Link to="/contato" className="group inline-flex items-center gap-2 px-2 pt-5 font-semibold text-guata-gold-light">
              Agendar demonstração <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <motion.div
            key={active.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-[1.75rem] border border-guata-cream/15 bg-guata-cream/[0.07] p-3 shadow-2xl sm:p-5"
            role="tabpanel"
          >
            <div className="mb-4 flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2 text-sm text-guata-cream/70"><LayoutDashboard className="h-4 w-4 text-guata-gold-light" /> Ambiente de gestão</div>
              <span className="rounded-full border border-guata-cream/10 px-3 py-1 text-[11px] text-guata-cream/50">Visão demonstrativa</span>
            </div>
            <div className="rounded-2xl bg-guata-cream p-6 text-guata-deep sm:p-8">
              <div className="flex items-start justify-between gap-5 border-b border-guata-forest/10 pb-6">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-guata-forest">Guatá Labs</p>
                  <h3 className="font-guata text-2xl font-semibold sm:text-3xl">{active.title}</h3>
                </div>
                <div className="rounded-xl bg-guata-forest/10 p-3"><ActiveIcon className="h-6 w-6 text-guata-forest" /></div>
              </div>
              <div className="grid gap-6 pt-6 sm:grid-cols-[1fr_0.85fr]">
                <div className="flex min-h-44 items-end gap-2 rounded-xl bg-guata-paper p-5" aria-hidden>
                  {[44, 64, 52, 76, 62, 88, 74, 96].map((height, index) => (
                    <div key={index} style={{ height: `${height}%` }} className={`flex-1 rounded-t-md ${index > 5 ? 'bg-guata-gold' : 'bg-guata-forest/20'}`} />
                  ))}
                </div>
                <div className="space-y-3">
                  {active.points.map((point) => (
                    <div key={point} className="flex items-center gap-3 rounded-xl border border-guata-forest/10 p-3 text-sm font-medium">
                      <span className="rounded-full bg-guata-forest/10 p-1"><Check className="h-3.5 w-3.5 text-guata-forest" /></span>{point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
