import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, MapPin, Award, Compass } from 'lucide-react';
import UniversalLayout from '@/components/layout/UniversalLayout';

interface PassportProfileGateProps {
  children: React.ReactNode;
}

/**
 * Exige login para usar o passaporte. Perfil demográfico opcional (sem bloqueio).
 */
const PassportProfileGate: React.FC<PassportProfileGateProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-ms-primary-blue/20"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-ms-primary-blue absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🛂</span>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <UniversalLayout>
        <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
          <div className="bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-12 md:py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="bg-white/20 backdrop-blur-sm p-5 rounded-full inline-block mb-4">
                <span className="text-5xl">🛂</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                Passaporte Digital MS
              </h1>
              <p className="text-white/90 text-lg mt-3 max-w-2xl mx-auto">
                Explore os destinos incríveis de Mato Grosso do Sul e colecione selos da fauna pantaneira
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 -mt-8">
            <Card className="bg-white rounded-2xl shadow-xl border-0 max-w-lg mx-auto overflow-hidden">
              <CardHeader className="text-center pb-4 pt-8">
                <CardTitle className="text-2xl font-bold text-ms-primary-blue">
                  Acesse seu Passaporte
                </CardTitle>
                <CardDescription className="text-base mt-2 text-gray-600">
                  Crie sua conta para começar a explorar e colecionar carimbos exclusivos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-8 pb-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gradient-to-br from-ms-primary-blue/5 to-ms-discovery-teal/5 rounded-xl">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ms-primary-blue/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-ms-primary-blue" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Rotas Exclusivas</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-ms-discovery-teal/5 to-ms-pantanal-green/5 rounded-xl">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ms-discovery-teal/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-ms-discovery-teal" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Selos Temáticos</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-ms-pantanal-green/5 to-ms-secondary-yellow/5 rounded-xl">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ms-pantanal-green/10 flex items-center justify-center">
                      <Compass className="w-5 h-5 text-ms-pantanal-green" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Recompensas</p>
                  </div>
                </div>

                <Link to="/descubrams/register" className="block">
                  <Button className="w-full bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:from-ms-primary-blue/90 hover:to-ms-discovery-teal/90 text-white py-6 rounded-full font-bold text-lg shadow-lg">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Criar Conta Gratuita
                  </Button>
                </Link>
                <Link to="/descubrams/login" className="block">
                  <Button variant="outline" className="w-full border-2 border-ms-primary-blue text-ms-primary-blue py-6 rounded-full font-bold text-lg hover:bg-ms-primary-blue/5">
                    <LogIn className="w-5 h-5 mr-2" />
                    Já tenho conta
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </UniversalLayout>
    );
  }

  return <>{children}</>;
};

export default PassportProfileGate;
