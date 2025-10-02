// Guatá Diagnostic Dashboard - Temporariamente simplificado
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const GuataDiagnosticDashboard = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Diagnóstico Guatá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <p className="text-lg font-medium mb-2">Sistema em Manutenção</p>
            <p className="text-sm">O dashboard de diagnóstico está temporariamente indisponível.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuataDiagnosticDashboard;
