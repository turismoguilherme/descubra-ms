import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { platformContentService } from '@/services/admin/platformContentService';

interface Step {
  number: string;
  title: string;
  description: string;
}

const HowItWorksSection = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const contents = await platformContentService.getContentByPrefix('viajar_how_');
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

  // Passos padrão (fallback)
  const defaultSteps: Step[] = [
    {
      number: '01',
      title: getContent('viajar_how_step_1_title', 'Agende uma Demo'),
      description: getContent('viajar_how_step_1_description', 'Converse com nossa equipe e entenda como a ViajARTur pode ajudar seu negócio'),
    },
    {
      number: '02',
      title: getContent('viajar_how_step_2_title', 'Implementação Rápida'),
      description: getContent('viajar_how_step_2_description', 'Configuramos tudo para você em poucos dias'),
    },
    {
      number: '03',
      title: getContent('viajar_how_step_3_title', 'Transforme seu Turismo'),
      description: getContent('viajar_how_step_3_description', 'Use dados e IA para tomar decisões estratégicas'),
    },
  ];

  if (loading) {
    return null;
  }

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {getContent('viajar_how_title', 'Como Funciona')}
          </h2>
          {getContent('viajar_how_subtitle') && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {getContent('viajar_how_subtitle', 'Três passos simples para transformar seu turismo')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {defaultSteps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Número grande de fundo */}
              <div className="absolute -top-4 -left-4 text-8xl font-bold text-viajar-cyan/10 group-hover:text-viajar-cyan/20 transition-colors duration-300">
                {step.number}
              </div>

              {/* Card */}
              <div className="relative bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/50 transition-all duration-300 hover:shadow-xl h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center text-white font-bold text-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

