
import React from 'react';
import { TouristRoute } from '@/types/passport';
import RouteCard from './RouteCard';

interface RoutesListProps {
  routes: TouristRoute[];
  onStartRoute: (route: TouristRoute) => void;
}

const RoutesList: React.FC<RoutesListProps> = ({ routes, onStartRoute }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {routes.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          onStartRoute={onStartRoute}
          userProgress={0}
        />
      ))}
    </div>
  );
};

export default RoutesList;
