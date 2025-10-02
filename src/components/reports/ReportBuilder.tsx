import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Settings, BarChart, PieChart, LineChart } from 'lucide-react';
import { ReportTemplate, ReportField, ReportFilter, ChartConfig } from '@/types/reports';

interface ReportBuilderProps {
  onClose: () => void;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({ onClose }) => {
  const [template, setTemplate] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    data_source: 'tourism_inventory',
    fields: [],
    filters: [],
    chart_config: {
      type: 'bar',
      title: '',
      show_legend: true,
      show_data_labels: true
    },
    is_public: false
  });

  const [activeTab, setActiveTab] = useState('basic');

  const addField = () => {
    const newField: ReportField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'string',
      required: false,
      order: template.fields?.length || 0
    };
    setTemplate({
      ...template,
      fields: [...(template.fields || []), newField]
    });
  };

  const updateField = (index: number, field: Partial<ReportField>) => {
    const updatedFields = [...(template.fields || [])];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setTemplate({ ...template, fields: updatedFields });
  };

  const removeField = (index: number) => {
    const updatedFields = template.fields?.filter((_, i) => i !== index) || [];
    setTemplate({ ...template, fields: updatedFields });
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: `filter_${Date.now()}`,
      field: '',
      label: '',
      type: 'text',
      required: false
    };
    setTemplate({
      ...template,
      filters: [...(template.filters || []), newFilter]
    });
  };

  const updateFilter = (index: number, filter: Partial<ReportFilter>) => {
    const updatedFilters = [...(template.filters || [])];
    updatedFilters[index] = { ...updatedFilters[index], ...filter };
    setTemplate({ ...template, filters: updatedFilters });
  };

  const removeFilter = (index: number) => {
    const updatedFilters = template.filters?.filter((_, i) => i !== index) || [];
    setTemplate({ ...template, filters: updatedFilters });
  };

  const updateChartConfig = (config: Partial<ChartConfig>) => {
    setTemplate({
      ...template,
      chart_config: { ...template.chart_config, ...config }
    });
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar':
        return <BarChart className="h-4 w-4" />;
      case 'pie':
        return <PieChart className="h-4 w-4" />;
      case 'line':
        return <LineChart className="h-4 w-4" />;
      default:
        return <BarChart className="h-4 w-4" />;
    }
  };

  const handleSave = () => {
    // In a real implementation, you'd save the template
    console.log('Saving template:', template);
    onClose();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="fields">Campos</TabsTrigger>
          <TabsTrigger value="filters">Filtros</TabsTrigger>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Relatório</Label>
                <Input
                  id="name"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  placeholder="Ex: Inventário por Categoria"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={template.description}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                  placeholder="Descreva o que este relatório mostra..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={template.category}
                    onValueChange={(value) => setTemplate({ ...template, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">Inventário</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data_source">Fonte de Dados</Label>
                  <Select
                    value={template.data_source}
                    onValueChange={(value) => setTemplate({ ...template, data_source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourism_inventory">Inventário Turístico</SelectItem>
                      <SelectItem value="inventory_reviews">Reviews</SelectItem>
                      <SelectItem value="inventory_categories">Categorias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Campos do Relatório</CardTitle>
                <Button onClick={addField} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Campo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.fields?.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Nome do Campo</Label>
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(index, { name: e.target.value })}
                        placeholder="Ex: name"
                      />
                    </div>
                    <div>
                      <Label>Rótulo</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="Ex: Nome"
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(index, { type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">Texto</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="date">Data</SelectItem>
                          <SelectItem value="boolean">Sim/Não</SelectItem>
                          <SelectItem value="currency">Moeda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeField(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {(!template.fields || template.fields.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum campo adicionado ainda.</p>
                  <p className="text-sm">Clique em "Adicionar Campo" para começar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filtros</CardTitle>
                <Button onClick={addFilter} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Filtro
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.filters?.map((filter, index) => (
                <Card key={filter.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Campo</Label>
                      <Input
                        value={filter.field}
                        onChange={(e) => updateFilter(index, { field: e.target.value })}
                        placeholder="Ex: category_id"
                      />
                    </div>
                    <div>
                      <Label>Rótulo</Label>
                      <Input
                        value={filter.label}
                        onChange={(e) => updateFilter(index, { label: e.target.value })}
                        placeholder="Ex: Categoria"
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select
                        value={filter.type}
                        onValueChange={(value) => updateFilter(index, { type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="select">Seleção</SelectItem>
                          <SelectItem value="date_range">Período</SelectItem>
                          <SelectItem value="number_range">Faixa Numérica</SelectItem>
                          <SelectItem value="boolean">Sim/Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFilter(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {(!template.filters || template.filters.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum filtro adicionado ainda.</p>
                  <p className="text-sm">Clique em "Adicionar Filtro" para começar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Gráfico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Gráfico</Label>
                  <Select
                    value={template.chart_config?.type}
                    onValueChange={(value) => updateChartConfig({ type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Barras</SelectItem>
                      <SelectItem value="line">Linha</SelectItem>
                      <SelectItem value="pie">Pizza</SelectItem>
                      <SelectItem value="doughnut">Rosquinha</SelectItem>
                      <SelectItem value="area">Área</SelectItem>
                      <SelectItem value="table">Tabela</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título do Gráfico</Label>
                  <Input
                    value={template.chart_config?.title}
                    onChange={(e) => updateChartConfig({ title: e.target.value })}
                    placeholder="Ex: Inventário por Categoria"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Eixo X</Label>
                  <Input
                    value={template.chart_config?.x_axis}
                    onChange={(e) => updateChartConfig({ x_axis: e.target.value })}
                    placeholder="Ex: category"
                  />
                </div>
                <div>
                  <Label>Eixo Y</Label>
                  <Input
                    value={template.chart_config?.y_axis}
                    onChange={(e) => updateChartConfig({ y_axis: e.target.value })}
                    placeholder="Ex: count"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Salvar Modelo
        </Button>
      </div>
    </div>
  );
};

export default ReportBuilder;
