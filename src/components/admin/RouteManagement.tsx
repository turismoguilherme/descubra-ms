import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, Edit, Trash2, Users, MapPin, Award, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RouteForm from "./RouteForm";
import RouteList from "./RouteList";
import RoutePerformance from "./RoutePerformance";
import RouteCompletions from "./RouteCompletions";
import { useRouteManagement } from "@/hooks/useRouteManagement";
import { TouristRoute, RouteCreateData } from "@/types/passport";
import RegionManagement from "./RegionManagement";

interface RouteManagementProps {
  userRegion?: string;
}

const RouteManagement = ({ userRegion }: RouteManagementProps) => {
  const [activeTab, setActiveTab] = useState("routes");
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TouristRoute | null>(null);
  const { toast } = useToast();
  
  const {
    routes,
    loading,
    loadRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    getRouteStatistics
  } = useRouteManagement(userRegion);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleCreateRoute = () => {
    setEditingRoute(null);
    setShowForm(true);
  };

  const handleEditRoute = (route: TouristRoute) => {
    setEditingRoute(route);
    setShowForm(true);
  };

  const handleSaveRoute = async (routeData: RouteCreateData) => {
    try {
      if (editingRoute) {
        await updateRoute(editingRoute.id, routeData);
        toast({
          title: "Roteiro atualizado",
          description: "O roteiro foi atualizado com sucesso.",
        });
      } else {
        await createRoute(routeData);
        toast({
          title: "Roteiro criado",
          description: "O roteiro foi criado com sucesso.",
        });
      }
      setShowForm(false);
      setEditingRoute(null);
      loadRoutes();
    } catch (error) {
      console.error("Erro ao salvar roteiro:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o roteiro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este roteiro?")) {
      try {
        await deleteRoute(routeId);
        toast({
          title: "Roteiro excluído",
          description: "O roteiro foi excluído com sucesso.",
        });
        loadRoutes();
      } catch (error) {
        console.error("Erro ao excluir roteiro:", error);
        toast({
          title: "Erro",
          description: "Erro ao excluir o roteiro. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  if (showForm) {
    return (
      <RouteForm
        route={editingRoute}
        userRegion={userRegion}
        onSave={handleSaveRoute}
        onCancel={() => {
          setShowForm(false);
          setEditingRoute(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão do Passaporte Digital</h2>
          <p className="text-gray-600">
            Gerencie regiões, cidades, roteiros e recompensas do sistema gamificado
          </p>
        </div>
        <Button onClick={handleCreateRoute} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Roteiro
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="regions" className="flex items-center gap-2">
            🏞️ Regiões
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Roteiros
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Desempenho
          </TabsTrigger>
          <TabsTrigger value="completions" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Conclusões
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regions">
          <RegionManagement userRegion={userRegion} />
        </TabsContent>

        <TabsContent value="routes">
          <RouteList
            routes={routes}
            loading={loading}
            onEdit={handleEditRoute}
            onDelete={handleDeleteRoute}
          />
        </TabsContent>

        <TabsContent value="performance">
          <RoutePerformance 
            routes={routes}
            userRegion={userRegion}
          />
        </TabsContent>

        <TabsContent value="completions">
          <RouteCompletions 
            routes={routes}
            userRegion={userRegion}
          />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Exporte dados dos roteiros para análise externa.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar Roteiros (CSV)
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar Check-ins (CSV)
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar Conclusões (CSV)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RouteManagement;
