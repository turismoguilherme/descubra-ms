// InventoryMap - Temporariamente simplificado
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface TourismInventory {
  id: string;
  name: string;
}

interface InventoryMapProps {
  items: TourismInventory[];
  loading: boolean;
  onItemClick: (item: TourismInventory) => void;
}

export const InventoryMap: React.FC<InventoryMapProps> = ({ items }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium mb-2">Mapa de Inventário</p>
          <p className="text-sm">{items?.length || 0} itens cadastrados</p>
          <p className="text-xs mt-2">Visualização de mapa temporariamente indisponível</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryMap;
