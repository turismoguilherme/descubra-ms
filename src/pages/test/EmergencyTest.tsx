import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, MapPin, Shield } from 'lucide-react';
import { emergencyService } from '@/services/emergency/emergencyService';
import { EmergencyResponse, EmergencyContact } from '@/services/emergency/emergencyTypes';

const EmergencyTest = () => {
  const [location, setLocation] = useState('Bonito, MS');
  const [results, setResults] = useState<EmergencyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Testando sistema de emergência para: ${location}`);
      
      const alerts = await emergencyService.getActiveAlerts(location);
      const contacts = await emergencyService.getEmergencyContacts(location);
      const recommendations = await emergencyService.getTouristSafetyRecommendations(location);
      const hasCritical = await emergencyService.hasCriticalAlerts(location);
      
      setResults({
        success: true,
        weather: alerts.weather,
        health: alerts.health,
        safety: alerts.safety,
        contacts: contacts,
        message: `Teste concluído para ${location}`
      });
      
      console.log('✅ Resultados do teste:', {
        alerts: alerts,
        contacts: contacts,
        recommendations: recommendations,
        hasCritical: hasCritical
      });
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setError('Erro ao buscar alertas de emergência');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'police': return '👮';
      case 'fire': return '🚒';
      case 'ambulance': return '🚑';
      case 'hospital': return '🏥';
      case 'tourism_support': return 'ℹ️';
      case 'pharmacy': return '💊';
      default: return '📞';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚨 Teste do Sistema de Emergência
          </h1>
          <p className="text-gray-600">
            Teste o sistema de alertas e contatos de emergência do Guatá
          </p>
        </div>

        {/* Controles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuração do Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Localização para Teste
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Bonito, MS"
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? '🔍 Buscando...' : '🚨 Testar Alertas'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Erro: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {results && (
          <div className="space-y-6">
            {/* Alertas Meteorológicos */}
            {results.weather && results.weather.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🌤️ Alertas Meteorológicos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.weather.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{alert.description}</h3>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Tipo:</strong> {alert.type}
                          </div>
                          <div>
                            <strong>Válido até:</strong> {new Date(alert.validUntil).toLocaleString()}
                          </div>
                          {alert.temperature && (
                            <div>
                              <strong>Temperatura:</strong> {alert.temperature.min}°C - {alert.temperature.max}°C
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <strong>Recomendações:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {alert.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alertas de Saúde */}
            {results.health && results.health.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🏥 Alertas de Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.health.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{alert.description}</h3>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Tipo:</strong> {alert.type}
                          </div>
                          {alert.affectedPopulation && (
                            <div>
                              <strong>População afetada:</strong> {alert.affectedPopulation}
                            </div>
                          )}
                        </div>
                        {alert.prevention && alert.prevention.length > 0 && (
                          <div className="mt-3">
                            <strong>Prevenção:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {alert.prevention.map((prev, index) => (
                                <li key={index} className="text-sm">{prev}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alertas de Segurança */}
            {results.safety && results.safety.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🛡️ Alertas de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.safety.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4 bg-orange-50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{alert.description}</h3>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Tipo:</strong> {alert.type}
                          </div>
                          <div>
                            <strong>Áreas afetadas:</strong> {alert.affectedAreas.join(', ')}
                          </div>
                        </div>
                        <div className="mt-3">
                          <strong>Recomendações:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {alert.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contatos de Emergência */}
            {results.contacts && results.contacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📞 Contatos de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.contacts.map((contact) => (
                      <div key={contact.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getCategoryIcon(contact.category)}</span>
                          <div>
                            <h3 className="font-semibold">{contact.name}</h3>
                            <p className="text-sm text-gray-600">{contact.description}</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span className="font-medium">{contact.phone}</span>
                          </div>
                          {contact.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{contact.address}</span>
                            </div>
                          )}
                          {contact.available24h && (
                            <Badge className="bg-green-500">24h</Badge>
                          )}
                          {contact.languages && contact.languages.length > 0 && (
                            <div className="text-xs text-gray-500">
                              Idiomas: {contact.languages.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações de Debug */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">🔧 Informações de Debug</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div><strong>Localização testada:</strong> {location}</div>
                  <div><strong>Alertas meteorológicos:</strong> {results.weather?.length || 0}</div>
                  <div><strong>Alertas de saúde:</strong> {results.health?.length || 0}</div>
                  <div><strong>Alertas de segurança:</strong> {results.safety?.length || 0}</div>
                  <div><strong>Contatos encontrados:</strong> {results.contacts?.length || 0}</div>
                  <div><strong>Status:</strong> {results.success ? '✅ Sucesso' : '❌ Erro'}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyTest; 