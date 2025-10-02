import React from 'react';
import { 
  MapPin, 
  CheckCircle, 
  Clock, 
  FileText, 
  Star, 
  TrendingUp,
  Users,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InventoryStats as InventoryStatsType } from '@/services/inventory/inventoryService';

interface InventoryStatsProps {
  stats: InventoryStatsType;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total de Itens',
      value: stats.total_items,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Itens cadastrados no inventário'
    },
    {
      title: 'Aprovados',
      value: stats.approved_items,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Itens aprovados e ativos'
    },
    {
      title: 'Pendentes',
      value: stats.pending_items,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Aguardando aprovação'
    },
    {
      title: 'Rascunhos',
      value: stats.draft_items,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      description: 'Em desenvolvimento'
    },
    {
      title: 'Em Destaque',
      value: stats.featured_items,
      icon: Star,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      description: 'Itens em destaque'
    },
    {
      title: 'Categorias',
      value: stats.categories_count,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Categorias disponíveis'
    }
  ];

  const approvalRate = stats.total_items > 0 
    ? Math.round((stats.approved_items / stats.total_items) * 100)
    : 0;

  const featuredRate = stats.total_items > 0 
    ? Math.round((stats.featured_items / stats.total_items) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}

      {/* Additional Stats */}
      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Métricas de Qualidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Approval Rate */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {approvalRate}%
              </div>
              <p className="text-sm text-gray-600 mb-2">Taxa de Aprovação</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${approvalRate}%` }}
                ></div>
              </div>
            </div>

            {/* Featured Rate */}
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600 mb-2">
                {featuredRate}%
              </div>
              <p className="text-sm text-gray-600 mb-2">Taxa de Destaque</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${featuredRate}%` }}
                ></div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {stats.average_rating.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600 mb-2">Avaliação Média</p>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(stats.average_rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Avaliações
                </h4>
                <p className="text-sm text-gray-600">
                  {stats.total_reviews} avaliações recebidas
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {stats.total_reviews}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
