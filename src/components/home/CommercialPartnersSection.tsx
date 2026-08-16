import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, TrendingUp, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

const CommercialPartnersSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Portal de Parceiros Comerciais
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conecte sua empresa ao ecossistema de turismo do Mato Grosso do Sul. 
            Faça parte da maior plataforma de turismo do estado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Empresas do Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Hotéis, pousadas, agências, restaurantes e atrativos turísticos
              </p>
              <div className="text-2xl font-bold text-primary">150+</div>
              <p className="text-sm text-muted-foreground">Parceiros ativos</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Business Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ferramentas de análise e relatórios personalizados
              </p>
              <div className="text-2xl font-bold text-primary">24/7</div>
              <p className="text-sm text-muted-foreground">Analytics disponíveis</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Alcance Expandido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Conecte-se com milhares de turistas
              </p>
              <div className="text-2xl font-bold text-primary">10k+</div>
              <p className="text-sm text-muted-foreground">Usuários mensais</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-lg p-8 border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Transforme seu negócio com dados inteligentes
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Diagnósticos empresariais personalizados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Inventários turísticos digitais</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Análise de perfil do turista</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Relatórios de tendências de consumo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Assistente virtual Guilherme</span>
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
                    Explorar Portal
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/comercial-dashboard">
                    Dashboard Comercial
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

export default CommercialPartnersSection;