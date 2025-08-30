import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UserPreferencesSimple: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências do Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Configurações de preferências em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
};

export default UserPreferencesSimple;