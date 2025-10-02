import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Map, Users, Globe2, CalendarDays, BarChart3, Languages, Layers3, Sparkles, Database } from 'lucide-react';

const ServicosStakeholders = () => {
  const servicosPrefeituras = [
    { icon: <Database className="h-5 w-5 text-primary" />, titulo: 'Inventário Turístico Padronizado', desc: 'Digitalização e padronização do inventário com taxonomia SeTur e campos customizáveis.' },
    { icon: <CalendarDays className="h-5 w-5 text-primary" />, titulo: 'Calendário Integrado de Eventos', desc: 'Eventos regionais, categorização, curadoria e integração com trade.' },
    { icon: <BarChart3 className="h-5 w-5 text-primary" />, titulo: 'Relatórios Gerenciais', desc: 'Painéis com KPIs, exportação PDF/CSV e insights de IA.' },
    { icon: <Map className="h-5 w-5 text-primary" />, titulo: 'Mapa de Calor e Fluxos', desc: 'Análise de densidade de visitação e origens de turistas.' },
    { icon: <Languages className="h-5 w-5 text-primary" />, titulo: 'Multi-idiomas automático', desc: 'Tradução automática do conteúdo para múltiplos idiomas.' },
    { icon: <Layers3 className="h-5 w-5 text-primary" />, titulo: 'Plataforma Colaborativa', desc: 'Moderação e contribuição da comunidade e trade local.' },
  ];

  const servicosTrade = [
    { icon: <Users className="h-5 w-5 text-primary" />, titulo: 'Vitrines e Destque', desc: 'Páginas de estabelecimentos, ofertas e experiências.' },
    { icon: <Sparkles className="h-5 w-5 text-primary" />, titulo: 'Campanhas e Cupons', desc: 'Ativação de demanda com campanhas segmentadas.' },
    { icon: <BarChart3 className="h-5 w-5 text-primary" />, titulo: 'Relatórios de Performance', desc: 'Cliques, conversões e comportamento do usuário.' },
    { icon: <FileText className="h-5 w-5 text-primary" />, titulo: 'Selo e Curadoria', desc: 'Selo de qualidade e políticas de visibilidade.' },
  ];

  return (
    <UniversalLayout>
      <section className="py-20 bg-gradient-to-br from-primary to-primary-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Serviços para o Ecossistema</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Soluções para Prefeituras, Trade Turístico e Turistas, inspiradas nas melhores práticas do mercado.
          </p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contato">Solicitar Proposta</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary">Prefeituras</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">Gestão Pública</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicosPrefeituras.map((s) => (
              <Card key={s.titulo} className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    {s.icon}
                    {s.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline">Trade</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">Setor Privado</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicosTrade.map((s) => (
              <Card key={s.titulo} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <p className="text-sm text-foreground font-medium">{s.titulo}</p>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild>
              <Link to="/contato">Fale com nosso time</Link>
            </Button>
          </div>
        </div>
      </section>
    </UniversalLayout>
  );
};

export default ServicosStakeholders;







