import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PassportDocument from '@/components/passport/PassportDocument';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PassportDigital: React.FC = () => {
  const { routeId: routeIdParam } = useParams<{ routeId?: string }>();
  const location = useLocation();
  const routeIdFromState = (location.state as any)?.routeId;
  const routeId = routeIdParam || routeIdFromState;
  const { user } = useAuth();

  // Debug
  React.useEffect(() => {
    console.log('🔍 [PassportDigital] ========== RENDER ==========');
    console.log('🔍 [PassportDigital] Parâmetros e State:', {
      routeIdParam,
      routeIdFromState,
      routeIdFinal: routeId,
      locationState: location.state,
      locationPathname: location.pathname,
      hasUser: !!user,
      userId: user?.id
    });
  }, [routeIdParam, routeIdFromState, routeId, location.state, location.pathname, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-bold">Acesso Restrito</h1>
            <p className="text-muted-foreground">
              Você precisa fazer login para acessar seu passaporte digital.
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/ms/login">
                <Button>Fazer Login</Button>
              </Link>
              <Link to="/ms/register">
                <Button variant="outline">Criar Conta</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      <main className="flex-grow py-8">
        <PassportDocument routeId={routeId} />
      </main>
      <Footer />
    </div>
  );
};

export default PassportDigital;

