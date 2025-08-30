import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RouteForm: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulário de Rota</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Formulário de criação de rotas em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
};

export default RouteForm;