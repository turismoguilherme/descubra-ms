import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, MapPin, Sparkles } from 'lucide-react';
import { platformContentService } from '@/services/admin/platformContentService';

interface CaseMetric {
  value: string;
  label: string;
}

interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string | null;
  badge: string;
  link: string;
  button_text: string;
  icon: React.ComponentType<{ className?: string }>;
  metrics: CaseMetric[];
}

const SuccessCasesSection = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const contents = await platformContentService.getContentByPrefix('viajar_cases_');
      const contentMap: Record<string, string> = {};
      contents.forEach(item => {
        contentMap[item.content_key] = item.content_value || '';
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContent = (key: string, fallback: string = '') => content[key] || fallback;

  const cases: CaseStudy[] = [
    {
      id: 'descubra-ms',
      title: getContent('viajar_cases_descubra_ms_title', 'Descubra Mato Grosso do Sul'),
      subtitle: getContent('viajar_cases_descubra_ms_subtitle', 'Plataforma Completa de Turismo'),
      description: getContent('viajar_cases_descubra_ms_description', 'Plataforma desenvolvida pela ViajARTur para o estado de MS. Demonstra nossa capacidade de criar soluções completas de turismo inteligente.'),
      image_url: getContent('viajar_cases_descubra_ms_image') || null,
      badge: getContent('viajar_cases_descubra_ms_badge', 'Case de Sucesso'),
      link: '/ms',
      button_text: getContent('viajar_cases_descubra_ms_button', 'Ver Case'),
      icon: MapPin,
      metrics: [
        { value: '100K+', label: 'Usuários' },
        { value: '98%', label: 'Satisfação' },
        { value: '79', label: 'Municípios' },
      ],
    },
    {
      id: 'koda',
      title: getContent('viajar_cases_koda_title', 'Koda'),
      subtitle: getContent('viajar_cases_koda_subtitle', 'Chatbot de Turismo para o Canadá'),
      description: getContent('viajar_cases_koda_description', 'Chatbot inteligente desenvolvido pela ViajARTur. Demonstra nossa expertise em IA conversacional especializada em turismo.'),
      image_url: getContent('viajar_cases_koda_image') || null,
      badge: getContent('viajar_cases_koda_badge', 'Produto Desenvolvido'),
      link: '/koda',
      button_text: getContent('viajar_cases_koda_button', 'Ver Case'),
      icon: Bot,
      metrics: [
        { value: '10K+', label: 'Conversas' },
        { value: '95%', label: 'Precisão' },
        { value: '24/7', label: 'Disponível' },
      ],
    },
  ];

  if (loading) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-travel-tech-dark-base">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--travel-tech-turquoise)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-travel-tech-turquoise/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-travel-tech-ocean-blue/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-travel-tech-turquoise/20 bg-travel-tech-turquoise/5 backdrop-blur-sm text-travel-tech-turquoise text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            <span>{getContent('viajar_cases_badge', 'Nossos Cases')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-travel-tech-turquoise via-travel-tech-ocean-blue to-travel-tech-sunset-orange bg-clip-text text-transparent">
              {getContent('viajar_cases_title', 'Cases de Sucesso')}
            </span>
          </h2>
          {getContent('viajar_cases_subtitle') && (
            <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              {getContent('viajar_cases_subtitle')}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cases.map((caseStudy) => {
            const IconComponent = caseStudy.icon;
            return (
              <Link key={caseStudy.id} to={caseStudy.link} className="group block">
                <div className="relative h-[540px] rounded-2xl overflow-hidden">
                  {/* Glassmorphism background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-travel-tech-turquoise/10 to-travel-tech-ocean-blue/10 backdrop-blur-md border border-white/10 rounded-2xl" />
                  
                  {/* Image layer */}
                  {caseStudy.image_url && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <img
                        src={caseStudy.image_url}
                        alt={caseStudy.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-travel-tech-dark-base/95 via-travel-tech-dark-base/60 to-transparent" />
                    </div>
                  )}

                  {/* Neon border hover */}
                  <div className="absolute inset-0 rounded-2xl border border-travel-tech-turquoise/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-neon-pulse pointer-events-none" />

                  {/* Data flow lines */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-travel-tech-turquoise to-transparent animate-data-flow" />
                    <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-travel-tech-ocean-blue to-transparent animate-data-flow-delayed" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-travel-tech-turquoise/30 text-travel-tech-turquoise text-sm font-semibold mb-5 w-fit">
                      <IconComponent className="h-4 w-4" />
                      <span>{caseStudy.badge}</span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300">
                      {caseStudy.title}
                    </h3>
                    <p className="text-lg text-travel-tech-turquoise mb-5 font-medium">
                      {caseStudy.subtitle}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {caseStudy.metrics.map((metric, index) => (
                        <div
                          key={index}
                          className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10 group-hover:border-travel-tech-turquoise/30 transition-colors duration-300"
                        >
                          <div className="text-2xl font-bold text-travel-tech-turquoise">
                            {metric.value}
                          </div>
                          <div className="text-xs text-white/60 mt-1">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    {caseStudy.description && (
                      <p className="text-white/60 mb-5 text-sm leading-relaxed line-clamp-2 group-hover:text-white/80 transition-colors duration-300">
                        {caseStudy.description}
                      </p>
                    )}

                    {/* Arrow link */}
                    <div className="flex items-center text-sm text-travel-tech-turquoise opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      <span>{caseStudy.button_text}</span>
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-white/50 mb-8 text-lg">
            Quer criar o próximo case de sucesso?
          </p>
          <Link to="/contato">
            <Button
              size="lg"
              className="bg-gradient-to-r from-travel-tech-turquoise to-travel-tech-ocean-blue hover:from-travel-tech-ocean-blue hover:to-travel-tech-sunset-orange text-white font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-travel-tech-turquoise/20"
            >
              <span>Vamos Conversar</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SuccessCasesSection;
