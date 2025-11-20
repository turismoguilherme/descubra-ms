import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Mail, Copy, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CATLocation {
  id: string;
  name: string;
  address: string;
  city_id: string;
}

interface Attendant {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  cat_id: string | null;
  status: string;
  created_at: string;
}

export default function AttendantManagement() {
  const [catLocations, setCatLocations] = useState<CATLocation[]>([]);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [newAttendant, setNewAttendant] = useState({
    name: '',
    email: '',
    phone: '',
    cat_id: '',
  });
  const [tempPassword, setTempPassword] = useState('');
  const [createdAttendant, setCreatedAttendant] = useState<Attendant | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCATLocations();
    fetchAttendants();
  }, []);

  const fetchCATLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('attendant_allowed_locations')
        .select('id, name, address, city_id')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCatLocations(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar CATs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de CATs',
        variant: 'destructive',
      });
    }
  };

  const fetchAttendants = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, phone, status, created_at')
        .eq('role', 'atendente')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar associações com CATs
      const attendantsWithCATs = await Promise.all(
        (data || []).map(async (attendant) => {
          const { data: assignment } = await supabase
            .from('attendant_location_assignments')
            .select('location_id')
            .eq('attendant_id', attendant.id)
            .eq('is_active', true)
            .single();

          return {
            ...attendant,
            cat_id: assignment?.location_id || null,
          };
        })
      );

      setAttendants(attendantsWithCATs);
    } catch (error: any) {
      console.error('Erro ao buscar atendentes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de atendentes',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAttendant = async () => {
    if (!newAttendant.name || !newAttendant.email || !newAttendant.cat_id) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, email e CAT',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Obter city_id do CAT selecionado
      const selectedCAT = catLocations.find(cat => cat.id === newAttendant.cat_id);
      if (!selectedCAT) {
        throw new Error('CAT não encontrado');
      }

      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Não autenticado');
      }

      // Chamar edge function para criar atendente
      const { data, error } = await supabase.functions.invoke('create-attendant', {
        body: {
          email: newAttendant.email,
          name: newAttendant.name,
          phone: newAttendant.phone || null,
          cat_id: newAttendant.cat_id,
          city_id: selectedCAT.city_id,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Mostrar credenciais
      setTempPassword(data.temp_password);
      setCreatedAttendant({
        id: data.user.id,
        email: data.user.email,
        full_name: newAttendant.name,
        phone: newAttendant.phone || null,
        cat_id: newAttendant.cat_id,
        status: 'active',
        created_at: new Date().toISOString(),
      });
      setShowCreateDialog(false);
      setShowCredentialsDialog(true);

      // Limpar formulário
      setNewAttendant({
        name: '',
        email: '',
        phone: '',
        cat_id: '',
      });

      // Atualizar lista
      await fetchAttendants();

      toast({
        title: 'Sucesso',
        description: 'Atendente criado com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao criar atendente:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar atendente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência',
    });
  };

  const getCATName = (catId: string | null) => {
    if (!catId) return 'Não atribuído';
    const cat = catLocations.find(c => c.id === catId);
    return cat?.name || 'CAT não encontrado';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Atendentes</CardTitle>
              <CardDescription>
                Cadastre e gerencie atendentes dos CATs
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Atendente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {attendants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum atendente cadastrado ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {attendants.map((attendant) => (
                <Card key={attendant.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{attendant.full_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {attendant.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          CAT: {getCATName(attendant.cat_id)}
                        </div>
                      </div>
                      <Badge variant={attendant.status === 'active' ? 'default' : 'secondary'}>
                        {attendant.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de criação */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Atendente</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para criar um novo atendente. Uma senha temporária será gerada automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={newAttendant.name}
                onChange={(e) => setNewAttendant({ ...newAttendant, name: e.target.value })}
                placeholder="Nome do atendente"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newAttendant.email}
                onChange={(e) => setNewAttendant({ ...newAttendant, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={newAttendant.phone}
                onChange={(e) => setNewAttendant({ ...newAttendant, phone: e.target.value })}
                placeholder="(67) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="cat">CAT *</Label>
              <Select
                value={newAttendant.cat_id}
                onValueChange={(value) => setNewAttendant({ ...newAttendant, cat_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um CAT" />
                </SelectTrigger>
                <SelectContent>
                  {catLocations.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAttendant} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Atendente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de credenciais */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atendente Criado com Sucesso!</DialogTitle>
            <DialogDescription>
              Anote as credenciais abaixo. O atendente será obrigado a trocar a senha no primeiro acesso.
            </DialogDescription>
          </DialogHeader>
          {createdAttendant && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> O atendente precisará trocar a senha no primeiro acesso.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Input value={createdAttendant.email} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(createdAttendant.email)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Senha Temporária</Label>
                  <div className="flex items-center gap-2">
                    <Input value={tempPassword} readOnly type="password" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(tempPassword)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowCredentialsDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

