
import React from 'react';
import { RouteCheckpoint, TouristRoute } from '@/types/passport';
import CheckpointCard from './CheckpointCard';

interface CheckpointsListProps {
  selectedRoute: TouristRoute | null;
  checkpoints: RouteCheckpoint[];
  userLocation: { lat: number; lng: number } | null;
  onCheckIn: (checkpoint: RouteCheckpoint, location: { lat: number; lng: number }) => void;
}

const CheckpointsList: React.FC<CheckpointsListProps> = ({
  selectedRoute,
  checkpoints,
  userLocation,
  onCheckIn,
}) => {
  if (!selectedRoute) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Selecione um roteiro para ver os checkpoints</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{selectedRoute.name}</h2>
        <p className="text-gray-600">{selectedRoute.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {checkpoints.map((checkpoint) => (
          <CheckpointCard
            key={checkpoint.id}
            checkpoint={checkpoint}
            isCompleted={false}
            onCheckIn={onCheckIn}
            userLocation={userLocation}
          />
        ))}
      </div>
    </div>
  );
};

export default CheckpointsList;
