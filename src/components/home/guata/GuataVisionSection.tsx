import { motion } from 'framer-motion';
import { Building2, Map, Quote, Store } from 'lucide-react';

const audiences = [
  { icon: Map, title: 'Para o destino', text: 'Mais clareza para planejar e distribuir oportunidades.' },
  { icon: Store, title: 'Para o negócio local', text: 'Mais visibilidade e conexão com o fluxo de visitantes.' },
  { icon: Building2, title: 'Para a gestão', text: 'Informação útil para transformar intenção em ação.' },
];

export default function GuataVisionSection() {
  return (
    <section className="bg-guata-paper px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-guata-deep px-6 py-12 text-guata-cream shadow-xl sm:px-10 lg:px-16 lg:py-16"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 90% 10%, hsl(var(--guata-gold) / 0.28), transparent 42%)' }}
          aria-hidden
        />
        <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div>
            <Quote className="mb-8 h-10 w-10 text-guata-gold" />
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-guata-gold-light">Nossa visão</p>
            <h2 className="max-w-3xl font-guata text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.7rem]">
              Turismo não é apenas visitação. É conhecimento circulando, oportunidades chegando ao comércio local e decisões que melhoram a experiência de todos.
            </h2>
            <p className="mt-7 max-w-2xl leading-relaxed text-guata-cream/65">
              A Guatá Labs existe para aproximar tecnologia e território, fazendo a inovação trabalhar a favor de destinos mais inteligentes e negócios mais conectados.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            {audiences.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-guata-cream/10 bg-guata-cream/[0.06] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-guata-gold-light" />
                  <h3 className="font-guata font-semibold text-guata-cream">{title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-guata-cream/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
