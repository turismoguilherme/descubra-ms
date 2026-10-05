import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { adminUsersApi, AdminUser, UserPlatform } from '@/components/admin/users/adminUsersApi';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { CreateUserDialog } from '@/components/admin/users/CreateUserDialog';
import { PasswordRevealDialog } from '@/components/admin/users/PasswordRevealDialog';

export default function UsersManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<UserPlatform>('descubra-ms');
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await adminUsersApi.list());
    } catch (e) {
      toast({ title: 'Erro ao carregar usuários', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const byPlatform = useMemo(() => {
    const term = search.toLowerCase();
    const match = (u: AdminUser) =>
      !term || u.email.toLowerCase().includes(term) || (u.full_name ?? '').toLowerCase().includes(term);
    return {
      'descubra-ms': users.filter((u) => u.platform === 'descubra-ms'),
      'guata-labs': users.filter((u) => u.platform === 'guata-labs'),
      filter: (p: UserPlatform) => users.filter((u) => u.platform === p && match(u)),
    };
  }, [users, search]);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      toast({ title: success });
    } catch (e) {
      toast({ title: 'Não foi possível concluir', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleDelete = (u: AdminUser) => {
    if (!confirm(`Excluir permanentemente ${u.full_name || u.email}? Essa ação não pode ser desfeita.`)) return;
    run(async () => { await adminUsersApi.remove(u.user_id); await load(); }, 'Usuário excluído');
  };

  const handleTempPassword = (u: AdminUser) => {
    if (!confirm(`Gerar nova senha para ${u.email}? A senha atual deixará de funcionar.`)) return;
    adminUsersApi.tempPassword(u.user_id)
      .then((password) => setRevealed({ email: u.email, password }))
      .catch((e) => toast({ title: 'Erro', description: (e as Error).message, variant: 'destructive' }));
  };

  const tabLabel = (p: UserPlatform, name: string) => `${name} (${byPlatform[p].length})`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Usuários"
        description="Usuários de cada plataforma: adicione, exclua ou gere uma nova senha de acesso."
        helpText="Contas de administrador principal e a sua própria conta não podem ser excluídas."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as UserPlatform)}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="descubra-ms">{tabLabel('descubra-ms', 'Descubra MS')}</TabsTrigger>
            <TabsTrigger value="guata-labs">{tabLabel('guata-labs', 'Guatá Labs')}</TabsTrigger>
          </TabsList>
          <Button onClick={() => setCreating(true)}><UserPlus className="mr-2 h-4 w-4" /> Adicionar usuário</Button>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent>
            {(['descubra-ms', 'guata-labs'] as UserPlatform[]).map((p) => (
              <TabsContent key={p} value={p} className="mt-0">
                {loading ? (
                  <div className="py-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                  <UsersTable
                    users={byPlatform.filter(p)}
                    currentUserId={user?.id}
                    onResetEmail={(u) => run(() => adminUsersApi.sendResetEmail(u), `E-mail de nova senha enviado para ${u.email}`)}
                    onTempPassword={handleTempPassword}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>
            ))}
          </CardContent>
        </Card>
      </Tabs>

      <CreateUserDialog
        key={tab}
        platform={tab}
        open={creating}
        onOpenChange={setCreating}
        onCreated={(password, email) => { setRevealed({ email, password }); load(); }}
      />
      <PasswordRevealDialog data={revealed} onClose={() => setRevealed(null)} />
    </div>
  );
}
