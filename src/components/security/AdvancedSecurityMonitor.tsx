import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Lock, 
  Eye, 
  RefreshCw,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SecurityThreat {
  type: 'brute_force' | 'credential_stuffing' | 'account_takeover' | 'privilege_escalation';
  confidence: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  indicators: string[];
  timestamp: Date;
}

interface SuspiciousActivity {
  suspicious: boolean;
  patterns: string[];
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export const AdvancedSecurityMonitor: React.FC = () => {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivity | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    totalThreats: 0,
    activeThreats: 0,
    suspiciousPatterns: 0,
    securityScore: 100
  });
  const { toast } = useToast();

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  const startMonitoring = async () => {
    setIsMonitoring(true);
    await checkSecurity();
    
    // Check every 30 seconds
    const interval = setInterval(async () => {
      await checkSecurity();
    }, 30000);

    // Clean up on unmount
    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const checkSecurity = async () => {
    try {
      // Check for advanced threats
      const advancedThreats = await enhancedSecurityService.detectAdvancedThreats();
      
      // Check for suspicious activity
      const suspiciousActivityData = await enhancedSecurityService.detectSuspiciousActivity();
      
      // Process threats with timestamps
      const processedThreats = advancedThreats.threats.map(threat => ({
        ...threat,
        timestamp: new Date()
      }));
      
      // Process suspicious activity
      const processedSuspicious = {
        ...suspiciousActivityData,
        timestamp: new Date()
      };

      setThreats(processedThreats);
      setSuspiciousActivity(processedSuspicious);
      setLastUpdate(new Date());

      // Calculate security score
      let securityScore = 100;
      const highThreats = processedThreats.filter(t => t.severity === 'high').length;
      const mediumThreats = processedThreats.filter(t => t.severity === 'medium').length;
      const lowThreats = processedThreats.filter(t => t.severity === 'low').length;

      securityScore -= (highThreats * 30) + (mediumThreats * 15) + (lowThreats * 5);
      
      if (processedSuspicious.suspicious) {
        securityScore -= processedSuspicious.severity === 'high' ? 20 : 
                         processedSuspicious.severity === 'medium' ? 10 : 5;
      }

      securityScore = Math.max(0, securityScore);

      setStats({
        totalThreats: processedThreats.length,
        activeThreats: processedThreats.filter(t => t.severity === 'high').length,
        suspiciousPatterns: processedSuspicious.suspicious ? processedSuspicious.patterns.length : 0,
        securityScore
      });

      // Alert for high-severity threats
      if (highThreats > 0) {
        toast({
          title: "Ameaça de Segurança Detectada",
          description: `${highThreats} ameaça(s) de alta severidade detectada(s)`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Security monitoring error:', error);
      toast({
        title: "Erro no Monitoramento",
        description: "Falha ao verificar status de segurança",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'brute_force':
        return <Lock className="w-4 h-4" />;
      case 'credential_stuffing':
        return <Users className="w-4 h-4" />;
      case 'account_takeover':
        return <AlertTriangle className="w-4 h-4" />;
      case 'privilege_escalation':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Score de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(stats.securityScore)}`}>
              {stats.securityScore}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isMonitoring ? 'Monitorando' : 'Pausado'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ameaças Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalThreats}</div>
            <div className="flex items-center gap-2 mt-1">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {stats.activeThreats} ativa(s)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Padrões Suspeitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspiciousPatterns}</div>
            <div className="flex items-center gap-2 mt-1">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Detectados
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {lastUpdate.toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={checkSecurity}
                disabled={!isMonitoring}
              >
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Monitoring Tabs */}
      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="threats">Ameaças Detectadas</TabsTrigger>
          <TabsTrigger value="suspicious">Atividade Suspeita</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Ameaças Avançadas Detectadas
              </CardTitle>
              <CardDescription>
                Análise automática de padrões de ataque e tentativas de invasão
              </CardDescription>
            </CardHeader>
            <CardContent>
              {threats.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-700 mb-2">
                    Nenhuma Ameaça Detectada
                  </h3>
                  <p className="text-gray-600">
                    O sistema está operando com segurança normal
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {threats.map((threat, index) => (
                    <Alert key={index} className="border-l-4 border-l-red-500">
                      <div className="flex items-start gap-3">
                        {getThreatIcon(threat.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{threat.description}</h4>
                            <Badge className={getSeverityColor(threat.severity)}>
                              {threat.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(threat.confidence * 100)}% confiança
                            </Badge>
                          </div>
                          <AlertDescription>
                            <ul className="list-disc list-inside space-y-1">
                              {threat.indicators.map((indicator, i) => (
                                <li key={i} className="text-sm">{indicator}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                          <div className="text-xs text-gray-500 mt-2">
                            Detectado em: {threat.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Atividade Suspeita
              </CardTitle>
              <CardDescription>
                Monitoramento de padrões anômalos de comportamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!suspiciousActivity || !suspiciousActivity.suspicious ? (
                <div className="text-center py-8">
                  <Activity className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">
                    Atividade Normal
                  </h3>
                  <p className="text-gray-600">
                    Nenhum padrão suspeito detectado no momento
                  </p>
                </div>
              ) : (
                <Alert className="border-l-4 border-l-yellow-500">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <strong>Padrões Suspeitos Detectados</strong>
                        <Badge className={getSeverityColor(suspiciousActivity.severity)}>
                          {suspiciousActivity.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {suspiciousActivity.patterns.map((pattern, i) => (
                          <li key={i} className="text-sm">{pattern}</li>
                        ))}
                      </ul>
                      <div className="text-xs text-gray-500 mt-2">
                        Detectado em: {suspiciousActivity.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Status do Monitoramento
              </CardTitle>
              <CardDescription>
                Controle e configuração do sistema de monitoramento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Sistema de Monitoramento</span>
                  <Badge variant={isMonitoring ? "default" : "secondary"}>
                    {isMonitoring ? "ATIVO" : "INATIVO"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Última verificação</span>
                  <span className="text-sm">{lastUpdate.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Frequência de verificação</span>
                  <span className="text-sm">A cada 30 segundos</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Detecção de ameaças</span>
                  <span className="text-sm">Habilitada</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Análise de padrões</span>
                  <span className="text-sm">Habilitada</span>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    onClick={checkSecurity}
                    disabled={!isMonitoring}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verificar Segurança Agora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSecurityMonitor;