/**
 * Modal de Configurações do Atendente
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Bell, Globe } from 'lucide-react';

interface AttendantSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AttendantSettingsModal: React.FC<AttendantSettingsModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implementar salvamento de configurações
      toast({
        title: 'Configurações salvas',
        description: 'Suas preferências foram atualizadas com sucesso.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Gerencie suas preferências e configurações pessoais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seção Perfil */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <User className="h-5 w-5 text-blue-600" />
              Perfil
            </div>
            <div className="space-y-3 pl-7">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  defaultValue={user?.user_metadata?.full_name || user?.email || ''}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  defaultValue={user?.email || ''}
                  disabled
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Seção Preferências */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Globe className="h-5 w-5 text-blue-600" />
              Preferências
            </div>
            <div className="space-y-3 pl-7">
              <div>
                <Label htmlFor="language">Idioma</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select defaultValue="America/Campo_Grande">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Campo_Grande">Campo Grande (GMT-4)</SelectItem>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Seção Notificações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Bell className="h-5 w-5 text-blue-600" />
              Notificações
            </div>
            <div className="space-y-3 pl-7">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-checkin">Notificações de Check-in</Label>
                  <p className="text-sm text-slate-500">Receber lembretes para fazer check-in</p>
                </div>
                <input
                  type="checkbox"
                  id="notify-checkin"
                  defaultChecked
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-reports">Relatórios Diários</Label>
                  <p className="text-sm text-slate-500">Receber resumo diário de atividades</p>
                </div>
                <input
                  type="checkbox"
                  id="notify-reports"
                  defaultChecked
                  className="rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendantSettingsModal;

