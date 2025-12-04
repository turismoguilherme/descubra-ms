import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, UserPlus, Shield, Activity, Clock, Search,
  MoreVertical, Edit2, Trash2, Key, Eye, CheckCircle,
  XCircle, AlertTriangle, Mail, Phone, Calendar,
  Building2, MapPin, Briefcase, History, LogIn, LogOut,
  FileEdit, Database, Settings, User, Filter, Download
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ROLE_PERMISSIONS } from '../layout/ModernAdminLayout';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  platform: 'viajar' | 'descubra-ms' | 'ambas';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  avatar?: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  resource: string;
  platform: 'viajar' | 'descubra-ms' | 'system';
  ipAddress?: string;
  timestamp: Date;
  status: 'success' | 'error' | 'warning';
}

// Mock data
const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@viajartur.com.br',
    phone: '(67) 99999-1111',
    role: 'admin',
    department: 'Tecnologia',
    platform: 'ambas',
    status: 'active',
    lastLogin: new Date(),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@viajartur.com.br',
    phone: '(67) 99999-2222',
    role: 'financeiro',
    department: 'Financeiro',
    platform: 'viajar',
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@viajartur.com.br',
    role: 'editor',
    department: 'Marketing',
    platform: 'descubra-ms',
    status: 'active',
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@viajartur.com.br',
    role: 'atendente',
    department: 'Atendimento',
    platform: 'ambas',
    status: 'inactive',
    createdAt: new Date('2024-04-05'),
  },
];

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'João Silva',
    action: 'login',
    description: 'Realizou login no sistema',
    resource: 'Autenticação',
    platform: 'system',
    ipAddress: '192.168.1.100',
    timestamp: new Date(),
    status: 'success',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Maria Santos',
    action: 'update',
    description: 'Atualizou relatório financeiro mensal',
    resource: 'Financeiro',
    platform: 'viajar',
    ipAddress: '192.168.1.101',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'success',
  },
  {
    id: '3',
    userId: '3',
    userName: 'Pedro Oliveira',
    action: 'create',
    description: 'Criou novo evento turístico',
    resource: 'Eventos',
    platform: 'descubra-ms',
    ipAddress: '192.168.1.102',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'success',
  },
  {
    id: '4',
    userId: '1',
    userName: 'João Silva',
    action: 'delete',
    description: 'Tentou excluir registro protegido',
    resource: 'Banco de Dados',
    platform: 'system',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'error',
  },
];

const ROLES = [
  { value: 'master_admin', label: 'Master Admin', color: 'bg-purple-100 text-purple-700' },
  { value: 'admin', label: 'Administrador', color: 'bg-red-100 text-red-700' },
  { value: 'tech', label: 'Tecnologia', color: 'bg-blue-100 text-blue-700' },
  { value: 'financeiro', label: 'Financeiro', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rh', label: 'RH', color: 'bg-orange-100 text-orange-700' },
  { value: 'comercial', label: 'Comercial', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'editor', label: 'Editor', color: 'bg-pink-100 text-pink-700' },
  { value: 'atendente', label: 'Atendente', color: 'bg-slate-100 text-slate-700' },
];

const DEPARTMENTS = [
  'Tecnologia',
  'Financeiro',
  'RH',
  'Marketing',
  'Comercial',
  'Atendimento',
  'Operações',
];

export default function TeamManagement() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    platform: 'ambas' as const,
  });

  const filteredMembers = members.filter(member => {
    const matchSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || member.role === filterRole;
    const matchStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
      status: 'active',
      createdAt: new Date(),
    };

    setMembers([member, ...members]);
    setNewMember({ name: '', email: '', phone: '', role: '', department: '', platform: 'ambas' });
    setDialogOpen(false);
    toast({ title: 'Funcionário adicionado com sucesso!' });
  };

  const handleToggleStatus = (memberId: string) => {
    setMembers(members.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: m.status === 'active' ? 'inactive' : 'active'
        };
      }
      return m;
    }));
    toast({ title: 'Status atualizado!' });
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
      setMembers(members.filter(m => m.id !== memberId));
      toast({ title: 'Funcionário removido!' });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = ROLES.find(r => r.value === role);
    return roleConfig ? (
      <Badge className={roleConfig.color}>{roleConfig.label}</Badge>
    ) : (
      <Badge>{role}</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-100 text-slate-700">Inativo</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700">Suspenso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'viajar':
        return <Badge className="bg-blue-100 text-blue-700">ViajARTur</Badge>;
      case 'descubra-ms':
        return <Badge className="bg-emerald-100 text-emerald-700">Descubra MS</Badge>;
      case 'ambas':
        return <Badge className="bg-purple-100 text-purple-700">Ambas</Badge>;
      default:
        return null;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogIn className="h-4 w-4 text-blue-500" />;
      case 'logout': return <LogOut className="h-4 w-4 text-slate-500" />;
      case 'create': return <FileEdit className="h-4 w-4 text-emerald-500" />;
      case 'update': return <Edit2 className="h-4 w-4 text-amber-500" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Equipe</h2>
          <p className="text-slate-500 mt-1">Gerencie funcionários, permissões e acompanhe atividades</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Funcionário</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo membro da equipe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="João Silva"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="joao@empresa.com"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="(67) 99999-9999"
                />
              </div>
              <div>
                <Label>Cargo/Função *</Label>
                <Select 
                  value={newMember.role} 
                  onValueChange={(v) => setNewMember({ ...newMember, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Departamento</Label>
                <Select 
                  value={newMember.department} 
                  onValueChange={(v) => setNewMember({ ...newMember, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Acesso à Plataforma</Label>
                <Select 
                  value={newMember.platform} 
                  onValueChange={(v: any) => setNewMember({ ...newMember, platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viajar">Apenas ViajARTur</SelectItem>
                    <SelectItem value="descubra-ms">Apenas Descubra MS</SelectItem>
                    <SelectItem value="ambas">Ambas as Plataformas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMember} className="bg-emerald-600 hover:bg-emerald-700">
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total</p>
                <p className="text-2xl font-bold text-slate-800">{members.length}</p>
              </div>
              <Users className="h-8 w-8 text-slate-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Ativos</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {members.filter(m => m.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Online Agora</p>
                <p className="text-2xl font-bold text-blue-600">
                  {members.filter(m => m.lastLogin && (Date.now() - m.lastLogin.getTime()) < 3600000).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Ações Hoje</p>
                <p className="text-2xl font-bold text-amber-600">{activityLogs.length}</p>
              </div>
              <History className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="members">Funcionários</TabsTrigger>
          <TabsTrigger value="activity">Auditoria</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>

        {/* Funcionários */}
        <TabsContent value="members">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-slate-800">Membros da Equipe</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full md:w-64"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os cargos</SelectItem>
                      {ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredMembers.map(member => (
                  <div 
                    key={member.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-all",
                      member.status === 'active' 
                        ? "bg-white border-slate-200 hover:border-emerald-200" 
                        : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold",
                        member.status === 'active' 
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
                          : "bg-slate-400"
                      )}>
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{member.name}</span>
                          {getStatusBadge(member.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getRoleBadge(member.role)}
                          {getPlatformBadge(member.platform)}
                          {member.department && (
                            <Badge variant="outline">{member.department}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        {member.lastLogin ? (
                          <>
                            <div className="text-sm text-slate-600">
                              {formatDistanceToNow(member.lastLogin, { locale: ptBR, addSuffix: true })}
                            </div>
                            <div className="text-xs text-slate-400">Último acesso</div>
                          </>
                        ) : (
                          <div className="text-sm text-slate-400">Nunca acessou</div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedMember(member)}
                        >
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleStatus(member.id)}
                        >
                          {member.status === 'active' ? (
                            <XCircle className="h-4 w-4 text-slate-400" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMembers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-600">Nenhum funcionário encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auditoria */}
        <TabsContent value="activity">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-800">Log de Atividades</CardTitle>
                  <CardDescription>Histórico completo de ações dos funcionários</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.map(log => (
                  <div 
                    key={log.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border",
                      log.status === 'success' && "bg-white border-slate-200",
                      log.status === 'error' && "bg-red-50 border-red-100",
                      log.status === 'warning' && "bg-amber-50 border-amber-100"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      log.status === 'success' && "bg-slate-100",
                      log.status === 'error' && "bg-red-100",
                      log.status === 'warning' && "bg-amber-100"
                    )}>
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{log.userName}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-sm text-slate-600">{log.description}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span>{log.resource}</span>
                        {log.platform !== 'system' && (
                          <>
                            <span>•</span>
                            <span>{log.platform === 'viajar' ? 'ViajARTur' : 'Descubra MS'}</span>
                          </>
                        )}
                        {log.ipAddress && (
                          <>
                            <span>•</span>
                            <span>IP: {log.ipAddress}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">
                        {format(log.timestamp, 'HH:mm', { locale: ptBR })}
                      </div>
                      <div className="text-xs text-slate-400">
                        {format(log.timestamp, 'dd/MM', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissões */}
        <TabsContent value="permissions">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Matriz de Permissões</CardTitle>
              <CardDescription>Visualize e configure as permissões por cargo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Cargo</TableHead>
                      <TableHead className="text-center">Dashboard</TableHead>
                      <TableHead className="text-center">Financeiro</TableHead>
                      <TableHead className="text-center">Funcionários</TableHead>
                      <TableHead className="text-center">Conteúdo</TableHead>
                      <TableHead className="text-center">Usuários</TableHead>
                      <TableHead className="text-center">Sistema</TableHead>
                      <TableHead className="text-center">IA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ROLES.map(role => {
                      const permissions = ROLE_PERMISSIONS[role.value] || [];
                      const hasAll = permissions.includes('*');
                      
                      return (
                        <TableRow key={role.value}>
                          <TableCell>
                            <Badge className={role.color}>{role.label}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {(hasAll || permissions.includes('dashboard')) ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {(hasAll || permissions.includes('financial')) ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {(hasAll || permissions.includes('employees')) ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {(hasAll || permissions.includes('content')) ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {(hasAll || permissions.includes('users')) ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {(hasAll || permissions.includes('system')) ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {(hasAll || permissions.includes('ai')) ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

