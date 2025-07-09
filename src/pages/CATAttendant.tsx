
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, MessageSquare, BarChart3, Clock } from "lucide-react";
import EnhancedCATCheckin from "@/components/cat/EnhancedCATCheckin";
import CATAIInterface from "@/components/cat/CATAIInterface";
import AnalyticsDashboard from "@/components/management/AnalyticsDashboard";
import AttendantTimesheet from "@/components/cat/AttendantTimesheet";

const CATAttendant = () => {
  const { user, userRole, isAuthenticated, isAttendant, isAdmin, loading, handleSecureLogout } = useSecureAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAttendant && !isAdmin) {
    return <Navigate to="/management" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Portal do Atendente CAT
                </h1>
                <p className="text-gray-600">
                  Bem-vindo, {user?.email} | Role: {userRole}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Online</span>
                </div>
                <button
                  onClick={handleSecureLogout}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="checkin" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="ai-support" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Suporte IA
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horários
            </TabsTrigger>
          </TabsList>

          {/* Aba de Check-in */}
          <TabsContent value="checkin">
            <EnhancedCATCheckin />
          </TabsContent>

          {/* Aba de Suporte IA */}
          <TabsContent value="ai-support">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Assistente IA para Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CATAIInterface 
                  attendantId={user.id}
                  attendantName={user.email || "Atendente"}
                  catLocation="CAT Central"
                  latitude={-20.4626}
                  longitude={-54.6417}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Métricas */}
          <TabsContent value="metrics">
            <AnalyticsDashboard userRole="atendente" />
          </TabsContent>

          {/* Aba de Horários - Sistema de Ponto */}
          <TabsContent value="schedule">
            <AttendantTimesheet />
          </TabsContent>
        </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CATAttendant;
