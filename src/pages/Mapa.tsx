
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Construction } from "lucide-react";

const Mapa = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <MapPin className="w-6 h-6 text-ms-primary-blue" />
              Mapa Interativo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Construction className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Funcionalidade em Desenvolvimento
            </h3>
            <p className="text-gray-600">
              O mapa interativo dos CATs está sendo desenvolvido e estará disponível em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Mapa;
