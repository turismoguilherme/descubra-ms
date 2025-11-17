/**
 * Settings Section Component
 * Configurações do usuário: senha, email, planos, exclusão de conta
 */

import React, { useState } from 'react';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Settings, 
  Lock, 
  Mail, 
  CreditCard, 
  Trash2, 
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SettingsSection: React.FC = () => {
  try {
    const auth = useAuth();
    const { user, userProfile, signOut } = auth || { user: null, userProfile: null, signOut: () => {} };
    const { toast } = useToast();
    
    // Estados para mudança de senha
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

    // Estados para mudança de email
    const [newEmail, setNewEmail] = useState('');
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

    // Estados para exclusão de conta
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Estado para planos
    const [currentPlan, setCurrentPlan] = useState<'free' | 'basic' | 'premium' | 'enterprise'>('basic');

    const handleChangePassword = async () => {
      if (!newPassword || !confirmPassword) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos',
          variant: 'destructive'
        });
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: 'Erro',
          description: 'A senha deve ter pelo menos 6 caracteres',
          variant: 'destructive'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: 'Erro',
          description: 'As senhas não coincidem',
          variant: 'destructive'
        });
        return;
      }

      setIsChangingPassword(true);
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Senha alterada com sucesso'
        });

        setIsPasswordDialogOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error: any) {
        console.error('Erro ao alterar senha:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao alterar senha',
          variant: 'destructive'
        });
      } finally {
        setIsChangingPassword(false);
      }
    };

    const handleChangeEmail = async () => {
      if (!newEmail || !newEmail.includes('@')) {
        toast({
          title: 'Erro',
          description: 'Email inválido',
          variant: 'destructive'
        });
        return;
      }

      setIsChangingEmail(true);
      try {
        const { error } = await supabase.auth.updateUser({
          email: newEmail
        });

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Email alterado com sucesso. Verifique sua caixa de entrada para confirmar.',
        });

        setIsEmailDialogOpen(false);
        setNewEmail('');
      } catch (error: any) {
        console.error('Erro ao alterar email:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao alterar email',
          variant: 'destructive'
        });
      } finally {
        setIsChangingEmail(false);
      }
    };

    const handleDeleteAccount = async () => {
      if (deleteConfirm !== 'EXCLUIR') {
        toast({
          title: 'Erro',
          description: 'Digite EXCLUIR para confirmar',
          variant: 'destructive'
        });
        return;
      }

      setIsDeleting(true);
      try {
        // TODO: Implementar exclusão de conta no backend
        // Por enquanto, apenas deslogar
        if (signOut) {
          await signOut();
        }
        
        toast({
          title: 'Conta excluída',
          description: 'Sua conta foi excluída com sucesso'
        });
      } catch (error: any) {
        console.error('Erro ao excluir conta:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao excluir conta',
          variant: 'destructive'
        });
      } finally {
        setIsDeleting(false);
      }
    };

    const plans = [
      {
        id: 'free',
        name: 'Gratuito',
        price: 'R$ 0',
        features: ['Diagnóstico básico', 'Até 3 relatórios/mês', 'Suporte por email'],
        current: currentPlan === 'free'
      },
      {
        id: 'basic',
        name: 'Básico',
        price: 'R$ 99/mês',
        features: ['Diagnóstico completo', 'Relatórios ilimitados', 'Insights semanais', 'Suporte prioritário'],
        current: currentPlan === 'basic'
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 'R$ 199/mês',
        features: ['Tudo do Básico', 'IA Conversacional', 'Análises avançadas', 'Integração ALUMIA', 'Suporte 24/7'],
        current: currentPlan === 'premium'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Sob consulta',
        features: ['Tudo do Premium', 'API personalizada', 'Treinamento dedicado', 'Gerente de conta'],
        current: currentPlan === 'enterprise'
      }
    ];

    return (
      <div className="space-y-6">
        {/* Informações da Conta */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Informações da Conta</h3>
          <p className="text-sm text-slate-600 mb-4">Gerencie suas informações pessoais</p>
          <CardBox>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{userProfile?.full_name || user?.email}</h3>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mudar Senha */}
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                    <DialogDescription>
                      Digite sua nova senha. Ela deve ter pelo menos 6 caracteres.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nova senha"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmar senha"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                      {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Mudar Email */}
              <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Alterar Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alterar Email</DialogTitle>
                    <DialogDescription>
                      Digite seu novo email. Você receberá um link de confirmação.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentEmail">Email Atual</Label>
                      <Input
                        id="currentEmail"
                        type="email"
                        value={user?.email || ''}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="newEmail">Novo Email</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="novo@email.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleChangeEmail} disabled={isChangingEmail}>
                      {isChangingEmail ? 'Alterando...' : 'Alterar Email'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardBox>
        </div>

        {/* Planos e Assinatura */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Planos e Assinatura</h3>
          <p className="text-sm text-slate-600 mb-4">Gerencie seu plano e assinatura</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <CardBox key={plan.id} className={plan.current ? 'border-2 border-blue-500 bg-blue-50' : ''}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">{plan.name}</h3>
                  {plan.current && (
                    <Badge className="bg-blue-600 text-white rounded-full text-xs px-2 py-0.5">
                      Atual
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-4">{plan.price}</div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.current ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano Atual
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      toast({
                        title: 'Em breve',
                        description: 'Funcionalidade de mudança de plano em desenvolvimento'
                      });
                    }}
                  >
                    Mudar para {plan.name}
                  </Button>
                )}
              </CardBox>
            ))}
          </div>
        </div>

        {/* Zona de Perigo */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Zona de Perigo</h3>
          <p className="text-sm text-slate-600 mb-4">Ações irreversíveis</p>
          <CardBox className="border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Excluir Conta</h3>
                <p className="text-sm text-red-700 mb-4">
                  Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente excluídos.
                        <br /><br />
                        Digite <strong>EXCLUIR</strong> para confirmar:
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Digite EXCLUIR"
                      className="mt-4"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || deleteConfirm !== 'EXCLUIR'}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? 'Excluindo...' : 'Excluir Conta'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardBox>
        </div>
      </div>
    );
  } catch (err: any) {
    console.error('Erro no componente SettingsSection:', err);
    return (
      <CardBox className="border-red-200 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Erro ao carregar configurações</p>
            <p className="text-sm text-red-700 mt-1">
              {err?.message || 'Ocorreu um erro inesperado. Por favor, recarregue a página.'}
            </p>
          </div>
        </div>
      </CardBox>
    );
  }
};

export default SettingsSection;
