
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import RegionSelector from "@/components/management/RegionSelector";
import DashboardMetrics from "@/components/management/DashboardMetrics";
import DashboardTabs from "@/components/management/DashboardTabs";
import StrategicAnalyticsAI from "@/components/analytics/StrategicAnalyticsAI";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Management = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const {
    userRole,
    userRegion,
    isAuthenticated,
    isManager,
    isAdmin,
    isMunicipalManager,
    isAttendant,
    getDashboardRoute,
    loading,
    handleSecureLogout,
    refreshUserPermissions
  } = useSecureAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && userRegion && userRegion !== "all") {
      setSelectedRegion(userRegion);
    }
  }, [isAuthenticated, userRegion]);

  useEffect(() => {
    if (loading) return;
    
    console.log("🔍 Management - Estado de autenticação:", {
      loading,
      isAuthenticated,
      userRole,
      isManager,
      isAdmin,
      recommendedRoute: getDashboardRoute()
    });
    
    if (!isAuthenticated) {
      console.log("❌ Usuário não autenticado, redirecionando para admin-login");
      navigate("/admin-login", { replace: true });
      return;
    }

    // Auto-redirect to specialized dashboard if user has specific role
    if (isAuthenticated && userRole) {
      const recommendedRoute = getDashboardRoute();
      if (recommendedRoute !== '/management' && window.location.pathname === '/management') {
        console.log(`🔄 Redirecionando ${userRole} para dashboard específico: ${recommendedRoute}`);
        navigate(recommendedRoute, { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, userRole, isManager, getDashboardRoute]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center text-ms-primary-blue">
            <div className="animate-spin mb-3 mx-auto rounded-full border-4 border-blue-200 border-t-ms-primary-blue h-12 w-12"></div>
            <div className="font-semibold">Verificando permissões...</div>
            <div className="text-sm text-gray-500 mt-2">Aguarde um instante.</div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-xs bg-gray-100 p-2 rounded">
                <p>Debug: Role = {userRole || 'carregando...'}</p>
                <p>Debug: Manager = {isManager ? 'sim' : 'não'}</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isManager) {
    console.log("❌ Usuário sem permissões de manager:", { userRole, isManager });
    
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Esta área é restrita para gestores e administradores do sistema.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Sua role atual: <strong>{userRole || 'nenhuma'}</strong>
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Roles aceitas: admin, tech, municipal, municipal_manager, gestor, atendente
              </p>
              <div className="space-y-3">
                <Button
                  onClick={refreshUserPermissions}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar Permissões
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Voltar para o Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="ms-container py-8">
          <div className="flex justify-between items-center mb-6">
            <RegionSelector
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              userRegion={userRegion}
              userRole={userRole}
            />

            <div className="flex items-center gap-3">
              <Button 
                onClick={refreshUserPermissions}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar Permissões
              </Button>

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
          {/* Sistema de Tabs Principal para Gestores */}
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
              <StrategicAnalyticsAI userRegion={selectedRegion} />
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
