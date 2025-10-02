import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Eye, Edit, Trash2, Copy, BarChart, PieChart, LineChart } from 'lucide-react';
import { reportService } from '@/services/reports/reportService';
import { ReportTemplate } from '@/types/reports';
import { useOverflowOneAuth } from '@/hooks/useOverflowOneAuth';
import { useToast } from '@/hooks/use-toast';

const ReportTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { user } = useOverflowOneAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await reportService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os modelos de relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (template: ReportTemplate) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerar relatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, generate with empty parameters
      // In a real implementation, you'd show a form to collect parameters
      const report = await reportService.generateReport(template.id, {}, user.id);
      
      toast({
        title: "Sucesso",
        description: "Relatório gerado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'bar':
        return <BarChart className="h-4 w-4" />;
      case 'pie':
      case 'doughnut':
        return <PieChart className="h-4 w-4" />;
      case 'line':
        return <LineChart className="h-4 w-4" />;
      default:
        return <BarChart className="h-4 w-4" />;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar modelos de relatórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="inventory">Inventário</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getChartIcon(template.chart_config.type)}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <CardDescription className="text-sm text-gray-600">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  <p><strong>Fonte de dados:</strong> {template.data_source}</p>
                  <p><strong>Campos:</strong> {template.fields.length}</p>
                  <p><strong>Filtros:</strong> {template.filters.length}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleGenerateReport(template)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="mr-1 h-3 w-3" />
                    Gerar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum modelo de relatório encontrado.</p>
          <p className="text-sm">Tente ajustar os filtros ou criar um novo modelo.</p>
        </div>
      )}
    </div>
  );
};

export default ReportTemplates;
