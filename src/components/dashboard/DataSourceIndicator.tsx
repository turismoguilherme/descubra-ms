/**
 * Data Source Indicator Component
 * Componente para mostrar as fontes de dados ativas
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Globe, Brain, Search } from 'lucide-react';

interface DataSource {
  name: string;
  type: 'free' | 'premium' | 'ai';
  priority: number;
  available: boolean;
  description: string;
  features: string[];
  quality: number;
}

interface DataSourceIndicatorProps {
  dataSources: DataSource[];
  region: string;
  isLoading?: boolean;
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
  dataSources,
  region,
  isLoading = false
}) => {
  const getSourceIcon = (source: DataSource) => {
    switch (source.name) {
      case 'ALUMIA':
        return <Crown className="h-4 w-4" />;
      case 'OpenStreetMap':
        return <Globe className="h-4 w-4" />;
      case 'Google Custom Search':
        return <Search className="h-4 w-4" />;
      case 'IA Generativa':
        return <Brain className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: DataSource) => {
    switch (source.type) {
      case 'premium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'free':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ai':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 0.8) return 'text-green-600';
    if (quality >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Carregando fontes de dados...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Fontes de Dados - {region}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dataSources.map((source, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 ${getSourceColor(source)} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSourceIcon(source)}
                  <span className="font-medium text-sm">{source.name}</span>
                  {source.type === 'premium' && (
                    <Crown className="h-3 w-3 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs">Qualidade:</span>
                  <span className={`text-xs font-medium ${getQualityColor(source.quality)}`}>
                    {Math.round(source.quality * 100)}%
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">{source.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {source.features.slice(0, 3).map((feature, featureIndex) => (
                  <Badge
                    key={featureIndex}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    {feature}
                  </Badge>
                ))}
                {source.features.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    +{source.features.length - 3} mais
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800 font-medium">
              Total de fontes: {dataSources.length}
            </span>
            <span className="text-blue-600">
              {dataSources.filter(s => s.available).length} ativas
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSourceIndicator;
