
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Fingerprint, Shield, AlertTriangle, CheckCircle, FileText, 
  Download, FileCheck, Clock, FileWarning
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const PrivacyComplianceCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Format date in Brazilian Portuguese format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium">Central de Conformidade LGPD</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentação</TabsTrigger>
          <TabsTrigger value="data-map">Mapeamento de Dados</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Conformidade LGPD</CardTitle>
                <CardDescription>Estado atual de conformidade com a LGPD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Nível de Conformidade</span>
                      <span className="text-sm font-medium text-green-600">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <ComplianceItem
                      title="Política de Privacidade" 
                      status="compliant" 
                      details="Última atualização: 10/04/2025"
                    />
                    <ComplianceItem
                      title="Termos de Uso" 
                      status="compliant" 
                      details="Última atualização: 15/03/2025"
                    />
                    <ComplianceItem
                      title="Registro de Consentimento" 
                      status="compliant" 
                      details="Implementado e monitorado"
                    />
                    <ComplianceItem
                      title="Segurança de Dados" 
                      status="attention" 
                      details="Revisão pendente - Audit Log"
                    />
                    <ComplianceItem
                      title="Notificação de Violação" 
                      status="compliant" 
                      details="Processo implementado"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Solicitações LGPD</CardTitle>
                <CardDescription>Resumo das solicitações recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded border border-blue-100 text-center">
                    <p className="text-2xl font-bold text-blue-700">24</p>
                    <p className="text-sm text-blue-600">Acessos aos Dados</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-100 text-center">
                    <p className="text-2xl font-bold text-green-700">18</p>
                    <p className="text-sm text-green-600">Atualizações</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded border border-amber-100 text-center">
                    <p className="text-2xl font-bold text-amber-700">3</p>
                    <p className="text-sm text-amber-600">Exclusões</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-gray-700">7</p>
                    <p className="text-sm text-gray-600">Opt-out</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <RequestItem 
                    date="2025-05-12T14:22:10Z" 
                    type="access" 
                    status="completed" 
                    user="Carlos Silva" 
                  />
                  <RequestItem 
                    date="2025-05-11T09:36:45Z" 
                    type="update" 
                    status="completed" 
                    user="Ana Paula Souza" 
                  />
                  <RequestItem 
                    date="2025-05-10T16:15:30Z" 
                    type="deletion" 
                    status="pending" 
                    user="Juliana Santos" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ações Pendentes LGPD</CardTitle>
              <CardDescription>Tarefas que precisam de atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Tarefa</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[150px]">Prioridade</TableHead>
                    <TableHead className="w-[150px]">Data Limite</TableHead>
                    <TableHead className="w-[120px]">Responsável</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Revisar logs de auditoria</TableCell>
                    <TableCell>Verificar registros de acesso aos dados e conformidade</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800">Média</Badge>
                    </TableCell>
                    <TableCell>{formatDate("2025-05-25T23:59:59Z")}</TableCell>
                    <TableCell>Tech</TableCell>
                    <TableCell>
                      <Badge variant="outline">Pendente</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Processar solicitações de exclusão</TableCell>
                    <TableCell>Revisar e processar as solicitações pendentes de exclusão de dados</TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">Alta</Badge>
                    </TableCell>
                    <TableCell>{formatDate("2025-05-18T23:59:59Z")}</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>
                      <Badge variant="outline">Pendente</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Atualizar cookies</TableCell>
                    <TableCell>Revisar e atualizar a política de cookies do sistema</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Baixa</Badge>
                    </TableCell>
                    <TableCell>{formatDate("2025-06-15T23:59:59Z")}</TableCell>
                    <TableCell>Tech</TableCell>
                    <TableCell>
                      <Badge variant="outline">Pendente</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos LGPD</CardTitle>
              <CardDescription>
                Documentos de conformidade legal e políticas de privacidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentCard 
                    title="Política de Privacidade"
                    description="Detalhes sobre como os dados pessoais são coletados e processados"
                    lastUpdated="2025-04-10T15:30:00Z"
                    version="2.1"
                  />
                  <DocumentCard 
                    title="Termos de Uso"
                    description="Termos e condições gerais de uso do sistema"
                    lastUpdated="2025-03-15T10:45:00Z"
                    version="3.0"
                  />
                  <DocumentCard 
                    title="Política de Cookies"
                    description="Como o aplicativo usa cookies e tecnologias similares"
                    lastUpdated="2025-02-20T09:30:00Z"
                    version="1.5"
                  />
                  <DocumentCard 
                    title="Procedimento de Violação de Dados"
                    description="Protocolo de resposta a incidentes e violações de dados"
                    lastUpdated="2025-01-25T14:20:00Z"
                    version="2.0"
                  />
                  <DocumentCard 
                    title="Direitos do Usuário (LGPD)"
                    description="Guia sobre direitos dos usuários conforme LGPD"
                    lastUpdated="2025-03-05T16:15:00Z"
                    version="1.2"
                  />
                  <DocumentCard 
                    title="Relatório de Impacto (DPIA)"
                    description="Análise de impacto sobre proteção de dados pessoais"
                    lastUpdated="2025-01-10T11:40:00Z"
                    version="1.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data-map">
          <Card>
            <CardHeader>
              <CardTitle>Mapeamento de Dados</CardTitle>
              <CardDescription>
                Categorização e fluxo de dados pessoais no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Categoria</TableHead>
                        <TableHead>Dados Coletados</TableHead>
                        <TableHead className="w-[150px]">Finalidade</TableHead>
                        <TableHead className="w-[120px]">Retenção</TableHead>
                        <TableHead className="w-[120px]">Base Legal</TableHead>
                        <TableHead className="w-[100px]">Sensível</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Identificação</TableCell>
                        <TableCell>Nome, e-mail, CPF</TableCell>
                        <TableCell>Autenticação</TableCell>
                        <TableCell>24 meses</TableCell>
                        <TableCell>Consentimento</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">Sim</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Contato</TableCell>
                        <TableCell>Telefone, endereço</TableCell>
                        <TableCell>Comunicação</TableCell>
                        <TableCell>24 meses</TableCell>
                        <TableCell>Consentimento</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">Sim</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Preferências</TableCell>
                        <TableCell>Destinos favoritos, interesses</TableCell>
                        <TableCell>Personalização</TableCell>
                        <TableCell>12 meses</TableCell>
                        <TableCell>Interesse legítimo</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Não</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Geolocalização</TableCell>
                        <TableCell>Coordenadas GPS</TableCell>
                        <TableCell>Recomendações locais</TableCell>
                        <TableCell>3 meses</TableCell>
                        <TableCell>Consentimento</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">Sim</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Comportamento</TableCell>
                        <TableCell>Histórico de pesquisas, cliques</TableCell>
                        <TableCell>Analytics</TableCell>
                        <TableCell>6 meses</TableCell>
                        <TableCell>Interesse legítimo</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Não</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Fluxo de Dados Pessoais
                  </h3>
                  <p className="text-sm text-blue-700 mb-2">
                    O sistema segue um fluxo seguro de dados conforme as diretrizes da LGPD:
                  </p>
                  <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1 pl-2">
                    <li>Coleta inicial com consentimento claro e específico</li>
                    <li>Armazenamento em banco de dados criptografados</li>
                    <li>Processamento apenas para finalidades informadas</li>
                    <li>Compartilhamento restrito e documentado</li>
                    <li>Exclusão após cumprida a finalidade ou prazo de retenção</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Auditoria</CardTitle>
              <CardDescription>
                Registros de atividades relacionadas a dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border p-2">
                <div className="space-y-4">
                  <AuditEntry 
                    timestamp="2025-05-13T08:30:22Z"
                    user="admin@fundtur.ms.gov.br"
                    action="Exportação de dados de usuário"
                    details="Exportou dados completos do usuário carlos.silva@gmail.com conforme solicitação LGPD-2025-042"
                    severity="medium"
                  />
                  <AuditEntry 
                    timestamp="2025-05-13T09:15:35Z"
                    user="admin@fundtur.ms.gov.br"
                    action="Alteração nas políticas de privacidade"
                    details="Atualizou a versão da Política de Privacidade para 2.1"
                    severity="high"
                  />
                  <AuditEntry 
                    timestamp="2025-05-12T14:22:18Z"
                    user="tech@fundtur.ms.gov.br"
                    action="Processamento de solicitação de exclusão"
                    details="Iniciou o processo de exclusão para o usuário juliana.santos@gmail.com"
                    severity="high"
                  />
                  <AuditEntry 
                    timestamp="2025-05-12T11:05:47Z"
                    user="sistema"
                    action="Alerta de segurança"
                    details="Múltiplas tentativas de acesso mal sucedidas para a conta admin@fundtur.ms.gov.br"
                    severity="critical"
                  />
                  <AuditEntry 
                    timestamp="2025-05-11T16:37:29Z"
                    user="gestor_bonito@fundtur.ms.gov.br"
                    action="Visualização de dados pessoais"
                    details="Acessou informações de usuários na região de Bonito"
                    severity="medium"
                  />
                  <AuditEntry 
                    timestamp="2025-05-11T09:48:12Z"
                    user="tech@fundtur.ms.gov.br"
                    action="Atualização de dados de usuário"
                    details="Atualizou informações de contato para o usuário ana.souza@outlook.com"
                    severity="medium"
                  />
                  <AuditEntry 
                    timestamp="2025-05-10T15:22:50Z"
                    user="sistema"
                    action="Anonimização de dados"
                    details="Processo automático de anonimização para 5 contas inativas por mais de 24 meses"
                    severity="high"
                  />
                  <AuditEntry 
                    timestamp="2025-05-10T10:14:36Z"
                    user="atendente_bonito@cat.ms.gov.br"
                    action="Acesso a dados turísticos"
                    details="Visualizou dados estatísticos de visitação para região de Bonito"
                    severity="low"
                  />
                  <AuditEntry 
                    timestamp="2025-05-09T14:05:18Z"
                    user="admin@fundtur.ms.gov.br"
                    action="Backup de dados"
                    details="Iniciou backup criptografado do banco de dados do sistema"
                    severity="medium"
                  />
                  <AuditEntry 
                    timestamp="2025-05-09T09:32:24Z"
                    user="gestor_pantanal@fundtur.ms.gov.br"
                    action="Geração de relatório"
                    details="Gerou relatório anônimo de visitas para região do Pantanal"
                    severity="low"
                  />
                </div>
              </ScrollArea>
              <div className="flex justify-between mt-4">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Logs
                  </Button>
                  <Button variant="outline" size="sm">
                    Filtrar
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Logs de auditoria são mantidos por 5 anos conforme política de segurança
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for compliance items
const ComplianceItem = ({ 
  title, 
  status, 
  details 
}: { 
  title: string;
  status: "compliant" | "attention" | "noncompliant";
  details: string;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {status === "compliant" && (
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
        )}
        {status === "attention" && (
          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
        )}
        {status === "noncompliant" && (
          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
        )}
        <span className="text-sm">{title}</span>
      </div>
      <span className="text-xs text-gray-500">{details}</span>
    </div>
  );
};

// Helper component for request items
const RequestItem = ({ 
  date, 
  type, 
  status, 
  user 
}: { 
  date: string;
  type: "access" | "update" | "deletion" | "optout";
  status: "completed" | "pending";
  user: string;
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: pt });
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center">
        {type === "access" && <FileText className="h-4 w-4 text-blue-500 mr-2" />}
        {type === "update" && <FileCheck className="h-4 w-4 text-green-500 mr-2" />}
        {type === "deletion" && <FileWarning className="h-4 w-4 text-red-500 mr-2" />}
        {type === "optout" && <Clock className="h-4 w-4 text-gray-500 mr-2" />}
        <span className="truncate max-w-[150px]">{user}</span>
      </div>
      <div className="flex items-center">
        <span className="text-gray-500 mr-2">{formatDate(date)}</span>
        {status === "completed" ? (
          <Badge className="bg-green-100 text-green-800 text-xs">Concluído</Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-800 text-xs">Pendente</Badge>
        )}
      </div>
    </div>
  );
};

// Helper component for document cards
const DocumentCard = ({ 
  title, 
  description, 
  lastUpdated, 
  version 
}: { 
  title: string;
  description: string;
  lastUpdated: string;
  version: string;
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: pt });
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <p className="text-xs text-gray-500 mt-2">
            Versão {version} • Atualizado em {formatDate(lastUpdated)}
          </p>
        </div>
        <div className="flex space-x-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <FileText className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper component for audit entries
const AuditEntry = ({ 
  timestamp, 
  user, 
  action, 
  details, 
  severity 
}: { 
  timestamp: string;
  user: string;
  action: string;
  details: string;
  severity: "low" | "medium" | "high" | "critical";
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", { locale: pt });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Baixa</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800">Média</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">Alta</Badge>;
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Crítica</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-start">
        <p className="font-medium">{action}</p>
        {getSeverityBadge(severity)}
      </div>
      <p className="text-sm text-gray-600 mt-1">{details}</p>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <p>{formatDate(timestamp)}</p>
        <p>{user}</p>
      </div>
    </div>
  );
};

export default PrivacyComplianceCenter;
