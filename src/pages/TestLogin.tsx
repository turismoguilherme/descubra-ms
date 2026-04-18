/**
 * Test Login Page
 * Página de login de teste para desenvolvimento
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, ArrowRight, CheckCircle, User } from 'lucide-react';
import TestUserSelector from '@/components/auth/TestUserSelector';
import { getCurrentTestUser, getTestUser, autoLoginTestUser, type TestUser } from '@/services/auth/TestUsers';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';

const TestLogin: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<TestUser | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const user = getCurrentTestUser();
    setCurrentUser(user);
  }, []);

  const handleUserSelected = (user: TestUser) => {
    setCurrentUser(user);
    setShowSelector(false);

    localStorage.setItem('test_user_id', user.id);
    localStorage.setItem('test_user_data', JSON.stringify(user));

    setTimeout(() => {
      switch (user.role) {
        case 'admin':
          navigate('/viajar/dashboard');
          break;
        case 'gestor_municipal':
          navigate('/secretary-dashboard');
          break;
        case 'user':
          navigate('/private-dashboard');
          break;
        case 'atendente':
        case 'cat_attendant':
          navigate('/attendant-dashboard');
          break;
        default:
          navigate('/unified');
      }
    }, 2000);
  };

  const handleQuickLogin = (businessType: string) => {
    const users: Record<string, string> = {
      hotel: 'hotel-owner-1',
      agency: 'agency-owner-1',
      restaurant: 'restaurant-owner-1',
      attraction: 'attraction-owner-1',
      municipal: 'municipal-1',
      attendant: 'attendant-1',
      cat_attendant: 'cat-attendant-1',
    };

    const userId = users[businessType];
    if (userId) {
      const user = getTestUser(userId);
      if (user) {
        autoLoginTestUser(userId);
        handleUserSelected(user);
      }
    }
  };

  const renderQuickLogin = () => {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Login Rápido</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Escolha um tipo de negócio para testar as funcionalidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleQuickLogin('hotel')}>
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-4xl">🏨</div>
              <h3 className="font-semibold">Hotel/Pousada</h3>
              <p className="text-sm text-muted-foreground">João Silva - Pousada do Sol</p>
              <Badge variant="secondary">Revenue Optimizer</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleQuickLogin('agency')}>
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-4xl">🚌</div>
              <h3 className="font-semibold">Agência de Viagem</h3>
              <p className="text-sm text-muted-foreground">Maria Santos - Viagens & Cia</p>
              <Badge variant="secondary">Lead Generation</Badge>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleQuickLogin('restaurant')}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-4xl">🍽️</div>
              <h3 className="font-semibold">Restaurante</h3>
              <p className="text-sm text-muted-foreground">Pedro Oliveira - Sabores do MS</p>
              <Badge variant="secondary">Sistema de Reservas</Badge>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleQuickLogin('attraction')}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-4xl">🎯</div>
              <h3 className="font-semibold">Atração Turística</h3>
              <p className="text-sm text-muted-foreground">Ana Costa - Parque das Cachoeiras</p>
              <Badge variant="secondary">Sistema de Ingressos</Badge>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleQuickLogin('municipal')}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-4xl">🏛️</div>
              <h3 className="font-semibold">Gestor Municipal</h3>
              <p className="text-sm text-muted-foreground">Prefeitura Bonito - Secretaria de Turismo</p>
              <Badge variant="secondary">Dashboard Municipal</Badge>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleQuickLogin('attendant')}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-4xl">👩‍💼</div>
              <h3 className="font-semibold">Atendente CAT</h3>
              <p className="text-sm text-muted-foreground">Maria Silva - CAT Centro</p>
              <Badge variant="secondary">Controle de Ponto</Badge>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleQuickLogin('cat_attendant')}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-4xl">👨‍💼</div>
              <h3 className="font-semibold">Atendente CAT Aeroporto</h3>
              <p className="text-sm text-muted-foreground">João Santos - CAT Aeroporto</p>
              <Badge variant="secondary">IA para Atendimento</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={() => setShowSelector(true)} className="flex items-center gap-2 mx-auto">
            <Users className="w-4 h-4" />
            Ver Todos os Usuários
          </Button>
        </div>
      </div>
    );
  };

  const renderCurrentUser = () => {
    if (!currentUser) return null;

    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-green-600">Logado com Sucesso!</h1>
          </div>
          <p className="text-lg text-muted-foreground">Você está logado como {currentUser.name}</p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <User className="w-5 h-5" />
              Usuário Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-green-800">{currentUser.name}</h3>
                <p className="text-green-600">{currentUser.businessName}</p>
                <p className="text-sm text-green-600">{currentUser.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-800 mb-2">Funcionalidades Disponíveis:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentUser.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-green-700">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2">Informações:</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Email:</strong> {currentUser.email}
                  </p>
                  <p>
                    <strong>Função:</strong> {currentUser.role}
                  </p>
                  <p>
                    <strong>Tipo de Negócio:</strong> {currentUser.businessType}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button
            size="lg"
            onClick={() => {
              if (currentUser) {
                localStorage.setItem('test_user_id', currentUser.id);
                localStorage.setItem('test_user_data', JSON.stringify(currentUser));
                setTimeout(() => {
                  handleUserSelected(currentUser);
                }, 1000);
              } else {
                navigate('/unified');
              }
            }}
            className="flex items-center gap-2"
          >
            Ir para Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setShowSelector(true)}>
              Trocar Usuário
            </Button>
            <Button variant="outline" onClick={() => navigate('/viajar')}>
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20">
      <ViaJARNavbar />

      <div className="container max-w-6xl mx-auto p-6">
        {showSelector ? (
          <TestUserSelector onUserSelected={handleUserSelected} onCancel={() => setShowSelector(false)} />
        ) : currentUser ? (
          renderCurrentUser()
        ) : (
          renderQuickLogin()
        )}
      </div>
    </div>
  );
};

export default TestLogin;
