import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import GeoCheckIn from '@/components/attendant/GeoCheckIn';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { Navigate } from 'react-router-dom';

const AttendantCheckIn: React.FC = () => {
  const { user, loading } = useAuth();
  const { userRole, hasAccess } = useRoleBasedAccess();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAccess(['atendente'])) {
    return <Navigate to="/login" replace />;
  }

  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sistema de Ponto
            </h1>
            <p className="text-gray-600 text-lg">
              Olá, <span className="font-semibold text-blue-600">{user.name}</span>! 
              Faça seu check-in por geolocalização
            </p>
          </div>

          {/* Check-in Component */}
          <div className="max-w-lg mx-auto">
            <GeoCheckIn />
          </div>

          {/* Informações Úteis */}
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Como Funciona o Sistema
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Localização Automática</h3>
                    <p className="text-gray-600 text-sm">
                      O sistema detecta automaticamente sua localização usando GPS
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Validação por Área</h3>
                    <p className="text-gray-600 text-sm">
                      Você deve estar dentro do raio autorizado do local de trabalho
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Horário de Trabalho</h3>
                    <p className="text-gray-600 text-sm">
                      Check-in só é permitido durante o horário de funcionamento
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Registro Seguro</h3>
                    <p className="text-gray-600 text-sm">
                      Todos os dados são criptografados e armazenados com segurança
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>
              Em caso de problemas, entre em contato com seu gestor municipal
            </p>
            <p className="mt-1">
              FlowTrip - Sistema de Gestão Turística
            </p>
          </div>
        </div>
      </div>
    </UniversalLayout>
  );
};

export default AttendantCheckIn; 