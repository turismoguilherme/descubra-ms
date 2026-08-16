
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, Download, Shield, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Mock data for admin access logs with IP addresses
const mockAccessLogs = [
  {
    id: 1,
    userId: "admin@fundtur.ms.gov.br",
    role: "admin",
    timestamp: "2025-05-13T08:23:15Z",
    action: "login",
    ipAddress: "177.54.148.125",
    location: "Campo Grande, MS",
    device: "Windows / Chrome"
  },
  {
    id: 2,
    userId: "gestor_bonito@fundtur.ms.gov.br",
    role: "gestor",
    timestamp: "2025-05-13T09:15:42Z",
    action: "view_dashboard",
    ipAddress: "189.126.72.45",
    location: "Bonito, MS",
    device: "macOS / Safari"
  },
  {
    id: 3,
    userId: "atendente_bonito@cat.ms.gov.br",
    role: "atendente",
    timestamp: "2025-05-13T10:32:18Z",
    action: "update_cat_info",
    ipAddress: "200.217.89.6",
    location: "Bonito, MS",
    device: "Android / Chrome"
  },
  {
    id: 4,
    userId: "tech@fundtur.ms.gov.br",
    role: "tech",
    timestamp: "2025-05-13T11:47:33Z",
    action: "user_data_export",
    ipAddress: "177.54.148.129",
    location: "Campo Grande, MS",
    device: "Windows / Firefox"
  },
  {
    id: 5,
    userId: "admin@fundtur.ms.gov.br",
    role: "admin",
    timestamp: "2025-05-13T12:05:21Z",
    action: "system_settings_change",
    ipAddress: "177.54.148.125",
    location: "Campo Grande, MS",
    device: "Windows / Chrome"
  }
];

const AccessLogs = () => {
  const [logs, setLogs] = useState(mockAccessLogs);
  const [filter, setFilter] = useState("all");

  // Format date in Brazilian Portuguese format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm:ss", { locale: pt });
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    return log.role === filter;
  });

  // Simulate fetching new logs
  const refreshLogs = () => {
    // In production, this would fetch logs from the database
    const newLog = {
      id: logs.length + 1,
      userId: `user${Math.floor(Math.random() * 1000)}@fundtur.ms.gov.br`,
      role: ["admin", "gestor", "atendente", "tech"][Math.floor(Math.random() * 4)],
      timestamp: new Date().toISOString(),
      action: ["login", "logout", "view_dashboard", "update_cat_info", "system_settings_change"][Math.floor(Math.random() * 5)],
      ipAddress: `177.54.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: ["Campo Grande, MS", "Bonito, MS", "Corumbá, MS"][Math.floor(Math.random() * 3)],
      device: ["Windows / Chrome", "macOS / Safari", "Android / Chrome"][Math.floor(Math.random() * 3)]
    };
    
    setLogs([newLog, ...logs]);
  };

  // Simulate exporting logs
  const downloadLogs = () => {
    // In production, this would generate a CSV file for download
    alert("Exportação de registros de acesso iniciada");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="text-blue-600 h-5 w-5" />
          <h2 className="text-lg font-medium">Registros de Acesso (LGPD)</h2>
        </div>
        
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="tech">Técnicos</SelectItem>
              <SelectItem value="gestor">Gestores</SelectItem>
              <SelectItem value="atendente">Atendentes</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={refreshLogs}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          
          <Button variant="outline" size="sm" onClick={downloadLogs}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[50vh] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead className="w-[200px]">Usuário</TableHead>
                  <TableHead className="w-[100px]">Perfil</TableHead>
                  <TableHead className="w-[200px]">Data/Hora</TableHead>
                  <TableHead className="w-[150px]">Ação</TableHead>
                  <TableHead className="w-[150px]">Endereço IP</TableHead>
                  <TableHead className="w-[150px]">Localização</TableHead>
                  <TableHead className="w-[150px]">Dispositivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      Nenhum registro de acesso encontrado para o filtro aplicado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.userId}</TableCell>
                      <TableCell>
                        <RoleBadge role={log.role} />
                      </TableCell>
                      <TableCell>{formatDate(log.timestamp)}</TableCell>
                      <TableCell>
                        <ActionBadge action={log.action} />
                      </TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>{log.location}</TableCell>
                      <TableCell>{log.device}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800 flex items-start space-x-2">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
        <div>
          <p>
            <strong>Aviso LGPD:</strong> Esses registros são mantidos para fins de segurança e auditoria, 
            conforme previsto na Lei Geral de Proteção de Dados (LGPD). 
            Os dados são armazenados em conformidade com as políticas de retenção e acesso restrito.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper component for role badges
const RoleBadge = ({ role }: { role: string }) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Administrador</Badge>;
    case "tech":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Técnico</Badge>;
    case "gestor":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Gestor</Badge>;
    case "atendente":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Atendente</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
};

// Helper component for action badges
const ActionBadge = ({ action }: { action: string }) => {
  switch (action) {
    case "login":
      return <Badge variant="outline" className="border-green-500 text-green-600">Login</Badge>;
    case "logout":
      return <Badge variant="outline" className="border-gray-500 text-gray-600">Logout</Badge>;
    case "view_dashboard":
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Visualização</Badge>;
    case "update_cat_info":
      return <Badge variant="outline" className="border-amber-500 text-amber-600">Atualização CAT</Badge>;
    case "user_data_export":
      return <Badge variant="outline" className="border-red-500 text-red-600">Exportação de Dados</Badge>;
    case "system_settings_change":
      return <Badge variant="outline" className="border-purple-500 text-purple-600">Alteração de Config.</Badge>;
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
};

export default AccessLogs;
