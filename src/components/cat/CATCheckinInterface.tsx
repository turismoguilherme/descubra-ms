
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, CheckCircle, AlertTriangle, Navigation, History } from "lucide-react";
import { useCATCheckin } from '@/hooks/useCATCheckin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CATCheckinInterfaceProps {
  assignedCAT?: string;
  attendantName?: string;
}

const CATCheckinInterface = ({ assignedCAT, attendantName }: CATCheckinInterfaceProps) => {
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

  const getStatusBadge = (status: string) => {
    if (status === 'confirmado') {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmado
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Fora da área
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Card principal de check-in */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-ms-primary-blue" />
            Check-in CAT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção do CAT */}
          <div className="space-y-2">
            <label className="text-sm font-medium">CAT para Check-in</label>
            <Select value={selectedCAT} onValueChange={setSelectedCAT} disabled={!!assignedCAT}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um CAT" />
              </SelectTrigger>
              <SelectContent>
                {catLocations.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {assignedCAT && (
              <p className="text-xs text-gray-500">
                CAT fixo: {assignedCAT}
              </p>
            )}
          </div>

          {/* Status da localização */}
          {locationError && (
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{locationError}</span>
            </div>
          )}

          {hasLocation && latitude && longitude && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <Navigation className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-blue-700">Localização detectada</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
                <div>Lat: {latitude.toFixed(6)}</div>
                <div>Lng: {longitude.toFixed(6)}</div>
              </div>
              {accuracy && (
                <div className="text-xs text-blue-600 mt-1">
                  Precisão: {accuracy.toFixed(0)}m
                </div>
              )}
            </div>
          )}

          {/* Botão de check-in */}
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
            ) : locationLoading ? (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Obtendo localização...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Fazer Check-in
              </>
            )}
          </Button>

          {!canCheckin && !isCheckingIn && !locationLoading && (
            <p className="text-xs text-gray-500 text-center">
              {!selectedCAT ? 'Selecione um CAT para continuar' : 
               !hasLocation ? 'Aguardando localização...' : 
               'Aguarde...'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Check-ins de hoje */}
      {todayCheckins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="w-5 h-5 mr-2" />
              Check-ins de Hoje ({todayCheckins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayCheckins.map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{checkin.cat_name}</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(checkin.timestamp || checkin.checkin_time || ''), 'HH:mm', { locale: ptBR })}
                    </div>
                    {checkin.distance_from_cat && (
                      <div className="text-xs text-gray-500">
                        Distância: {checkin.distance_from_cat}m
                      </div>
                    )}
                  </div>
                  {getStatusBadge(checkin.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico recente */}
      {checkinHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <History className="w-5 h-5 mr-2" />
              Histórico Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkinHistory.slice(0, 5).map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{checkin.cat_name}</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(checkin.timestamp || checkin.checkin_time || ''), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                    {checkin.distance_from_cat && (
                      <div className="text-xs text-gray-500">
                        Distância: {checkin.distance_from_cat}m
                      </div>
                    )}
                  </div>
                  {getStatusBadge(checkin.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CATCheckinInterface;
