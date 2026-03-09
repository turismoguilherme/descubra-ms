import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, MapPin, Sparkles, Globe } from 'lucide-react';
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
  gradient: string;
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

  const getContent = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  // Cases de sucesso - Koda e Descubra MS (focado em resultados)
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
      gradient: 'from-emerald-500 to-teal-600',
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
      gradient: 'from-blue-500 to-cyan-600',
      icon: Bot,
      metrics: [
        { value: '10K+', label: 'Conversas' },
        { value: '95%', label: 'Precisão' },
        { value: '24/7', label: 'Disponível' },
      ],
    },
  ];

  if (loading) {
    return null;
  }

  return (
    <section className="py-24 bg-gradient-to-br from-travel-tech-dark-secondary via-travel-tech-dark-base to-travel-tech-dark-secondary relative overflow-hidden">
      {/* Background Grid Effect */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--travel-tech-ocean-blue) / 0.2) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--travel-tech-ocean-blue) / 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-travel-tech-ocean-blue/30 bg-travel-tech-ocean-blue/10 text-travel-tech-ocean-blue text-sm font-semibold mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>{getContent('viajar_cases_badge', 'Nossos Cases')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-travel-tech-ocean-blue via-travel-tech-turquoise to-travel-tech-sunset-orange bg-clip-text text-transparent">
              {getContent('viajar_cases_title', 'Cases de Sucesso')}
            </span>
          </h2>
          {getContent('viajar_cases_subtitle') && (
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {getContent('viajar_cases_subtitle', 'Veja o que a ViajARTur já desenvolveu e como transformamos o turismo')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cases.map((caseStudy) => {
            const IconComponent = caseStudy.icon;
            return (
              <Link
                key={caseStudy.id}
                to={caseStudy.link}
                className="group block"
              >
                <div className="relative h-[580px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-travel-tech-turquoise/20 transition-all duration-500 transform hover:-translate-y-3 bg-travel-tech-dark-secondary/40 backdrop-blur-sm border border-travel-tech-turquoise/20 hover:border-travel-tech-turquoise/40">
                  
                  {/* Enhanced Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${caseStudy.gradient} opacity-70`} />
                  
                  {/* Imagem de fundo (se disponível) */}
                  {caseStudy.image_url && (
                    <>
                      <img
                        src={caseStudy.image_url}
                        alt={caseStudy.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-travel-tech-dark-base/90 via-travel-tech-dark-base/50 to-transparent" />
                    </>
                  )}

                  {/* Dark Overlay Enhancement */}
                  <div className="absolute inset-0 bg-gradient-to-t from-travel-tech-dark-base/95 via-travel-tech-dark-base/30 to-transparent" />

                  {/* Conteúdo */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                    
                    {/* Badge com glow */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-travel-tech-turquoise/20 backdrop-blur-sm border border-travel-tech-turquoise/40 text-travel-tech-turquoise text-sm font-semibold mb-6 w-fit shadow-[0_0_15px_rgba(6,214,160,0.3)]">
                      <IconComponent className="h-4 w-4" />
                      <span>{caseStudy.badge}</span>
                    </div>

                    {/* Título e Subtítulo com gradiente */}
                    <h3 className="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg text-white group-hover:translate-x-1 transition-transform duration-300">
                      {caseStudy.title}
                    </h3>
                    <p className="text-xl text-travel-tech-turquoise mb-6 drop-shadow-md font-medium">
                      {caseStudy.subtitle}
                    </p>

                    {/* Métricas de Impacto Aprimoradas */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {caseStudy.metrics.map((metric, index) => (
                        <div 
                          key={index} 
                          className="bg-travel-tech-dark-base/60 backdrop-blur-sm rounded-xl p-4 text-center border border-travel-tech-turquoise/20 hover:border-travel-tech-turquoise/40 transition-colors duration-300 group-hover:transform group-hover:scale-105"
                        >
                          <div className="text-2xl md:text-3xl font-bold text-travel-tech-turquoise drop-shadow-md">
                            {metric.value}
                          </div>
                          <div className="text-xs md:text-sm text-gray-300 mt-1 font-medium">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Descrição */}
                    {caseStudy.description && (
                      <p className="text-gray-300 mb-6 leading-relaxed line-clamp-2 text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        {caseStudy.description}
                      </p>
                    )}

                    {/* Botão Enhanced */}
                    <div className="flex items-center gap-3 text-travel-tech-turquoise font-semibold text-base opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      <span>{caseStudy.button_text}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Animated Border Effect on Hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-travel-tech-turquoise to-transparent animate-data-flow" />
                    <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-travel-tech-ocean-blue to-transparent animate-data-flow-delayed" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Call to Action Section */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-8 text-lg">
            Quer criar o próximo case de sucesso? 
          </p>
          <Link to="/contato">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-travel-tech-turquoise to-travel-tech-ocean-blue hover:from-travel-tech-ocean-blue hover:to-travel-tech-sunset-orange text-white font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-travel-tech-turquoise/30"
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

