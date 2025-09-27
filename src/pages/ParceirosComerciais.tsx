import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building, Store, Hotel, Utensils, Map, Calendar, Megaphone, Globe, Shield, TrendingUp } from 'lucide-react';

const ParceirosComerciais = () => {
  const categorias = [
    { icon: <Store className="h-6 w-6 text-primary" />, titulo: 'Comércio e Serviços', desc: 'Lojas, serviços essenciais, saúde e bem-estar' },
    { icon: <Hotel className="h-6 w-6 text-primary" />, titulo: 'Meios de Hospedagem', desc: 'Hotéis, pousadas, hostels e resorts' },
    { icon: <Utensils className="h-6 w-6 text-primary" />, titulo: 'Gastronomia', desc: 'Restaurantes, cafés e experiências gastronômicas' },
    { icon: <Map className="h-6 w-6 text-primary" />, titulo: 'Atrativos e Experiências', desc: 'Parques, museus, passeios e operadores' },
    { icon: <Calendar className="h-6 w-6 text-primary" />, titulo: 'Eventos e Cultura', desc: 'Casas de shows, centros culturais e eventos' },
    { icon: <Building className="h-6 w-6 text-primary" />, titulo: 'Institucionais', desc: 'Parcerias com governos, IGRs e entidades' },
  ];

  const beneficios = [
    { icon: <Megaphone className="h-5 w-5 text-primary" />, texto: 'Divulgação qualificada no portal e app' },
    { icon: <TrendingUp className="h-5 w-5 text-primary" />, texto: 'Aumento de fluxo e ticket médio' },
    { icon: <Globe className="h-5 w-5 text-primary" />, texto: 'Conteúdo multi-idiomas automaticamente' },
    { icon: <Shield className="h-5 w-5 text-primary" />, texto: 'Selo de confiança e curadoria' },
  ];

  return (
    <UniversalLayout>
      <section className="py-20 bg-gradient-to-br from-primary to-primary-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Programa de Parceiros</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Conecte sua marca ao maior ecossistema de turismo inteligente do Brasil. Amplie alcance, gere demanda e faça parte do destino.
          </p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contato">Fale com um consultor</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary">Categorias</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">Quem pode ser parceiro</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorias.map((cat) => (
              <Card key={cat.titulo} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    {cat.icon}
                    {cat.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{cat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge variant="outline">Benefícios</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">Por que ser parceiro</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beneficios.map((b, idx) => (
              <Card key={idx} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    {b.icon}
                    <p className="text-sm text-foreground font-medium">{b.texto}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild>
              <Link to="/contato">Quero ser parceiro</Link>
            </Button>
          </div>
        </div>
      </section>
    </UniversalLayout>
  );
};

export default ParceirosComerciais;
