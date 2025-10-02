import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, FileText, Calendar, BarChart, Settings } from 'lucide-react';
import ReportTemplates from './ReportTemplates';
import ReportSchedules from './ReportSchedules';
import ReportBuilder from './ReportBuilder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ReportManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Personalizados</h1>
          <p className="text-gray-600 mt-2">
            Crie, agende e gerencie relatórios personalizados do seu inventário turístico
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Relatório</DialogTitle>
              </DialogHeader>
              <ReportBuilder onClose={() => setIsBuilderOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Modelos</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <BarChart className="h-4 w-4" />
            <span>Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Agendamentos</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Histórico de relatórios temporariamente indisponível</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportSchedules />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configurações de relatórios em breve...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportManager;
