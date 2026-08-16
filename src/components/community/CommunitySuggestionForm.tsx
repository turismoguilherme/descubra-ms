import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CommunitySuggestionFormSimple: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Sugestão da Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Formulário de sugestões em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
};

export default CommunitySuggestionFormSimple;