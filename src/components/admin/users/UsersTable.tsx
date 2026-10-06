import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KeyRound, Mail, MoreHorizontal, Trash2 } from 'lucide-react';
import { AdminUser, roleLabel } from './adminUsersApi';

interface Props {
  users: AdminUser[];
  currentUserId?: string;
  onResetEmail: (u: AdminUser) => void;
  onTempPassword: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
}

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—');

export function UsersTable({ users, currentUserId, onResetEmail, onTempPassword, onDelete }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Cadastro</TableHead>
          <TableHead>Último acesso</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Nenhum usuário encontrado</TableCell>
          </TableRow>
        ) : (
          users.map((u) => {
            const canDelete = !u.protectedAccount && u.user_id !== currentUserId;
            return (
              <TableRow key={u.user_id}>
                <TableCell className="font-medium">
                  {u.full_name || '—'}
                  {u.partner_name && <div className="text-xs font-normal text-muted-foreground">{u.partner_name}</div>}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.kind === 'partner' ? 'default' : u.kind === 'staff' ? 'secondary' : 'outline'}>
                    {u.kind === 'partner' ? 'Parceiro' : roleLabel(u.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.blocked ? 'secondary' : 'default'}>{u.blocked ? 'Bloqueado' : 'Ativo'}</Badge>
                </TableCell>
                <TableCell>{fmt(u.created_at)}</TableCell>
                <TableCell>{fmt(u.last_sign_in_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label="Ações"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onResetEmail(u)}>
                        <Mail className="mr-2 h-4 w-4" /> Enviar e-mail de nova senha
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTempPassword(u)}>
                        <KeyRound className="mr-2 h-4 w-4" /> Gerar senha temporária
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!canDelete}
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(u)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir usuário
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
