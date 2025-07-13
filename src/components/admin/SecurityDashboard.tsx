import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Eye, AlertTriangle, Users } from "lucide-react";
import SecurityMonitor from "../security/SecurityMonitor";
import EnhancedSecurityMonitor from "../security/EnhancedSecurityMonitor";
import EnhancedSecurityMetrics from "../security/EnhancedSecurityMetrics";
import AuditExportButton from "./AuditExportButton";

const SecurityDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Painel de Segurança Aprimorado</h2>
        <div className="flex gap-2">
          <AuditExportButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status de Segurança
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Aprimorado</div>
            <p className="text-xs text-muted-foreground">
              RLS + Sanitização + Rate Limiting
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monitoramento
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Logs de segurança em tempo real
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <p className="text-xs text-muted-foreground">
              Atividades suspeitas hoje
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Auditoria
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativa</div>
            <p className="text-xs text-muted-foreground">
              Todas as ações são registradas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Métricas Avançadas</TabsTrigger>
          <TabsTrigger value="enhanced">Monitor Aprimorado</TabsTrigger>
          <TabsTrigger value="monitor">Monitor Básico</TabsTrigger>
          <TabsTrigger value="policies">Políticas RLS</TabsTrigger>
          <TabsTrigger value="audit">Auditoria Completa</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics">
          <EnhancedSecurityMetrics />
        </TabsContent>
        
        <TabsContent value="enhanced">
          <EnhancedSecurityMonitor />
        </TabsContent>
        
        <TabsContent value="monitor">
          <SecurityMonitor />
        </TabsContent>
        
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Row Level Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800">Políticas Ativas</h4>
                  <ul className="mt-2 text-sm text-green-700 space-y-1">
                    <li>✓ Perfis de usuário: Acesso restrito ao próprio perfil</li>
                    <li>✓ Funções de usuário: Apenas admins podem gerenciar</li>
                    <li>✓ Parceiros institucionais: Leitura pública, escrita para gestores</li>
                    <li>✓ Check-ins CAT: Apenas gestores e atendentes</li>
                    <li>✓ Logs de auditoria: Apenas administradores</li>
                    <li>✓ Documentos de turismo: Apenas gestores</li>
                    <li>✓ Arquivos da secretaria: Apenas gestores</li>
                    <li>✓ Sugestões de usuários: Autor ou gestores</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Prestação de Contas - Auditoria Completa</CardTitle>
              <AuditExportButton variant="default" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Relatórios de Auditoria</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    O sistema mantém registro completo de todas as ações realizadas:
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• Todos os logins e tentativas de acesso</li>
                    <li>• Alterações em dados do sistema</li>
                    <li>• Criação, edição e exclusão de usuários</li>
                    <li>• Operações administrativas</li>
                    <li>• Acessos a dados sensíveis</li>
                    <li>• Atividades suspeitas de segurança</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-800">Transparência e Prestação de Contas</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Como órgão público, mantemos total transparência nas operações do sistema.
                    Os relatórios podem ser exportados em PDF para prestação de contas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Rate Limiting</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Máximo de 5 tentativas de login falhadas por email em 15 minutos
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Validação de Entrada</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Sanitização automática de inputs e validação de arquivos
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-800">Auditoria e Logs</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Logs de segurança e atividades são mantidos indefinidamente para prestação de contas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
