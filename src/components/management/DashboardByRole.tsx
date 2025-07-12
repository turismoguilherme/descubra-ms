
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/hooks/useSecureAuth";
import { BarChart3, Users, MapPin, MessageSquare, Calendar, Shield } from "lucide-react";
import DashboardTabs from "./DashboardTabs";

interface DashboardByRoleProps {
  userRole: string | null;
  userRegion: string | null;
}

const DashboardByRole: React.FC<DashboardByRoleProps> = ({ userRole, userRegion }) => {
  if (userRole === 'admin' || userRole === 'tech') {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-6 w-6" />
              Administração Técnica
            </CardTitle>
            <CardDescription className="text-red-100">
              Acesso completo ao sistema - Use com responsabilidade
            </CardDescription>
          </CardHeader>
        </Card>
        <DashboardTabs region={userRegion || "all"} />
      </div>
    );
  }

  if (userRole === 'gestor_municipal' || userRole === 'municipal_manager') {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-6 w-6" />
              Dashboard Gerencial
            </CardTitle>
            <CardDescription className="text-blue-100">
              Gestão e monitoramento da região: {userRegion || 'Todas as regiões'}
            </CardDescription>
          </CardHeader>
        </Card>
        <DashboardTabs region={userRegion || "all"} />
      </div>
    );
  }

  if (userRole === 'atendente') {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-6 w-6" />
              Painel do Atendente
            </CardTitle>
            <CardDescription className="text-green-100">
              Ferramentas para atendimento ao turista
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <MapPin className="mr-2 h-5 w-5" />
                Check-ins CAT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Registre sua presença nos CATs</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <MessageSquare className="mr-2 h-5 w-5" />
                Consultas IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Tire dúvidas sobre turismo</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <Calendar className="mr-2 h-5 w-5" />
                Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Consulte eventos da região</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle>Dashboard do Usuário</CardTitle>
        <CardDescription>
          Bem-vindo ao sistema de turismo de Mato Grosso do Sul
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Explore os destinos, eventos e utilize o passaporte digital para uma experiência completa.
        </p>
      </CardContent>
    </Card>
  );
};

export default DashboardByRole;
