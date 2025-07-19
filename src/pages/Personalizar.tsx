import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Palette, Upload, Eye, Download, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMultiTenant } from '@/config/multiTenant';

const Personalizar: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, getPathWithTenant } = useMultiTenant();
  const [previewMode, setPreviewMode] = useState(false);

  const [customization, setCustomization] = useState({
    brandName: 'Sua Marca',
    primaryColor: '#2563eb',
    secondaryColor: '#0ea5e9',
    logo: null,
    description: 'Plataforma turística personalizada para sua região',
    features: {
      ai: true,
      accessibility: true,
      analytics: true,
      multiLanguage: false,
      customDomain: false
    }
  });

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setCustomization(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const features = [
    { key: 'ai', label: 'Inteligência Artificial', description: 'Chatbot e recomendações personalizadas' },
    { key: 'accessibility', label: 'Acessibilidade', description: 'VLibras e recursos inclusivos' },
    { key: 'analytics', label: 'Analytics Avançado', description: 'Relatórios e métricas detalhadas' },
    { key: 'multiLanguage', label: 'Multi-idioma', description: 'Suporte a múltiplos idiomas' },
    { key: 'customDomain', label: 'Domínio Personalizado', description: 'Seu próprio domínio' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(getPathWithTenant('/'))}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Personalizar White Label
              </h1>
              <p className="text-gray-600">
                Configure sua plataforma turística personalizada
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Identidade Visual
                </CardTitle>
                <CardDescription>
                  Personalize cores, logo e identidade da sua marca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="brandName">Nome da Marca</Label>
                  <Input
                    id="brandName"
                    value={customization.brandName}
                    onChange={(e) => setCustomization(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="Sua Marca Turística"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={customization.description}
                    onChange={(e) => setCustomization(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da sua plataforma"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={customization.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Cor Secundária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={customization.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={customization.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        placeholder="#0ea5e9"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Logo da Marca</Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Clique para fazer upload do seu logo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG até 2MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Funcionalidades
                </CardTitle>
                <CardDescription>
                  Escolha quais recursos incluir na sua plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{feature.label}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                    <Switch
                      checked={customization.features[feature.key as keyof typeof customization.features]}
                      onCheckedChange={() => handleFeatureToggle(feature.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? 'Editar' : 'Visualizar'}
                  </Button>
                </div>
                <CardDescription>
                  Veja como sua plataforma personalizada ficará
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-6 min-h-[400px]"
                  style={{
                    background: `linear-gradient(135deg, ${customization.primaryColor}20, ${customization.secondaryColor}20)`
                  }}
                >
                  <div className="text-center space-y-4">
                    <div 
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: customization.primaryColor }}
                    >
                      {customization.brandName.charAt(0)}
                    </div>
                    
                    <div>
                      <h2 
                        className="text-2xl font-bold"
                        style={{ color: customization.primaryColor }}
                      >
                        {customization.brandName}
                      </h2>
                      <p className="text-gray-600 mt-1">{customization.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {Object.entries(customization.features)
                        .filter(([_, enabled]) => enabled)
                        .map(([key, _]) => (
                          <Badge 
                            key={key}
                            style={{ backgroundColor: customization.secondaryColor }}
                            className="text-white"
                          >
                            {features.find(f => f.key === key)?.label}
                          </Badge>
                        ))}
                    </div>

                    <div className="pt-4">
                      <Button 
                        style={{ backgroundColor: customization.primaryColor }}
                        className="text-white"
                      >
                        Começar Agora
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Próximos Passos */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
                <CardDescription>
                  Como proceder com a personalização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Configuração Inicial</div>
                    <div className="text-sm text-gray-600">Personalize cores e identidade</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Implementação</div>
                    <div className="text-sm text-gray-600">Nossa equipe implementa sua plataforma</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Lançamento</div>
                    <div className="text-sm text-gray-600">Sua plataforma personalizada no ar</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => navigate('/contato')}
                  >
                    Falar com Especialista
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/precos')}
                  >
                    Ver Planos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personalizar; 