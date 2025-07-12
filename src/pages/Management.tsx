
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import RegionSelector from "@/components/management/RegionSelector";
import DashboardMetrics from "@/components/management/DashboardMetrics";
import DashboardTabs from "@/components/management/DashboardTabs";
import { StrategicAnalyticsAI } from "@/components/analytics/StrategicAnalyticsAI";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Management = () => {
  // O estado da região selecionada ainda é local da página
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const {
    role,
    regionId,
    isAuthenticated,
    isGestor,
    isAdmin,
    isDiretorEstadual,
    isGestorIgr,
    getDashboardRoute,
    loading,
    handleSecureLogout,
  } = useSecureAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Se não for um gestor, redireciona para a página de login
    if (!isGestor) {
      navigate("/admin-login", { replace: true });
      return;
    }

    // Allow users to stay on management page if they have the right roles
    
    // Define a região do usuário como padrão se ele for um gestor de IGR
    if (isGestorIgr && regionId) {
      setSelectedRegion(regionId);
    }

  }, [isAuthenticated, isGestor, loading, navigate, getDashboardRoute, isGestorIgr, regionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center text-ms-primary-blue">
            <div className="animate-spin mb-3 mx-auto rounded-full border-4 border-blue-200 border-t-ms-primary-blue h-12 w-12"></div>
            <div className="font-semibold">Verificando permissões...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Se o usuário não for um gestor com acesso a esta página, mostra acesso restrito
  if (!isDiretorEstadual && !isGestorIgr && !isAdmin) {
     return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Acesso Não Autorizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Você não tem permissão para acessar este painel de controle.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Seu papel atual: <strong>{role?.role || 'nenhum'}</strong>
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Voltar para o Início
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Renderiza o dashboard de Management para Diretor Estadual, Gestor IGR e Admins
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="ms-container py-8">
          <div className="flex justify-between items-center mb-6">
            <RegionSelector
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              userRegion={isGestorIgr ? regionId : null} // Passa a região do gestor IGR
              userRole={String(role || 'user')}
            />

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/technical-admin">
                  <Button variant="outline" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-red-500" />
                    Administração Técnica
                  </Button>
                </Link>
              )}
              <Button onClick={handleSecureLogout} variant="outline" className="whitespace-nowrap">
                Sair do Sistema
              </Button>
            </div>
          </div>
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="analytics-ai">IA Analítica</TabsTrigger>
              <TabsTrigger value="management">Gestão</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardMetrics />
              <DashboardTabs region={selectedRegion} />
            </TabsContent>

            <TabsContent value="analytics-ai">
              <StrategicAnalyticsAI />
            </TabsContent>

            <TabsContent value="management">
              <DashboardTabs region={selectedRegion} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Management;
