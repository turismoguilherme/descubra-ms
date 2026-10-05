import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminUsersApi, ROLE_OPTIONS, UserPlatform } from './adminUsersApi';

interface Props {
  platform: UserPlatform;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (password: string, email: string) => void;
}

export function CreateUserDialog({ platform, open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(ROLE_OPTIONS[platform][0].value);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const { password } = await adminUsersApi.create({ email, fullName, role, platform });
      onCreated(password, email);
      setEmail('');
      setFullName('');
      onOpenChange(false);
    } catch (e) {
      toast({ title: 'Não foi possível criar', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo usuário — {platform === 'guata-labs' ? 'Guatá Labs' : 'Descubra MS'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de usuário</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS[platform].map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">Uma senha temporária será gerada e mostrada após a criação.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={saving || !email.includes('@')}>
            {saving ? 'Criando...' : 'Criar usuário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
