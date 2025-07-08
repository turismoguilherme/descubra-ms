
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Navigation, 
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react';
import { useCATCheckin } from '@/hooks/useCATCheckin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EnhancedCATCheckinProps {
  assignedCAT?: string;
}

const EnhancedCATCheckin = ({ assignedCAT }: EnhancedCATCheckinProps) => {
  const [showHistory, setShowHistory] = useState(false);
  
  const {
    catLocations,
    selectedCAT,
    setSelectedCAT,
    isCheckingIn,
    checkinHistory,
    todayCheckins,
    locationLoading,
    locationError,
    hasLocation,
    latitude,
    longitude,
    accuracy,
    performCheckin,
    canCheckin
  } = useCATCheckin({ assignedCAT });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-500';
      case 'fora_da_area': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'fora_da_area': return 'Fora da Área';
      default: return 'Erro';
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Principal de Check-in */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-ms-primary-blue" />
              Check-in CAT
            </div>
            {hasLocation && (
              <Badge variant="outline" className="text-green-600">
                <Navigation className="w-3 h-3 mr-1" />
                GPS Ativo
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção do CAT */}
          {!assignedCAT && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Selecione seu CAT
              </label>
              <Select value={selectedCAT} onValueChange={setSelectedCAT}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um CAT" />
                </SelectTrigger>
                <SelectContent>
                  {catLocations.map((location) => (
                    <SelectItem key={location.id} value={location.cat_name}>
                      {location.cat_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status da Localização */}
          {selectedCAT && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Status da Localização</span>
                {locationLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ms-primary-blue"></div>
                )}
              </div>
              
              {locationError ? (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{locationError}</span>
                </div>
              ) : hasLocation ? (
                <div className="space-y-1 text-sm text-green-600">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    <span>Localização obtida com sucesso</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Precisão: {accuracy?.toFixed(0)}m | Coords: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">Aguardando localização...</span>
                </div>
              )}
            </div>
          )}

          {/* Botão de Check-in */}
          <Button 
            onClick={performCheckin}
            disabled={!canCheckin}
            className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90"
            size="lg"
          >
            {isCheckingIn ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando Check-in...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Fazer Check-in
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Check-ins de Hoje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Check-ins de Hoje ({todayCheckins.length})
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Ocultar' : 'Ver'} Histórico
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayCheckins.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhum check-in registrado hoje
            </div>
          ) : (
            <div className="space-y-2">
              {todayCheckins.slice(0, showHistory ? undefined : 3).map((checkin) => (
                <div 
                  key={checkin.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(checkin.status)}`}></div>
                    <div>
                      <div className="font-medium">{checkin.cat_name}</div>
                      <div className="text-sm text-gray-600">
                        {checkin.timestamp && format(new Date(checkin.timestamp), 'HH:mm', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {getStatusText(checkin.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCATCheckin;
