
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Award, Calendar } from "lucide-react";
import CardHeader from "./CardHeader";
import CardTitle from "./CardTitle";

const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5 text-ms-primary-blue" />
            Visitantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">1,245</p>
          <p className="text-sm text-green-600">+12% da semana passada</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-ms-primary-blue" />
            Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">5,378</p>
          <p className="text-sm text-green-600">+8% da semana passada</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Award className="mr-2 h-5 w-5 text-ms-primary-blue" />
            Selos coletados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">2,890</p>
          <p className="text-sm text-green-600">+15% da semana passada</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-ms-primary-blue" />
            Eventos ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">18</p>
          <p className="text-sm text-blue-600">2 novos esta semana</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
