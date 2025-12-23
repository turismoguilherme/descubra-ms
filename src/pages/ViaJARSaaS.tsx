import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Map, Brain, Shield, Globe, Building2, TrendingUp, Calendar, FileText, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { platformContentService } from '@/services/admin/platformContentService';
// CommercialSection removido temporariamente

// Tipos para features
interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
}

const VideoSection = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('viajar_hero_video_url');
        const videoContent = contents.find(c => c.content_key === 'viajar_hero_video_url');
        if (videoContent?.content_value) {
          setVideoUrl(videoContent.content_value);
        }
      } catch (error) {
        console.error('Erro ao carregar vídeo:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVideo();
  }, []);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // Extrair ID do YouTube de diferentes formatos
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    return null;
  };

  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border bg-viajar-slate">
      {!loading && embedUrl ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={embedUrl}
          title="ViajARTur - Plataforma de Turismo Inteligente"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-viajar-slate to-slate-800">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-viajar-cyan/20 flex items-center justify-center mx-auto mb-4">
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-viajar-cyan border-b-[12px] border-b-transparent ml-1" />
            </div>
            <p className="text-white/60 text-sm">
              {loading ? 'Carregando...' : 'Configure o vídeo no admin'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ViaJARSaaS = () => {
  // Estados para conteúdos editáveis
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  // Features padrão (fallback)
  const defaultFeatures: Feature[] = [
    {
      icon: Brain,
      title: "Guilherme IA",
      description: "Assistente inteligente especializado em turismo com insights estratégicos personalizados.",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      icon: TrendingUp,
      title: "Revenue Optimizer",
      description: "Precificação dinâmica com IA que maximiza receita baseado em demanda e sazonalidade.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Análise de mercado: origem dos turistas, perfil de clientes e benchmarking competitivo.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Map,
      title: "Inventário Turístico",
      description: "Gestão de atrativos com padronização SeTur, validação inteligente e analytics.",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      icon: Calendar,
      title: "Gestão de Eventos",
      description: "Planejamento e análise de eventos turísticos com IA preditiva de público.",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: Building2,
      title: "Gestão de CATs",
      description: "Controle de Centros de Atendimento com GPS, ponto eletrônico e métricas.",
      gradient: "from-indigo-500 to-blue-600"
    },
  ];

  // Carregar conteúdos do banco
  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('viajar_');
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
    
    loadContent();
  }, []);

  // Helper para obter conteúdo com fallback
  const getContent = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  // Carregar features dos campos individuais
  const getFeatures = (): Feature[] => {
    const iconMap: Record<number, React.ComponentType<{ className?: string }>> = {
      1: Brain,
      2: TrendingUp,
      3: BarChart3,
      4: Map,
      5: Calendar,
      6: Building2
    };

    const gradientMap: Record<number, string> = {
      1: 'from-purple-500 to-violet-600',
      2: 'from-emerald-500 to-teal-600',
      3: 'from-blue-500 to-cyan-600',
      4: 'from-orange-500 to-amber-600',
      5: 'from-pink-500 to-rose-600',
      6: 'from-indigo-500 to-blue-600'
    };

    const features: Feature[] = [];
    for (let i = 1; i <= 6; i++) {
      const title = getContent(`viajar_feature_${i}_title`);
      const description = getContent(`viajar_feature_${i}_description`);
      
      if (title || description) {
        features.push({
          icon: iconMap[i] || defaultFeatures[i - 1]?.icon || Brain,
          title: title || defaultFeatures[i - 1]?.title || '',
          description: description || defaultFeatures[i - 1]?.description || '',
          gradient: gradientMap[i] || defaultFeatures[i - 1]?.gradient || 'from-gray-500 to-gray-600'
        });
      } else if (defaultFeatures[i - 1]) {
        features.push(defaultFeatures[i - 1]);
      }
    }
    
    return features.length > 0 ? features : defaultFeatures;
  };

  const features = getFeatures();

  // Carregar listas de itens dos campos individuais
  const getReportItems = (): string[] => {
    const items: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const item = getContent(`viajar_reports_item_${i}`);
      if (item) items.push(item);
    }
    return items.length > 0 ? items : [
      'Dados agregados e anonimizados (LGPD)',
      'Perfil demográfico dos visitantes',
      'Origem e propósito de viagem',
      'Interações na plataforma Descubra MS'
    ];
  };

  const getDescubraMSItems = (): string[] => {
    const items: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const item = getContent(`viajar_descubra_ms_item_${i}`);
      if (item) items.push(item);
    }
    return items.length > 0 ? items : [
      'Guatá - Assistente IA regional',
      'Passaporte Digital interativo',
      'Mapas e rotas inteligentes',
      'Analytics em tempo real'
    ];
  };

  // Stats removidos - podem ser reativados via admin futuramente
  // const stats = [
  //   { value: "50K+", label: "Usuários Ativos" },
  //   { value: "95%", label: "Satisfação" },
  //   { value: "27", label: "Estados" },
  //   { value: "500+", label: "Parceiros" },
  // ];

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-viajar-blue/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            {getContent('viajar_hero_badge') && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
                <span className="text-sm text-white/90 font-medium">{getContent('viajar_hero_badge', 'Plataforma #1 de Turismo Inteligente')}</span>
            </div>
            )}
            
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              {getContent('viajar_hero_title') ? (
                <span className="text-white">{getContent('viajar_hero_title', 'ViajARTur')}</span>
              ) : (
                <>
              <span className="text-white">Viaj</span>
              <span className="text-viajar-cyan">AR</span>
              <span className="text-white">Tur</span>
                </>
              )}
            </h1>
            
            {getContent('viajar_hero_subtitle') && (
            <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
                {getContent('viajar_hero_subtitle', 'Ecossistema inteligente de turismo')}
            </p>
            )}
            
            {getContent('viajar_hero_description') && (
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
                {getContent('viajar_hero_description', 'Transforme dados em decisões estratégicas. Analytics avançado e IA para o setor público e privado.')}
            </p>
            )}
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/viajar/login">
                <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2 shadow-lg shadow-viajar-cyan/25">
                  {getContent('viajar_hero_cta_primary', 'Acessar Plataforma')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contato">
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-8 h-14 text-lg backdrop-blur-sm">
                  {getContent('viajar_hero_cta_secondary', 'Agendar Demo')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {getContent('viajar_features_title', 'Soluções Inteligentes')}
            </h2>
            {getContent('viajar_features_subtitle') && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {getContent('viajar_features_subtitle', 'Tecnologia de ponta para transformar a gestão do turismo')}
            </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group relative bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/50 transition-all duration-300 hover:shadow-xl hover:shadow-viajar-cyan/5"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                
                <Link 
                  to="/solucoes" 
                  className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-viajar-cyan hover:text-viajar-cyan/80 transition-colors"
                >
                  Saiba mais
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Relatórios de Dados de Turismo Banner */}
      <section className="py-16 bg-gradient-to-r from-viajar-cyan/10 via-viajar-blue/10 to-viajar-cyan/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-viajar-cyan/20 p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div>
                {getContent('viajar_reports_badge') && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-viajar-cyan/10 text-viajar-cyan text-sm font-medium mb-4">
                  <FileText className="h-4 w-4" />
                    {getContent('viajar_reports_badge', 'Novidade')}
                </div>
                )}
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {getContent('viajar_reports_title', 'Relatórios de Dados de Turismo')}
                </h2>
                
                {getContent('viajar_reports_description') && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    {getContent('viajar_reports_description', 'Acesse dados agregados e anonimizados de turismo de Mato Grosso do Sul. Relatórios completos com análises demográficas, origem dos visitantes, propósitos de viagem e interações na plataforma.')}
                </p>
                )}
                
                <ul className="space-y-2 mb-6">
                  {getReportItems().map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-viajar-cyan flex-shrink-0" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/dados-turismo">
                    <Button className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-white gap-2 w-full sm:w-auto">
                      {getContent('viajar_reports_button_primary', 'Saiba Mais')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/contato">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {getContent('viajar_reports_button_secondary', 'Solicitar Relatório')}
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Visual */}
              <div className="relative">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-viajar-cyan/20 to-viajar-blue/20 border border-viajar-cyan/30 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Dados Reais</h3>
                    <p className="text-sm text-muted-foreground">Alumia + Descubra MS</p>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-16 h-16 rounded-lg bg-viajar-cyan/10 blur-xl" />
                <div className="absolute -bottom-2 -left-2 w-20 h-20 rounded-lg bg-viajar-blue/10 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Descubra MS Section */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              {getContent('viajar_descubra_ms_badge') && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-viajar-cyan/10 text-viajar-cyan text-sm font-medium mb-6">
                <Globe className="h-4 w-4" />
                  {getContent('viajar_descubra_ms_badge', 'Case de Sucesso')}
              </div>
              )}
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {getContent('viajar_descubra_ms_title', 'Descubra Mato Grosso do Sul')}
              </h2>
              
              {getContent('viajar_descubra_ms_description') && (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {getContent('viajar_descubra_ms_description', 'Nossa primeira implementação completa demonstra como a tecnologia ViajARTur revoluciona o turismo regional com Guatá IA, Passaporte Digital e Analytics Avançado.')}
              </p>
              )}
              
              <ul className="space-y-4 mb-8">
                {getDescubraMSItems().map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-viajar-cyan flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/ms">
                <Button className="bg-viajar-slate hover:bg-viajar-slate/90 text-white gap-2">
                  {getContent('viajar_descubra_ms_button', 'Conhecer Descubra MS')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Visual */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-viajar-cyan/20 to-viajar-blue/20 border border-viajar-cyan/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Descubra MS</h3>
                  <p className="text-muted-foreground">Plataforma de Turismo</p>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-viajar-cyan/10 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-xl bg-viajar-blue/10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {getContent('viajar_video_title', 'Veja a Plataforma em Ação')}
            </h2>
            {getContent('viajar_video_description') && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {getContent('viajar_video_description', 'Descubra como a ViajARTur pode transformar a gestão do turismo na sua região')}
            </p>
            )}
          </div>
          
          {/* Video Container */}
          <VideoSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {getContent('viajar_cta_title', 'Pronto para Transformar seu Turismo?')}
          </h2>
          {getContent('viajar_cta_description') && (
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              {getContent('viajar_cta_description', 'Junte-se a empresas e órgãos públicos que já confiam na ViajARTur.')}
          </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2">
                {getContent('viajar_cta_button_primary', 'Solicitar Demonstração')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/precos">
              <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-8 h-14 text-lg backdrop-blur-sm">
                {getContent('viajar_cta_button_secondary', 'Ver Planos')}
              </Button>
            </Link>
          </div>
        </div>
      </section>


      <ViaJARFooter />
    </div>
  );
};

export default ViaJARSaaS;
