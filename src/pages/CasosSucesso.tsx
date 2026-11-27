import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, CheckCircle2, Bot, Sparkles, Award } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import GuataPageHero from '@/components/guata/GuataPageHero';
import { platformContentService } from '@/services/admin/platformContentService';

const DEFAULT_CASES_PAGE_LEAD =
  'Aqui você encontra implementações completas e produtos de IA aplicados ao turismo: plataformas para destinos, analytics para gestores e experiências conversacionais para viajantes. Cada projeto combina método, tecnologia e proximidade com quem opera o turismo no Brasil e no exterior.';

const CasosSucesso = () => {
  const [pageLead, setPageLead] = useState(DEFAULT_CASES_PAGE_LEAD);
  const [cases, setCases] = useState([
    {
      id: 'descubra-ms',
      title: 'Descubra MS',
      subtitle: 'Plataforma desenvolvida',
      technologies: [
        'Guatá IA',
        'Passaporte Digital',
        'Analytics',
        'Gestão de Eventos'
      ],
      gradient: 'from-guata-forest to-guata-deep',
      icon: MapPin,
      link: '/descubrams',
      image_url: null as string | null
    },
    {
      id: 'koda',
      title: 'Koda',
      subtitle: 'Chatbot desenvolvido',
      technologies: [
        'IA Conversacional',
        'Multi-idioma',
        'Web Search'
      ],
      gradient: 'from-guata-gold to-guata-forest',
      icon: Bot,
      link: '/koda',
      image_url: null as string | null
    }
  ]);

  // Scroll para o topo quando a página carregar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    loadCasesContent();
  }, []);

  const loadCasesContent = async () => {
    try {
      const contents = await platformContentService.getContentByPrefix('viajar_cases_');
      const contentMap: Record<string, string> = {};
      contents.forEach(item => {
        contentMap[item.content_key] = item.content_value || '';
      });

      setPageLead((contentMap['viajar_cases_page_lead'] || '').trim() || DEFAULT_CASES_PAGE_LEAD);

      // Parse technologies JSON
      const parseTechnologies = (key: string, fallback: string[]): string[] => {
        try {
          const json = contentMap[key];
          if (json) {
            const parsed = JSON.parse(json);
            return Array.isArray(parsed) ? parsed : fallback;
          }
        } catch (e) {
          console.error('Erro ao parsear tecnologias:', e);
        }
        return fallback;
      };

      setCases([
        {
          id: 'descubra-ms',
          title: contentMap['viajar_cases_descubra_ms_title'] || 'Descubra MS',
          subtitle: contentMap['viajar_cases_descubra_ms_subtitle'] || 'Plataforma desenvolvida',
          technologies: parseTechnologies('viajar_cases_descubra_ms_technologies', [
            'Guatá IA',
            'Passaporte Digital',
            'Analytics',
            'Gestão de Eventos'
          ]),
          gradient: 'from-guata-forest to-guata-deep',
          icon: MapPin,
          link: '/descubrams',
          image_url: contentMap['viajar_cases_descubra_ms_image'] || null
        },
        {
          id: 'koda',
          title: contentMap['viajar_cases_koda_title'] || 'Koda',
          subtitle: contentMap['viajar_cases_koda_subtitle'] || 'Chatbot desenvolvido',
          technologies: parseTechnologies('viajar_cases_koda_technologies', [
            'IA Conversacional',
            'Multi-idioma',
            'Web Search'
          ]),
          gradient: 'from-guata-gold to-guata-forest',
          icon: Bot,
          link: '/koda',
          image_url: contentMap['viajar_cases_koda_image'] || null
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar conteúdo dos cases:', error);
    }
  };

  return (
    <div className="min-h-screen bg-guata-cream">
      <ViaJARNavbar />
      
      <GuataPageHero
        icon={Award}
        eyebrow="Projetos Guatá Labs"
        title={<>Projetos que <span className="text-guata-gold">já estão em operação</span></>}
        subtitle="A Guatá Labs é a empresa. Estes são produtos que ela criou e mantém."
        lead={pageLead}
      />

      <section className="border-b border-guata-forest/10 bg-guata-cream py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="rounded-2xl border border-guata-forest/10 bg-card p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-guata-forest">A empresa</p>
            <h2 className="mt-2 font-guata text-2xl font-bold text-guata-deep">Guatá Labs</h2>
            <p className="mt-3 text-sm leading-relaxed text-guata-bark/80">Desenvolve tecnologia e IA para o turismo, vende painéis por assinatura e presta consultoria, projetos de inovação e capacitação.</p>
          </div>
          <div className="rounded-2xl border border-guata-gold/40 bg-guata-deep p-7 text-guata-cream">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-guata-gold">Os projetos</p>
            <h2 className="mt-2 font-guata text-2xl font-bold">Descubra MS, Koda e outros</h2>
            <p className="mt-3 text-sm leading-relaxed text-guata-cream/75">São soluções reais, criadas pela Guatá Labs, que mostram na prática o que podemos construir para o seu destino ou negócio.</p>
          </div>
        </div>
      </section>

      {/* Cases Grid */}
      <section className="py-16 bg-guata-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cases.map((caseItem) => {
              const IconComponent = caseItem.icon;
              return (
                <Link
                  key={caseItem.id}
                  to={caseItem.link}
                  className="group block"
                >
                  <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    {/* Gradiente de fundo */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${caseItem.gradient}`} />
                    
                    {/* Imagem de fundo (se disponível) */}
                    {caseItem.image_url && (
                      <>
                        <img
                          src={caseItem.image_url}
                          alt={caseItem.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                      </>
                    )}
                    
                    {/* Conteúdo */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium mb-4 w-fit">
                        <IconComponent className="h-4 w-4" />
                        <span>Projeto Guatá Labs</span>
                      </div>

                      {/* Título e Subtítulo */}
                      <h3 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                        {caseItem.title}
                      </h3>
                      <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                        {caseItem.subtitle}
                      </p>

                      {/* Tecnologias */}
                      <div className="space-y-2 mb-6">
                        {caseItem.technologies.map((tech, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-white/90">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                            <span className="text-sm">{tech}</span>
                          </div>
                        ))}
                      </div>

                      {/* Botão */}
                      <div className="flex items-center gap-2 text-white font-semibold text-base opacity-90 group-hover:opacity-100 transition-all duration-300">
                        <span>Ver Plataforma</span>
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 overflow-hidden bg-guata-deep text-guata-cream">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--guata-gold) / 0.4) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold font-guata text-guata-cream mb-6">
            Quer ser o nosso próximo projeto?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button size="lg" className="bg-guata-gold hover:bg-guata-gold-light text-guata-deep font-semibold px-8 gap-2">
                Falar com especialista
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/precos">
              <Button size="lg" variant="outline" className="border-guata-cream/40 text-guata-cream hover:bg-white/10 px-8 bg-transparent">
                Ver planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default CasosSucesso;
