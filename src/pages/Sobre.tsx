import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Sparkles } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import GuataPageHero from '@/components/guata/GuataPageHero';
import GuataBusinessFronts from '@/components/guata/GuataBusinessFronts';
import { platformContentService } from '@/services/admin/platformContentService';

const DEFAULT_SOBRE_PAGE_LEAD =
  'Somos um ecossistema de software e inteligência artificial focado em turismo. Apoiamos secretarias, empresários e equipes técnicas com dados confiáveis, produtos modulares e implementação acompanhada — do diagnóstico ao uso no dia a dia.';

const Sobre = () => {
  const [heroLead, setHeroLead] = useState(DEFAULT_SOBRE_PAGE_LEAD);
  const [narrativa, setNarrativa] = useState<{ destaque: string; texto: string }>({
    destaque: '',
    texto: ''
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const contents = await platformContentService.getContentByPrefix('viajar_sobre_');
      const contentMap: Record<string, string> = {};
      contents.forEach(item => {
        contentMap[item.content_key] = item.content_value || '';
      });
      setHeroLead((contentMap['viajar_sobre_page_lead'] || '').trim() || DEFAULT_SOBRE_PAGE_LEAD);
      setNarrativa({
        destaque: contentMap['viajar_sobre_destaque'] || 'Transformar dados turísticos em decisões estratégicas que geram impacto real.',
        texto: contentMap['viajar_sobre_narrativa'] ||
          'A Guatá Labs existe para transformar dados turísticos em decisões estratégicas. Nosso propósito é estruturar o turismo como um sistema inteligente, integrado e orientado por evidências.\n\nNascemos da visão de que o turismo brasileiro merece ferramentas de gestão de excelência. Combinamos tecnologia de ponta, inteligência artificial e conhecimento profundo do setor para entregar soluções que realmente fazem diferença.\n\nNossa missão é democratizar o acesso à tecnologia turística, tornando-a acessível tanto para grandes destinos quanto para pequenas cidades que sonham em desenvolver seu potencial. Acreditamos que cada lugar tem uma história única para contar, e nossa plataforma ajuda a contá-la da melhor forma possível.'
      });
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-guata-cream">
      <ViaJARNavbar />

      <GuataPageHero
        icon={Building2}
        eyebrow="Quem somos"
        title={<>Sobre a <span className="text-guata-gold">Guatá Labs</span></>}
        subtitle="Tecnologia, inteligência artificial e inovação para a gestão do turismo."
        lead={heroLead}
      />

      <section className="bg-guata-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-guata-forest">O que fazemos</p>
            <h2 className="mt-2 font-guata text-3xl font-bold text-guata-deep md:text-4xl">Produto e serviço, lado a lado</h2>
            <p className="mt-3 text-guata-bark/80">Empresas e gestores públicos podem assinar nossos painéis ou contratar nosso time para consultoria, inovação e capacitação.</p>
          </div>
          <GuataBusinessFronts />
        </div>
      </section>

      <section className="py-20 relative bg-guata-paper">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative rounded-2xl overflow-hidden mb-12 border border-guata-gold/25 bg-white shadow-sm">
            <div className="relative p-8 md:p-10 text-center">
              <blockquote>
                <p className="text-2xl md:text-3xl font-semibold font-guata text-guata-deep leading-relaxed italic">
                  &ldquo;{narrativa.destaque}&rdquo;
                </p>
              </blockquote>
            </div>
            <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-guata-gold/50 to-transparent" />
          </div>

          <div className="flex justify-center mb-12">
            <div className="w-24 h-1 bg-gradient-to-r from-guata-gold to-guata-forest rounded-full" />
          </div>

          <div className="text-center">
            <p className="text-lg text-guata-bark/85 leading-relaxed whitespace-pre-line">
              {narrativa.texto}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden bg-guata-deep text-guata-cream">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--guata-gold) / 0.35) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-guata-gold/35 bg-white/10 mb-6">
            <Sparkles className="h-4 w-4 text-guata-gold" />
            <span className="text-sm text-guata-cream font-medium">Junte-se a nós</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-guata text-guata-cream mb-6">
            Quer fazer parte dessa história?
          </h2>
          <p className="text-lg text-guata-cream/80 mb-10 max-w-2xl mx-auto">
            Entre em contato e descubra como podemos transformar a gestão turística na sua região.
          </p>
          <Link to="/contato">
            <Button
              size="lg"
              className="bg-guata-gold hover:bg-guata-gold-light text-guata-deep font-semibold px-8 h-14 text-lg gap-2 hover:-translate-y-1 transition-all duration-300 shadow-md"
            >
              Falar conosco
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Sobre;
