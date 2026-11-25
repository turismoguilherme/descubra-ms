import { motion } from 'framer-motion';
import { BrainCircuit, MapPinned, Workflow } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MapPinned,
    title: 'Leitura do território',
    description: 'Organizamos informações do destino e da jornada do visitante para revelar oportunidades com clareza.',
  },
  {
    number: '02',
    icon: BrainCircuit,
    title: 'Inteligência para decidir',
    description: 'Transformamos dados em contexto útil para gestores públicos e empresas planejarem com mais segurança.',
  },
  {
    number: '03',
    icon: Workflow,
    title: 'Ação que gera circulação',
    description: 'Conectamos experiências, gamificação e comércio local para levar valor a toda a cadeia do turismo.',
  },
];

export default function GuataMethodologySection() {
  return (
    <section id="metodo" className="relative scroll-mt-20 overflow-hidden bg-guata-cream py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end"
        >
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-guata-forest">Método Guatá Labs</p>
            <h2 className="max-w-xl font-guata text-4xl font-bold leading-tight text-guata-deep sm:text-5xl">
              Da informação à ação.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-guata-bark/80 lg:justify-self-end">
            Uma abordagem estruturada para aproximar gestão, tecnologia e desenvolvimento local — sem perder de vista as pessoas.
          </p>
        </motion.div>

        <div className="relative grid gap-5 lg:grid-cols-3">
          <div className="absolute left-[16.66%] right-[16.66%] top-12 hidden h-px bg-guata-gold/30 lg:block" aria-hidden />
          {steps.map(({ number, icon: Icon, title, description }, index) => (
            <motion.article
              key={number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              className="relative rounded-2xl border border-guata-forest/10 bg-card p-7 shadow-sm sm:p-8"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="relative z-10 rounded-2xl border border-guata-gold/25 bg-guata-cream p-3.5">
                  <Icon className="h-6 w-6 text-guata-forest" />
                </div>
                <span className="font-playfair text-4xl italic text-guata-gold/70">{number}</span>
              </div>
              <h3 className="mb-3 font-guata text-2xl font-semibold text-guata-deep">{title}</h3>
              <p className="leading-relaxed text-guata-bark/75">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
