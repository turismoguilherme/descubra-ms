import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import UniversalLayout from '@/components/layout/UniversalLayout';
import PassportDocument from '@/components/passport/PassportDocument';
import PassportProfileGate from '@/components/passport/PassportProfileGate';
import { usePassportWallpaper } from '@/hooks/usePassportWallpaper';

const PassportDigital: React.FC = () => {
  const { routeId: routeIdParam } = useParams<{ routeId?: string }>();
  const location = useLocation();
  const routeIdFromState = (location.state as any)?.routeId;
  const routeId = routeIdParam || routeIdFromState;
  const { wallpaperUrl } = usePassportWallpaper();

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

  // Estilo do fundo: usar wallpaper global se configurado, senão usar gradiente padrão
  const backgroundStyle = wallpaperUrl
    ? {
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {};

  const backgroundClass = wallpaperUrl
    ? 'bg-cover bg-center bg-no-repeat'
    : 'bg-gradient-to-br from-blue-50 via-white to-green-50';

  return (
    <PassportProfileGate>
      <UniversalLayout>
        <main 
          className={`flex-grow ${backgroundClass} py-8`}
          style={backgroundStyle}
        >
          <PassportDocument routeId={routeId} />
        </main>
      </UniversalLayout>
    </PassportProfileGate>
  );
};

export default PassportDigital;

