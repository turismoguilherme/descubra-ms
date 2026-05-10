import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, CheckCircle2, Bot, Sparkles, Award } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
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
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 min-h-[320px] bg-gradient-to-br from-guata-cream via-guata-paper to-guata-cream">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, hsl(var(--guata-gold) / 0.12), transparent 45%),
              radial-gradient(circle at 80% 10%, hsl(var(--guata-forest) / 0.06), transparent 40%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-guata-gold/35 text-guata-forest text-sm font-semibold mb-6 shadow-sm">
              <Award className="h-4 w-4 text-guata-gold" />
              <span>Casos de sucesso</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-guata text-guata-deep mb-4">
              Cases
            </h1>
            <p className="text-lg font-medium text-guata-deep/90 mb-3">
              O que desenvolvemos com a Guatá Labs
            </p>
            <p className="text-base md:text-lg text-guata-bark/90 max-w-3xl mx-auto leading-relaxed">
              {pageLead}
            </p>
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
                        <span>Plataforma Desenvolvida</span>
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
            Quer ser nosso próximo case?
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
