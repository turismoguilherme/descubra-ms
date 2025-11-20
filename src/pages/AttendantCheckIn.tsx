import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import GeoCheckInSimple from '@/components/attendant/GeoCheckInSimple';
import CATAIInterface from '@/components/cat/CATAIInterface';
import TouristSurveyForm from '@/components/attendant/TouristSurveyForm';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Bot, Users, Clock, CheckCircle, MessageSquare } from 'lucide-react';

const AttendantCheckIn: React.FC = () => {
  const { user, loading } = useAuth();
  const { userRole } = useRoleBasedAccess();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || (userRole !== 'atendente' && userRole !== 'cat_attendant')) {
    return <Navigate to="/viajar/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ViaJARNavbar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema de Atendimento CAT</h1>
              <p className="text-gray-600 mt-2">
                Olá, <span className="font-semibold text-blue-600">{user?.email}</span>! 
                Gerencie seu atendimento e check-in
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Sistema Ativo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="checkin" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Check-in</span>
            </TabsTrigger>
            <TabsTrigger value="survey" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Pesquisa</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>IA de Atendimento</span>
            </TabsTrigger>
            <TabsTrigger value="visitors" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Visitantes</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checkin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Check-in por Geolocalização</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GeoCheckInSimple />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="survey" className="space-y-6">
            <TouristSurveyForm />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span>Assistente IA para Atendimento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CATAIInterface 
                  attendantId={user?.id || ''}
                  attendantName={user?.email || ''}
                  catLocation="CAT Campo Grande"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Gestão de Visitantes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Gestão de Visitantes</h3>
                  <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Relatórios de Atendimento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Relatórios</h3>
                  <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AttendantCheckIn;