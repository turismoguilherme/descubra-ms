import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RouteLogger = () => {
  const location = useLocation();
  useEffect(() => {
    console.log('📍 Route change:', location.pathname, location.search, location.hash);
  }, [location.pathname, location.search, location.hash]);
  return null;
};

export default RouteLogger;
