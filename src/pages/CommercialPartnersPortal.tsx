import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, TrendingUp, Star, MapPin, Phone, Mail, Globe } from "lucide-react";
import { useSecureCommercialPartners } from "@/hooks/useSecureCommercialPartners";
import { CommercialPartnerForm } from "@/components/commercial/CommercialPartnerForm";
import { CommercialPartnerDashboard } from "@/components/commercial/CommercialPartnerDashboard";

const CommercialPartnersPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [activeTab, setActiveTab] = useState("explore");

  const { partners, isLoading } = useSecureCommercialPartners({
    business_type: businessTypeFilter || undefined,
    city: cityFilter || undefined,
    status: 'approved'
  });

  const businessTypes = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'pousada', label: 'Pousada' },
    { value: 'resort', label: 'Resort' },
    { value: 'agencia_turismo', label: 'Agência de Turismo' },
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'atrativo_turistico', label: 'Atrativo Turístico' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'guia_turismo', label: 'Guia de Turismo' },
    { value: 'artesanato', label: 'Artesanato' },
    { value: 'evento', label: 'Evento' },
    { value: 'outro', label: 'Outro' }
  ];

  const getBusinessTypeLabel = (type: string) => {
    const businessType = businessTypes.find(bt => bt.value === type);
    return businessType?.label || type;
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Portal de Parceiros Comerciais
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conecte-se com empresas do trade turístico e impulsione seu negócio
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="explore">Explorar Parceiros</TabsTrigger>
            <TabsTrigger value="join">Seja um Parceiro</TabsTrigger>
            <TabsTrigger value="dashboard">Meu Dashboard</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Parceiros Comerciais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar parceiros..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Tipo de negócio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Cidade..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full md:w-[150px]"
                  />
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Carregando parceiros...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPartners.map((partner) => (
                      <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {partner.company_name}
                              </h3>
                              {partner.trade_name && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {partner.trade_name}
                                </p>
                              )}
                              <Badge className={getPlanBadgeColor(partner.subscription_plan)}>
                                {partner.subscription_plan}
                              </Badge>
                            </div>
                            {partner.featured && (
                              <Star className="h-5 w-5 text-yellow-500 fill-current" />
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{getBusinessTypeLabel(partner.business_type)}</span>
                            </div>
                            
                            {partner.city && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{partner.city}, {partner.state}</span>
                              </div>
                            )}
                            
                            {partner.contact_email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{partner.contact_email}</span>
                              </div>
                            )}
                            
                            {partner.website_url && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <a 
                                  href={partner.website_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>

                          {partner.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                              {partner.description}
                            </p>
                          )}

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{partner.total_views || 0} visualizações</span>
                              {partner.verified && (
                                <Badge variant="outline" className="text-xs">
                                  Verificado
                                </Badge>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              Ver Detalhes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!isLoading && filteredPartners.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum parceiro encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <CommercialPartnerForm />
          </TabsContent>

          <TabsContent value="dashboard">
            <CommercialPartnerDashboard />
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle>Planos de Assinatura</CardTitle>
                <p className="text-muted-foreground">
                  Escolha o plano ideal para seu negócio
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-center">Plano Básico</CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">R$ 49,90</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Listagem básica</li>
                        <li>• Até 5 fotos</li>
                        <li>• Informações de contato</li>
                        <li>• Analytics básico</li>
                      </ul>
                      <Button className="w-full mt-4">Escolher Plano</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="text-center">Plano Premium</CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">R$ 99,90</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Listagem destacada</li>
                        <li>• Até 20 fotos</li>
                        <li>• Galeria de imagens</li>
                        <li>• Analytics avançado</li>
                        <li>• Suporte prioritário</li>
                        <li>• Badge verificado</li>
                      </ul>
                      <Button className="w-full mt-4">Escolher Plano</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-center">Plano Enterprise</CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">R$ 199,90</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Listagem premium</li>
                        <li>• Fotos ilimitadas</li>
                        <li>• Vídeos promocionais</li>
                        <li>• Analytics completo</li>
                        <li>• Consultoria dedicada</li>
                        <li>• API access</li>
                        <li>• White-label</li>
                      </ul>
                      <Button className="w-full mt-4">Escolher Plano</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommercialPartnersPortal;