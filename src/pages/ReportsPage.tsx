import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  MapPin,
  Clock
} from 'lucide-react';
import { ReportManager } from '@/components/reports/ReportManager';
import { ReportSchedules } from '@/components/reports/ReportSchedules';
import { ReportTemplates } from '@/components/reports/ReportTemplates';

const ViaJARReportsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const mockReports = [
    {
      id: 1,
      name: 'Relatório de Ocupação Hoteleira',
      type: 'Ocupação',
      status: 'Concluído',
      lastRun: '2024-01-15',
      nextRun: '2024-01-22',
      views: 45
    },
    {
      id: 2,
      name: 'Análise de Fluxo Turístico',
      type: 'Fluxo',
      status: 'Em Execução',
      lastRun: '2024-01-14',
      nextRun: '2024-01-21',
      views: 23
    },
    {
      id: 3,
      name: 'Performance de Destinos',
      type: 'Performance',
      status: 'Agendado',
      lastRun: '2024-01-10',
      nextRun: '2024-01-17',
      views: 67
    }
  ];

  const reportStats = {
    totalReports: 12,
    activeReports: 8,
    scheduledReports: 4,
    totalViews: 1250
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
              <p className="text-gray-600 mt-2">
                Gerencie relatórios, analytics e insights do seu negócio
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
                  <p className="text-2xl font-bold text-gray-900">{reportStats.totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Relatórios Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{reportStats.activeReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Agendados</p>
                  <p className="text-2xl font-bold text-gray-900">{reportStats.scheduledReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Visualizações</p>
                  <p className="text-2xl font-bold text-gray-900">{reportStats.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="manager">Gerenciar</TabsTrigger>
            <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{report.name}</h3>
                          <p className="text-sm text-gray-600">
                            Última execução: {report.lastRun} • {report.views} visualizações
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={report.status === 'Concluído' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manager">
            <ReportManager />
          </TabsContent>

          <TabsContent value="schedules">
            <ReportSchedules />
          </TabsContent>

          <TabsContent value="templates">
            <ReportTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ViaJARReportsPage;

