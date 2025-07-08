
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Calendar, FileText, BarChart3, LogOut } from "lucide-react";
import CollaboratorManager from "@/components/municipal/CollaboratorManager";
import CityTourManager from "@/components/municipal/CityTourManager";
import FileManager from "@/components/municipal/FileManager";
import SurveyManager from "@/components/municipal/SurveyManager";
import { useNavigate } from "react-router-dom";

const MunicipalAdmin = () => {
  const [activeTab, setActiveTab] = useState("collaborators");
  const { userRole, userRegion, isAuthenticated, isMunicipalManager, isAdmin, handleSecureLogout, loading } = useSecureAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin-login');
      return;
    }
    
    if (!loading && isAuthenticated && !isMunicipalManager && !isAdmin) {
      navigate('/management');
    }
  }, [loading, isAuthenticated, isMunicipalManager, isAdmin, navigate]);

  if (loading || !isAuthenticated) {
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="ms-container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield className="text-blue-600 mr-3 h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Área Administrativa Municipal</h1>
                <p className="text-gray-600">Gestão avançada para gestores públicos municipais</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Usuário</div>
                <Badge variant="outline">{userRole}</Badge>
              </div>
              {userRegion && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Região</div>
                  <Badge variant="outline">{userRegion}</Badge>
                </div>
              )}
              <Button onClick={handleSecureLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Colaboradores</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">City Tours</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Arquivos</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pesquisas</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="collaborators">
                <Users className="h-4 w-4 mr-2" />
                Colaboradores
              </TabsTrigger>
              <TabsTrigger value="city_tours">
                <Calendar className="h-4 w-4 mr-2" />
                City Tours
              </TabsTrigger>
              <TabsTrigger value="files">
                <FileText className="h-4 w-4 mr-2" />
                Arquivos
              </TabsTrigger>
              <TabsTrigger value="surveys">
                <BarChart3 className="h-4 w-4 mr-2" />
                Pesquisas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="collaborators">
              <CollaboratorManager />
            </TabsContent>

            <TabsContent value="city_tours">
              <CityTourManager />
            </TabsContent>

            <TabsContent value="files">
              <FileManager />
            </TabsContent>

            <TabsContent value="surveys">
              <SurveyManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MunicipalAdmin;
