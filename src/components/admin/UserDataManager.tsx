
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Download, Shield, UserX, UserCog, FileLock2, FileWarning, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Mock user data for the component
const mockUsers = [
  {
    id: "1",
    name: "Carlos Silva",
    email: "carlos.silva@gmail.com",
    cpf: "123.456.789-00",
    phone: "(67) 99123-4567",
    status: "active",
    consentStatus: "full",
    lastAccess: "2025-05-10T14:32:10Z",
    registrationDate: "2024-12-05T10:15:22Z",
    dataExports: 1,
    temporaryDisabled: false,
    deletionRequested: false
  },
  {
    id: "2",
    name: "Ana Paula Souza",
    email: "ana.souza@outlook.com",
    cpf: "987.654.321-00",
    phone: "(67) 99876-5432",
    status: "active",
    consentStatus: "partial",
    lastAccess: "2025-05-12T09:47:30Z",
    registrationDate: "2025-01-15T14:22:36Z",
    dataExports: 2,
    temporaryDisabled: false,
    deletionRequested: false
  },
  {
    id: "3",
    name: "Ricardo Oliveira",
    email: "ricardo.oliveira@hotmail.com",
    cpf: "456.789.123-00",
    phone: "(67) 99765-4321",
    status: "inactive",
    consentStatus: "full",
    lastAccess: "2025-04-30T16:22:05Z", 
    registrationDate: "2024-11-22T08:45:12Z",
    dataExports: 0,
    temporaryDisabled: true,
    deletionRequested: false
  },
  {
    id: "4",
    name: "Juliana Santos",
    email: "juliana.santos@gmail.com",
    cpf: "111.222.333-44",
    phone: "(67) 99222-3333",
    status: "pending_deletion",
    consentStatus: "withdrawn",
    lastAccess: "2025-05-01T11:10:45Z",
    registrationDate: "2025-02-03T13:30:25Z",
    dataExports: 3,
    temporaryDisabled: false,
    deletionRequested: true
  },
  {
    id: "5",
    name: "Marcelo Almeida",
    email: "marcelo.almeida@yahoo.com",
    cpf: "555.666.777-88",
    phone: "(67) 99555-6677",
    status: "active",
    consentStatus: "full",
    lastAccess: "2025-05-12T17:05:22Z",
    registrationDate: "2025-03-12T09:15:30Z",
    dataExports: 1,
    temporaryDisabled: false,
    deletionRequested: false
  }
];

const UserDataManager = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [consentFilter, setConsentFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);

  // Format date in Brazilian Portuguese format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cpf.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesConsent = consentFilter === "all" || user.consentStatus === consentFilter;
    
    return matchesSearch && matchesStatus && matchesConsent;
  });

  // Simulate temporary disabling a user account
  const handleTemporaryDisable = (user: any) => {
    setSelectedUser(user);
    setDisableDialogOpen(true);
  };

  const confirmTemporaryDisable = () => {
    setUsers(users.map(u => 
      u.id === selectedUser.id ? { ...u, temporaryDisabled: !u.temporaryDisabled, status: u.temporaryDisabled ? "active" : "inactive" } : u
    ));
    setDisableDialogOpen(false);
  };

  // Simulate requesting account deletion
  const handleDeleteRequest = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRequest = () => {
    setUsers(users.map(u => 
      u.id === selectedUser.id ? { ...u, deletionRequested: true, status: "pending_deletion" } : u
    ));
    setDeleteDialogOpen(false);
  };
  
  // Simulate data export for LGPD compliance
  const handleDataExport = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, dataExports: u.dataExports + 1 } : u
    ));
    alert(`Dados do usuário ${userId} foram exportados conforme requisito da LGPD. Em um ambiente de produção, um arquivo seria gerado.`);
  };

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="text-green-600 h-5 w-5" />
            <h2 className="text-lg font-medium">Gerenciador de Dados de Usuários (LGPD)</h2>
          </div>
          
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="requests">Solicitações LGPD</TabsTrigger>
            <TabsTrigger value="consent">Gestão de Consentimento</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-grow max-w-md relative">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="pending_deletion">Pendente Exclusão</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={consentFilter} onValueChange={setConsentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Consentimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os consentimentos</SelectItem>
                  <SelectItem value="full">Completo</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="withdrawn">Revogado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[60vh] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead className="w-[200px]">Nome</TableHead>
                      <TableHead className="w-[180px]">Email</TableHead>
                      <TableHead className="w-[120px]">CPF</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[100px]">Consentimento</TableHead>
                      <TableHead className="w-[140px]">Último Acesso</TableHead>
                      <TableHead className="w-[180px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          Nenhum usuário encontrado para os filtros aplicados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.cpf}</TableCell>
                          <TableCell>
                            <StatusBadge status={user.status} />
                          </TableCell>
                          <TableCell>
                            <ConsentBadge consent={user.consentStatus} />
                          </TableCell>
                          <TableCell>{formatDate(user.lastAccess)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 text-xs"
                                onClick={() => handleDataExport(user.id)}
                              >
                                <Download className="mr-1 h-3 w-3" />
                                Exportar
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant={user.temporaryDisabled ? "default" : "outline"} 
                                className={`h-8 px-2 text-xs ${user.temporaryDisabled ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                                onClick={() => handleTemporaryDisable(user)}
                                disabled={user.status === "pending_deletion"}
                              >
                                <Clock className="mr-1 h-3 w-3" />
                                {user.temporaryDisabled ? "Reativar" : "Suspender"}
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                                onClick={() => handleDeleteRequest(user)}
                                disabled={user.status === "pending_deletion"}
                              >
                                <UserX className="mr-1 h-3 w-3" />
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Protected fields notice */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 flex items-start space-x-2">
            <FileLock2 className="h-5 w-5 flex-shrink-0 text-blue-500" />
            <div>
              <p>
                <strong>Dados Sensíveis Protegidos:</strong> De acordo com a LGPD, 
                dados como CPF e telefone são considerados sensíveis e têm visualização restrita. 
                Os campos de CPF são parcialmente mascarados exceto para usuários com permissão específica.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="requests" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Solicitações LGPD Pendentes</h3>
            
            <div className="space-y-4">
              {users.filter(user => user.deletionRequested).length === 0 ? (
                <p className="text-gray-500">Não há solicitações pendentes.</p>
              ) : (
                users
                  .filter(user => user.deletionRequested)
                  .map(user => (
                    <div key={user.id} className="border rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            Solicitação de exclusão de dados conforme direito previsto na LGPD. 
                            Os dados serão removidos permanentemente após análise e aprovação.
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Adiar</Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => alert("Em um ambiente de produção, esta ação excluiria permanentemente os dados do usuário após confirmação adicional.")}
                          >
                            Aprovar Exclusão
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Registros de Solicitações</h3>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar Relatório
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo de Solicitação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Concluído em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{formatDate("2025-05-10T14:30:00Z")}</TableCell>
                  <TableCell>Carlos Silva</TableCell>
                  <TableCell>Exportação de Dados</TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-800">Concluído</Badge></TableCell>
                  <TableCell>{formatDate("2025-05-10T14:35:22Z")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{formatDate("2025-05-05T09:15:00Z")}</TableCell>
                  <TableCell>Ana Paula Souza</TableCell>
                  <TableCell>Atualização de Dados</TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-800">Concluído</Badge></TableCell>
                  <TableCell>{formatDate("2025-05-05T09:20:15Z")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{formatDate("2025-04-28T16:45:00Z")}</TableCell>
                  <TableCell>Ricardo Oliveira</TableCell>
                  <TableCell>Desativação Temporária</TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-800">Concluído</Badge></TableCell>
                  <TableCell>{formatDate("2025-04-28T16:50:30Z")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{formatDate("2025-05-01T11:00:00Z")}</TableCell>
                  <TableCell>Juliana Santos</TableCell>
                  <TableCell>Exclusão de Conta</TableCell>
                  <TableCell><Badge className="bg-amber-100 text-amber-800">Pendente</Badge></TableCell>
                  <TableCell>—</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        <TabsContent value="consent" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Políticas de Consentimento</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <h4 className="font-medium">Política de Privacidade</h4>
                  <p className="text-sm text-gray-600">Versão atual: 2.1 (Atualizada em 10/04/2025)</p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <h4 className="font-medium">Termos de Uso</h4>
                  <p className="text-sm text-gray-600">Versão atual: 3.0 (Atualizada em 15/03/2025)</p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <h4 className="font-medium">Política de Cookies</h4>
                  <p className="text-sm text-gray-600">Versão atual: 1.5 (Atualizada em 20/02/2025)</p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Configurações LGPD</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="retention">Período de retenção de dados pessoais</Label>
                  <p className="text-sm text-gray-500">Quanto tempo os dados dos usuários são mantidos após inatividade</p>
                </div>
                <Select defaultValue="24">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                    <SelectItem value="36">36 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Anonimização automática</Label>
                  <p className="text-sm text-gray-500">Anonimizar automaticamente dados de usuários inativos</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificação de violação</Label>
                  <p className="text-sm text-gray-500">Alertas automáticos em caso de acesso não autorizado</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registro de consentimento</Label>
                  <p className="text-sm text-gray-500">Armazenar logs de consentimento do usuário</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for Temporary Account Disable/Enable */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser?.temporaryDisabled ? "Reativar Conta" : "Suspender Conta Temporariamente"}</DialogTitle>
            <DialogDescription>
              {selectedUser?.temporaryDisabled 
                ? "A conta será reativada e o usuário poderá acessar o sistema novamente." 
                : "A conta será suspensa temporariamente. O usuário não poderá fazer login, mas os dados serão preservados."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500">
              {selectedUser?.temporaryDisabled
                ? "Confirma a reativação da conta de:"
                : "Confirma a suspensão temporária da conta de:"}
            </p>
            <p className="font-medium mt-1">{selectedUser?.name} ({selectedUser?.email})</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>Cancelar</Button>
            <Button 
              variant={selectedUser?.temporaryDisabled ? "default" : "secondary"}
              onClick={confirmTemporaryDisable}
            >
              {selectedUser?.temporaryDisabled ? "Reativar Conta" : "Suspender Conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Account Deletion Request */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Exclusão de Conta</DialogTitle>
            <DialogDescription>
              Esta ação irá iniciar o processo de exclusão de conta conforme LGPD. 
              Os dados serão marcados para exclusão e serão processados em até 30 dias.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500">
              A exclusão afetará todos os dados associados ao usuário:
            </p>
            <p className="font-medium mt-1">{selectedUser?.name} ({selectedUser?.email})</p>
            
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              <FileWarning className="h-4 w-4 inline mr-2 text-red-600" />
              <span>Esta operação não pode ser desfeita uma vez aprovada pelo administrador.</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDeleteRequest}>
              Confirmar Solicitação de Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for status badges
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>;
    case "inactive":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Inativo</Badge>;
    case "pending_deletion":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Pend. Exclusão</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// Helper component for consent badges
const ConsentBadge = ({ consent }: { consent: string }) => {
  switch (consent) {
    case "full":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completo</Badge>;
    case "partial":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Parcial</Badge>;
    case "withdrawn":
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Revogado</Badge>;
    default:
      return <Badge>{consent}</Badge>;
  }
};

export default UserDataManager;
