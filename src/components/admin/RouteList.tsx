
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Users, Clock, MapPin } from "lucide-react";
import { TouristRoute } from "@/types/passport";

interface RouteListProps {
  routes: TouristRoute[];
  loading: boolean;
  onEdit: (route: TouristRoute) => void;
  onDelete: (routeId: string) => void;
}

const RouteList = ({ routes, loading, onEdit, onDelete }: RouteListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum roteiro encontrado
          </h3>
          <p className="text-gray-500">
            Comece criando seu primeiro roteiro turístico.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "facil": return "bg-green-100 text-green-800";
      case "medio": return "bg-yellow-100 text-yellow-800";
      case "dificil": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case "facil": return "Fácil";
      case "medio": return "Médio";
      case "dificil": return "Difícil";
      default: return level;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {routes.map((route) => (
        <Card key={route.id} className="relative">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{route.name}</CardTitle>
                <p className="text-sm text-gray-600">{route.region}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => onEdit(route)}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onDelete(route.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-700 line-clamp-2">
              {route.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getDifficultyColor(route.difficulty_level)}>
                {getDifficultyLabel(route.difficulty_level)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {route.estimated_duration}min
              </Badge>
              {route.is_active ? (
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              ) : (
                <Badge variant="outline">Inativo</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {route.total_participants || 0}
                </div>
                <div className="text-xs text-gray-500">Participantes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {route.completion_rate || 0}%
                </div>
                <div className="text-xs text-gray-500">Conclusão</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RouteList;
