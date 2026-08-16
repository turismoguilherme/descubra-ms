import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteFormProps {
  route?: unknown;
  userRegion: string;
  onSave: (routeData: unknown) => Promise<void>;
  onCancel: () => void;
}

const RouteForm: React.FC<RouteFormProps> = ({ route, userRegion, onSave, onCancel }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulário de Rota</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Formulário de criação de rotas em desenvolvimento.</p>
        <p className="text-sm text-muted-foreground">Região: {userRegion}</p>
      </CardContent>
    </Card>
  );
};

export default RouteForm;