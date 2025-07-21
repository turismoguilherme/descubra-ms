import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tourismRouteService, Route } from "@/services/routes/tourismRouteService"; // Importar o serviço e a interface
import { Badge } from "@/components/ui/badge"; // Added missing import for Badge

const RoutesManagement = () => {
  const { userRole, isAuthenticated, loading } = useSecureAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin-login');
      return;
    }

    // Adicionar verificação de role para acesso
    const hasPermission = userRole === "admin" || userRole === "tech" || userRole === "municipal_manager";
    if (!loading && isAuthenticated && !hasPermission) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para gerenciar roteiros.",
        variant: "destructive",
      });
      navigate('/ms/admin'); // Redirecionar para o portal admin ou outra página
      return;
    }

    if (hasPermission) {
      fetchRoutes();
    }
  }, [loading, isAuthenticated, navigate, userRole, toast]);

  const fetchRoutes = async () => {
    setIsLoadingRoutes(true);
    try {
      const fetchedRoutes = await tourismRouteService.getRoutes();
      setRoutes(fetchedRoutes);
    } catch (error) {
      console.error("Erro ao buscar roteiros:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os roteiros.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este roteiro e todos os seus checkpoints?\nEsta ação é irreversível.")) {
      try {
        await tourismRouteService.deleteRoute(id);
        toast({
          title: "Sucesso",
          description: "Roteiro excluído com sucesso!",
        });
        fetchRoutes(); // Recarregar a lista
      } catch (error) {
        console.error("Erro ao excluir roteiro:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o roteiro.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading || !isAuthenticated || isLoadingRoutes) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow ms-container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-ms-primary-blue">Gerenciamento de Roteiros</h1>
          <Button onClick={() => navigate("/ms/admin/route-editor")}>
            <PlusCircle size={16} className="mr-2" />
            Novo Roteiro
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roteiros Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            {routes.length === 0 ? (
              <p className="text-gray-600">Nenhum roteiro cadastrado ainda.</p>
            ) : (
              <div className="space-y-4">
                {routes.map((route) => (
                  <div key={route.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{route.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{route.description || "Sem descrição"}</p>
                      <Badge variant={route.is_active ? "default" : "outline"} className="mt-1">
                        {route.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/ms/admin/route-editor/${route.id}`)}>
                        <Edit size={16} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteRoute(route.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RoutesManagement; 