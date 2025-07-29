
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Shield, Database, Users, Settings, Activity, FileText, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DataDashboard from "@/components/admin/DataDashboard";
import UserDataManager from "@/components/admin/UserDataManager";
import SystemMaintenancePanel from "@/components/admin/SystemMaintenancePanel";
import AccessLogs from "@/components/admin/AccessLogs";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import ContentManager from "@/components/admin/ContentManager";
import InstitutionalContentManager from "@/components/admin/InstitutionalContentManager";
import { useNavigate } from "react-router-dom";
import SecurityDashboard from "@/components/admin/SecurityDashboard";

const TechnicalAdmin = () => {
  const { 
    userRole, 
    userRegion, 
    isAuthenticated, 
    isAdmin, 
    loading, 
    handleSecureLogout,
    refreshUserPermissions 
  } = useSecureAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/admin-login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center text-ms-primary-blue">
            <div className="animate-spin mb-3 mx-auto rounded-full border-4 border-blue-200 border-t-ms-primary-blue h-12 w-12"></div>
            <div className="font-semibold">Verificando permissões...</div>
            <div className="text-sm text-gray-500 mt-2">Aguarde um instante.</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Shield className="mr-2 h-5 w-5" />
                Acesso Negado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Esta área é restrita apenas para administradores técnicos.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Sua role atual: <strong>{userRole || 'Não definida'}</strong>
              </p>
              <div className="space-y-3">
                {isAuthenticated && (
                  <Button
                    onClick={refreshUserPermissions}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar Permissões
                  </Button>
                )}
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administração Técnica</h1>
              <p className="text-gray-600 mt-1">
                Painel de controle técnico do sistema - Usuário: {userRole} | Região: {userRegion}
              </p>
            </div>
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
              <Button 
                onClick={handleSecureLogout}
                variant="outline"
                className="flex items-center"
              >
                Sair
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="dashboard" className="flex items-center">
                <Database className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Manutenção
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="institutional" className="flex items-center">
                {/* <Handshake className="mr-2 h-4 w-4" /> */}
                Institucional
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DataDashboard />
            </TabsContent>

            <TabsContent value="security">
              <SecurityDashboard />
            </TabsContent>

            <TabsContent value="users">
              <AdminUserManagement />
            </TabsContent>

            <TabsContent value="maintenance">
              <SystemMaintenancePanel />
            </TabsContent>

            <TabsContent value="logs">
              <AccessLogs />
            </TabsContent>

            <TabsContent value="content">
              <ContentManager />
            </TabsContent>

            <TabsContent value="institutional">
              <InstitutionalContentManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicalAdmin;
