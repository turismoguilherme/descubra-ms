import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Download, Search, Filter, Star, TrendingUp, Users, MapPin, DollarSign, Calendar, BarChart } from 'lucide-react';

const dataProducts = [
  {
    id: 1,
    title: "Perfil do Turista MS 2024",
    description: "Análise completa do comportamento e preferências dos turistas em Mato Grosso do Sul",
    category: "Perfil do Cliente",
    price: 299,
    rating: 4.8,
    downloads: 142,
    updated: "2024-10-15",
    tags: ["Demografia", "Comportamento", "Preferências"],
    preview: {
      insights: ["Idade média: 35 anos", "Gasto médio: R$ 1.200/viagem", "Permanência: 4.2 dias"],
      charts: 12,
      pages: 28
    }
  },
  {
    id: 2,
    title: "Tendências Sazonais Pantanal",
    description: "Padrões de visitação e ocupação no Pantanal nos últimos 3 anos",
    category: "Sazonalidade",
    price: 199,
    rating: 4.6,
    downloads: 89,
    updated: "2024-10-10",
    tags: ["Pantanal", "Ocupação", "Tendências"],
    preview: {
      insights: ["Pico: Julho (92% ocupação)", "Baixa: Fevereiro (45%)", "Crescimento anual: 8%"],
      charts: 8,
      pages: 18
    }
  },
  {
    id: 3,
    title: "Benchmark Hotelaria Campo Grande",
    description: "Comparativo de preços, ocupação e serviços dos principais hotéis",
    category: "Benchmarking",
    price: 399,
    rating: 4.9,
    downloads: 67,
    updated: "2024-10-12",
    tags: ["Hotéis", "Preços", "Competição"],
    preview: {
      insights: ["50 hotéis analisados", "Preço médio: R$ 180/noite", "Taxa ocupação: 73%"],
      charts: 15,
      pages: 35
    }
  },
  {
    id: 4,
    title: "ROI Marketing Digital Turismo",
    description: "Análise de retorno de investimento em campanhas digitais no setor turístico",
    category: "Marketing",
    price: 249,
    rating: 4.7,
    downloads: 123,
    updated: "2024-10-08",
    tags: ["ROI", "Digital", "Campanhas"],
    preview: {
      insights: ["ROI médio: 3.2:1", "Melhor canal: Instagram", "CPC médio: R$ 0.45"],
      charts: 10,
      pages: 22
    }
  },
  {
    id: 5,
    title: "Previsão Demanda Ecoturismo",
    description: "Projeções de demanda para atividades de ecoturismo nos próximos 12 meses",
    category: "Previsão",
    price: 349,
    rating: 4.5,
    downloads: 45,
    updated: "2024-10-05",
    tags: ["Ecoturismo", "Previsão", "Demanda"],
    preview: {
      insights: ["Crescimento esperado: 15%", "Melhor período: Maio-Setembro", "Perfil: 25-45 anos"],
      charts: 11,
      pages: 24
    }
  },
  {
    id: 6,
    title: "Análise Eventos Corporativos",
    description: "Mercado de eventos corporativos e turismo de negócios em MS",
    category: "Eventos",
    price: 179,
    rating: 4.4,
    downloads: 78,
    updated: "2024-09-28",
    tags: ["Corporativo", "Eventos", "Negócios"],
    preview: {
      insights: ["Mercado: R$ 45M/ano", "Crescimento: 12%/ano", "Duração média: 2.5 dias"],
      charts: 7,
      pages: 16
    }
  }
];

const subscriptionPlans = [
  {
    name: "Básico",
    price: 99,
    period: "mês",
    description: "Para pequenos negócios",
    features: [
      "3 relatórios por mês",
      "Dados básicos de mercado",
      "Suporte por email",
      "Histórico de 6 meses"
    ],
    badge: "Mais Popular"
  },
  {
    name: "Premium",
    price: 299,
    period: "mês",
    description: "Para empresas em crescimento",
    features: [
      "10 relatórios por mês",
      "Análises avançadas",
      "API de dados",
      "Suporte prioritário",
      "Histórico de 2 anos",
      "Relatórios customizados"
    ]
  },
  {
    name: "Enterprise",
    price: 799,
    period: "mês",
    description: "Para grandes empresas",
    features: [
      "Relatórios ilimitados",
      "Dados em tempo real",
      "Dashboard personalizado",
      "Consultoria dedicada",
      "Histórico completo",
      "White-label"
    ]
  }
];

export function DataMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<typeof dataProducts[0] | null>(null);

  const filteredProducts = dataProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: number) => {
    setCart(prev => [...prev, productId]);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(id => id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, productId) => {
      const product = dataProducts.find(p => p.id === productId);
      return total + (product?.price || 0);
    }, 0);
  };

  const categories = ['all', ...Array.from(new Set(dataProducts.map(p => p.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Marketplace de Dados</h1>
            <p className="text-muted-foreground">Acesse dados tratados e insights do mercado turístico</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrinho ({cart.length})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-primary">
                  {cart.length}
                </Badge>
              )}
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/80">
              <DollarSign className="h-4 w-4 mr-2" />
              Total: R$ {getTotalPrice()}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="produtos">Produtos de Dados</TabsTrigger>
            <TabsTrigger value="assinaturas">Planos de Assinatura</TabsTrigger>
            <TabsTrigger value="personalizado">Relatórios Personalizados</TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos de dados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'Todas as categorias' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">{product.category}</Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {product.rating}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-3">{product.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {product.downloads} downloads
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(product.updated).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        R$ {product.price}
                      </span>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                              <BarChart className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{product.title}</DialogTitle>
                              <DialogDescription>{product.description}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Principais Insights:</h4>
                                <ul className="space-y-1">
                                  {product.preview.insights.map((insight, index) => (
                                    <li key={index} className="flex items-center text-sm">
                                      <TrendingUp className="h-3 w-3 mr-2 text-primary" />
                                      {insight}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-muted rounded-lg p-3">
                                  <span className="font-medium">Gráficos:</span> {product.preview.charts}
                                </div>
                                <div className="bg-muted rounded-lg p-3">
                                  <span className="font-medium">Páginas:</span> {product.preview.pages}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {cart.includes(product.id) ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeFromCart(product.id)}
                          >
                            Remover
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => addToCart(product.id)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Comprar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assinaturas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.badge ? 'ring-2 ring-primary' : ''}`}>
                  {plan.badge && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                      {plan.badge}
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      R$ {plan.price}
                      <span className="text-lg text-muted-foreground">/{plan.period}</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.badge ? "default" : "outline"}>
                      Assinar {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personalizado" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Relatório Personalizado</CardTitle>
                <CardDescription>
                  Precisa de dados específicos? Nossa equipe pode criar relatórios customizados para suas necessidades.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Análise de Mercado Específica",
                      description: "Estudo detalhado de um nicho ou região específica",
                      price: "A partir de R$ 1.500",
                      time: "7-14 dias"
                    },
                    {
                      title: "Pesquisa de Viabilidade",
                      description: "Análise de viabilidade para novos empreendimentos",
                      price: "A partir de R$ 2.500",
                      time: "14-21 dias"
                    },
                    {
                      title: "Benchmark Competitivo",
                      description: "Comparação detalhada com concorrentes específicos",
                      price: "A partir de R$ 1.200",
                      time: "5-10 dias"
                    },
                    {
                      title: "Análise de Dados Proprietários",
                      description: "Análise dos seus próprios dados com nossos insights",
                      price: "A partir de R$ 800",
                      time: "3-7 dias"
                    }
                  ].map((service, index) => (
                    <Card key={index} className="border-dashed border-2 hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-primary">{service.price}</span>
                          <Badge variant="outline">{service.time}</Badge>
                        </div>
                        <Button className="w-full" variant="outline">
                          Solicitar Orçamento
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}