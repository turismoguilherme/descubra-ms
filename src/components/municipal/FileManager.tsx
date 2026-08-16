import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FileManagerSimple: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Arquivos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Sistema de gerenciamento de arquivos em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
};

export default FileManagerSimple;