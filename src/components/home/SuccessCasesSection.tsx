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
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-viajar-cyan/10 text-viajar-cyan text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>{getContent('viajar_cases_badge', 'Nossos Cases')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {getContent('viajar_cases_title', 'Cases de Sucesso')}
          </h2>
          {getContent('viajar_cases_subtitle') && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                <div className="relative h-[560px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  {/* Gradiente de fundo */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${caseStudy.gradient}`} />
                  
                  {/* Imagem de fundo (se disponível) */}
                  {caseStudy.image_url && (
                    <>
                      <img
                        src={caseStudy.image_url}
                        alt={caseStudy.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    </>
                  )}

                  {/* Conteúdo */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium mb-4 w-fit">
                      <IconComponent className="h-4 w-4" />
                      <span>{caseStudy.badge}</span>
                    </div>

                    {/* Título e Subtítulo */}
                    <h3 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                      {caseStudy.title}
                    </h3>
                    <p className="text-xl text-white/90 mb-4 drop-shadow-md">
                      {caseStudy.subtitle}
                    </p>

                    {/* Métricas de Impacto */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {caseStudy.metrics.map((metric, index) => (
                        <div 
                          key={index} 
                          className="bg-white/15 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20"
                        >
                          <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                            {metric.value}
                          </div>
                          <div className="text-xs md:text-sm text-white/80 mt-1">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Descrição (mais curta e focada) */}
                    {caseStudy.description && (
                      <p className="text-white/80 mb-4 leading-relaxed line-clamp-2 text-sm">
                        {caseStudy.description}
                      </p>
                    )}

                    {/* Botão */}
                    <div className="flex items-center gap-2 text-white font-semibold text-base opacity-90 group-hover:opacity-100 transition-all duration-300">
                      <span>{caseStudy.button_text}</span>
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
  );
};

export default SuccessCasesSection;

