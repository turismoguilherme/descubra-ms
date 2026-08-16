
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText, Database, MessageSquare } from "lucide-react";
import DocumentManager from "./DocumentManager";
import AlumiaConnection from "./AlumiaConnection";
import AIInterface from "./AIInterface";

const TourismIntelligence = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-ms-primary-blue" />
        <div>
          <h1 className="text-3xl font-bold text-ms-primary-blue">
            Inteligência Turística
          </h1>
          <p className="text-gray-600">
            Central de dados e análise inteligente para gestão turística
          </p>
        </div>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="alumia" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            API Alumia
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            IA Interpretativa
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <DocumentManager />
        </TabsContent>

        <TabsContent value="alumia">
          <AlumiaConnection />
        </TabsContent>

        <TabsContent value="ai">
          <AIInterface />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Análises Avançadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  Análises Automatizadas
                </h3>
                <p>
                  Esta funcionalidade estará disponível em breve com dashboards
                  e relatórios automáticos baseados nos dados coletados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TourismIntelligence;
