
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Plug, AlertCircle } from "lucide-react";

const AlumiaConnection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Conexão com API Alumia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-amber-800">Em Desenvolvimento</h3>
            </div>
            <p className="text-amber-700">
              A integração com a API da Alumia está sendo preparada. 
              Os dados externos serão exibidos aqui assim que a conexão for estabelecida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="api-endpoint">Endpoint da API</Label>
              <Input
                id="api-endpoint"
                placeholder="https://api.alumia.com/..."
                disabled
              />
            </div>
            <div>
              <Label htmlFor="api-key">Chave de API</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="••••••••••••••••"
                disabled
              />
            </div>
          </div>

          <Button disabled className="w-full">
            <Plug className="h-4 w-4 mr-2" />
            Conectar com Alumia (Em Breve)
          </Button>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Dados que serão importados:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium">Fluxo Turístico</h5>
                <p className="text-sm text-gray-600">Dados de visitação e movimento turístico</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium">Perfil de Visitantes</h5>
                <p className="text-sm text-gray-600">Demografia e comportamento dos turistas</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium">Sazonalidade</h5>
                <p className="text-sm text-gray-600">Padrões temporais de visitação</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium">Indicadores Econômicos</h5>
                <p className="text-sm text-gray-600">Impacto econômico do turismo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlumiaConnection;
