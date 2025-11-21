import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, TrendingUp, Users, Star, Brain, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const CommercialSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Soluções Comerciais para Empresas de Turismo
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Potencialize seu negócio turístico com nossas ferramentas avançadas de Business Intelligence, 
            Guilherme e marketplace de dados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Guilherme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Assistente virtual inteligente para atendimento e recomendações personalizadas
              </p>
              <div className="text-2xl font-bold text-primary">24/7</div>
              <p className="text-sm text-muted-foreground">Disponibilidade</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Business Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Análises avançadas e insights para otimizar seu negócio
              </p>
              <div className="text-2xl font-bold text-primary">Real-time</div>
              <p className="text-sm text-muted-foreground">Analytics</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Marketplace de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Acesse dados exclusivos do mercado turístico
              </p>
              <div className="text-2xl font-bold text-primary">Premium</div>
              <p className="text-sm text-muted-foreground">Dados certificados</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-lg p-8 border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Transforme dados em crescimento
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Diagnósticos empresariais automatizados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Análise preditiva de demanda</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Perfil detalhado do turista</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Otimização de preços dinâmica</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Integração com sistemas existentes</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="mb-6">
                <div className="text-3xl font-bold text-primary mb-2">A partir de</div>
                <div className="text-5xl font-bold">R$ 49,90</div>
                <div className="text-muted-foreground">por mês</div>
              </div>
              
              <div className="space-y-4">
                <Button asChild size="lg" className="w-full">
                  <Link to="/parceiros-comerciais">
                    Explorar Soluções
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/precos">
                    Ver Todos os Planos
                  </Link>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Planos básico, premium e enterprise disponíveis
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommercialSection;