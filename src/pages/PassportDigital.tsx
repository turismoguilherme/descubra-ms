import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import UniversalLayout from '@/components/layout/UniversalLayout';
import PassportDocument from '@/components/passport/PassportDocument';
import PassportProfileGate from '@/components/passport/PassportProfileGate';

const PassportDigital: React.FC = () => {
  const { routeId: routeIdParam } = useParams<{ routeId?: string }>();
  const location = useLocation();
  const routeIdFromState = (location.state as any)?.routeId;
  const routeId = routeIdParam || routeIdFromState;

  // Debug
  React.useEffect(() => {
    console.log('🔍 [PassportDigital] ========== RENDER ==========');
    console.log('🔍 [PassportDigital] Parâmetros e State:', {
      routeIdParam,
      routeIdFromState,
      routeIdFinal: routeId,
      locationState: location.state,
      locationPathname: location.pathname,
    });
  }, [routeIdParam, routeIdFromState, routeId, location.state, location.pathname]);

  return (
    <PassportProfileGate>
      <UniversalLayout>
        <main className="flex-grow bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
          <PassportDocument routeId={routeId} />
        </main>
      </UniversalLayout>
    </PassportProfileGate>
  );
};

export default PassportDigital;

