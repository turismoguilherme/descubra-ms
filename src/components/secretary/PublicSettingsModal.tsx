// @ts-nocheck
/**
 * Settings Modal Component para Setor Público
 * Modal completo de configurações com abas: Perfil, Segurança, Notificações, Privacidade
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import CardBox from '@/components/ui/CardBox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Lock,
  Mail,
  Bell,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Trash2,
  Settings,
  Building2,
  FileText
} from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';

interface PublicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PublicSettingsModal: React.FC<PublicSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para Perfil
  const [profileData, setProfileData] = useState({
    fullName: userProfile?.full_name || '',
    organizationName: userProfile?.business_name || '',
    phone: userProfile?.phone || '',
    department: '',
  });

  // Estados para Segurança
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
  });

  // Estados para Notificações
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    updates: true,
    security: true,
  });

  // Estados para Privacidade
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showEmail: false,
    showPhone: false,
    analytics: true,
    cookies: true,
  });

  // Estados para Termo de Consentimento
  const [consentData, setConsentData] = useState<any>(null);
  const [loadingConsent, setLoadingConsent] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (isOpen && userProfile) {
      setProfileData({
        fullName: userProfile.full_name || '',
        organizationName: userProfile.business_name || '',
        phone: userProfile.phone || '',
        department: '',
      });
    }
  }, [isOpen, userProfile]);

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'consent', label: 'Termo de Consentimento', icon: FileText },
  ];

  // Carregar dados de consentimento
  const loadConsentData = async () => {
    if (!user?.id) {
      setLoadingConsent(false);
      setConsentData(null);
      return;
    }
    
    try {
      setLoadingConsent(true);
      const { data, error } = await supabase
        .from('data_sharing_consents')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar consentimento:', error);
      }
      
      setConsentData(data || null);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar consentimento:', err);
      setConsentData(null);
    } finally {
      setLoadingConsent(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.id && activeTab === 'consent') {
      loadConsentData();
    }
  }, [isOpen, user?.id, activeTab]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileData.fullName,
          business_name: profileData.organizationName,
          phone: profileData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao atualizar perfil:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao atualizar perfil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    // Verificar senha atual
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword,
      });

      if (signInError) {
        toast({
          title: 'Erro',
          description: 'Senha atual incorreta',
          variant: 'destructive',
        });
        return;
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: 'Erro ao verificar senha atual',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ser diferente da senha atual',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso',
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao alterar senha:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao alterar senha',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      toast({
        title: 'Erro',
        description: 'Email não encontrado',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao enviar email de recuperação:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao enviar email de recuperação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!emailData.newEmail || !emailData.newEmail.includes('@')) {
      toast({
        title: 'Erro',
        description: 'Email inválido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Email alterado com sucesso. Verifique sua caixa de entrada para confirmar.',
      });

      setEmailData({ newEmail: '' });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao alterar email:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao alterar email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'EXCLUIR') {
      toast({
        title: 'Erro',
        description: 'Digite EXCLUIR para confirmar',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (signOut) {
        await signOut();
      }

      toast({
        title: 'Conta excluída',
        description: 'Sua conta foi excluída com sucesso',
      });

      onClose();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao excluir conta:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao excluir conta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações do Perfil</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="organizationName">Nome da Organização</Label>
                  <Input
                    id="organizationName"
                    value={profileData.organizationName}
                    onChange={(e) => setProfileData({ ...profileData, organizationName: e.target.value })}
                    placeholder="Nome da secretaria/prefeitura"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Departamento/Setor</Label>
                  <Input
                    id="department"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    placeholder="Ex: Secretaria de Turismo"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={isLoading} className="mt-4">
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Alterar Senha</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Senha Atual *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Nova senha (mínimo 6 caracteres)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirme a nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleForgotPassword} 
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Esqueci minha senha
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Alterar Email</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentEmail">Email Atual</Label>
                  <Input id="currentEmail" value={user?.email || ''} disabled />
                  <p className="text-xs text-slate-500 mt-1">
                    Um email de confirmação será enviado para o novo endereço
                  </p>
                </div>
                <div>
                  <Label htmlFor="newEmail">Novo Email *</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData({ newEmail: e.target.value })}
                    placeholder="novo@email.com"
                  />
                  {emailData.newEmail && !emailData.newEmail.includes('@') && (
                    <p className="text-xs text-red-500 mt-1">Email inválido</p>
                  )}
                </div>
              </div>
              <Button onClick={handleChangeEmail} disabled={isLoading || !emailData.newEmail || !emailData.newEmail.includes('@')} className="mt-4">
                {isLoading ? 'Alterando...' : 'Alterar Email'}
              </Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Preferências de Notificação</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-slate-500">Receba atualizações importantes por email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-slate-500">Receba notificações no navegador</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Atualizações do Sistema</Label>
                    <p className="text-sm text-slate-500">Receba notificações sobre novas funcionalidades</p>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, updates: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Segurança</Label>
                    <p className="text-sm text-slate-500">Receba alertas sobre atividades de segurança</p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, security: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing e Promoções</Label>
                    <p className="text-sm text-slate-500">Receba ofertas e novidades</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  toast({
                    title: 'Sucesso',
                    description: 'Preferências de notificação salvas',
                  });
                }}
                className="mt-4"
              >
                Salvar Preferências
              </Button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Configurações de Privacidade</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Perfil Público</Label>
                    <p className="text-sm text-slate-500">Tornar seu perfil visível publicamente</p>
                  </div>
                  <Switch
                    checked={privacy.profilePublic}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, profilePublic: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar Email</Label>
                    <p className="text-sm text-slate-500">Exibir seu email no perfil</p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar Telefone</Label>
                    <p className="text-sm text-slate-500">Exibir seu telefone no perfil</p>
                  </div>
                  <Switch
                    checked={privacy.showPhone}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showPhone: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-sm text-slate-500">Permitir coleta de dados de uso</p>
                  </div>
                  <Switch
                    checked={privacy.analytics}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, analytics: checked })}
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  toast({
                    title: 'Sucesso',
                    description: 'Configurações de privacidade salvas',
                  });
                }}
                className="mt-4"
              >
                Salvar Configurações
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Zona de Perigo</h3>
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
                            disabled={isLoading || deleteConfirm !== 'EXCLUIR'}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isLoading ? 'Excluindo...' : 'Excluir Conta'}
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

      case 'consent':
        return (
          <div className="space-y-6">
            {loadingConsent ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando...</p>
              </div>
            ) : (
              <>
                {consentData?.consent_given && !consentData?.revoked_at ? (
                  <CardBox className="border-green-200 bg-green-50">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 mb-2">Consentimento Ativo</h4>
                        <p className="text-sm text-green-800 mb-2">
                          <strong>Data de aceitação:</strong>{' '}
                          {consentData.consent_date 
                            ? new Date(consentData.consent_date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'data não disponível'}
                        </p>
                        <p className="text-sm text-green-700 mb-4">
                          <strong>Versão do termo:</strong> {consentData.consent_version || '1.0'}
                        </p>
                        {consentData.data_types_shared && consentData.data_types_shared.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-green-900 mb-2">Tipos de dados compartilhados:</p>
                            <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                              {consentData.data_types_shared.map((type: string) => (
                                <li key={type} className="capitalize">{type}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowConsentDialog(true)}
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Termo Completo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBox>
                ) : (
                  <CardBox className="border-yellow-200 bg-yellow-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-2">Consentimento Não Dado</h4>
                        <p className="text-sm text-yellow-800 mb-4">
                          Você ainda não aceitou o termo de consentimento para compartilhamento de dados para benchmarking.
                          {consentData?.revoked_at && (
                            <span className="block mt-2">
                              Consentimento revogado em{' '}
                              {new Date(consentData.revoked_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </p>
                        <Button
                          onClick={() => setShowConsentDialog(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver e Aceitar Termo
                        </Button>
                      </div>
                    </div>
                  </CardBox>
                )}

                <CardBox>
                  <h4 className="font-semibold text-slate-800 mb-3">Informações sobre o Termo</h4>
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>
                      O termo de consentimento autoriza o compartilhamento de dados agregados e anonimizados 
                      para fins de benchmarking e comparação com outras organizações do setor turístico.
                    </p>
                    <p>
                      <strong>Importante:</strong> A ViaJAR é uma plataforma nova e em constante evolução. 
                      Podem ocorrer erros técnicos ou inconsistências nos processos de agregação e análise de dados.
                    </p>
                    <p>
                      Você pode revisar o termo completo a qualquer momento e revogar seu consentimento 
                      através desta página.
                    </p>
                  </div>
                </CardBox>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da Conta
          </DialogTitle>
          <DialogDescription>
            Gerencie suas configurações de conta, segurança e preferências
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Sidebar com abas */}
          <div className="w-48 flex-shrink-0 border-r pr-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Conteúdo da aba */}
          <div className="flex-1 overflow-y-auto pr-2">
            {renderTabContent()}
          </div>
        </div>
      </DialogContent>

      {/* Dialog com Termo de Consentimento Completo */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termo de Consentimento para Benchmarking</DialogTitle>
            <DialogDescription>
              {consentData?.consent_date 
                ? `Termo completo aceito em ${new Date(consentData.consent_date).toLocaleDateString('pt-BR')}`
                : 'Leia atentamente os termos antes de dar seu consentimento'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Objetivo</h3>
              <p className="text-slate-600">
                Este termo autoriza o compartilhamento de dados agregados e anonimizados da sua organização
                para fins de benchmarking e comparação com outras organizações do setor turístico.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">1.1. Aviso sobre Plataforma Nova</h3>
              <p className="text-slate-600">
                A ViaJAR é uma plataforma nova e em constante evolução. Podem ocorrer erros técnicos, 
                inconsistências ou melhorias nos processos de agregação e análise de dados. Ao aceitar 
                este termo, você reconhece e aceita que:
              </p>
              <ul className="list-disc list-inside ml-4 text-slate-600 mt-2">
                <li>A plataforma pode cometer erros no processamento de dados</li>
                <li>Os dados compartilhados são agregados e anonimizados</li>
                <li>Você aceita compartilhar seus dados mesmo com essas limitações</li>
                <li>A plataforma se compromete a corrigir erros quando identificados</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Dados Compartilhados</h3>
              <p className="text-slate-600">
                Apenas dados agregados e anonimizados serão compartilhados. Nenhum dado individual,
                identificável ou confidencial será divulgado. Os dados são combinados com informações
                de outras organizações para criar estatísticas e médias do mercado.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Finalidade do Compartilhamento</h3>
              <p className="text-slate-600">
                Os dados serão utilizados exclusivamente para:
              </p>
              <ul className="list-disc list-inside ml-4 text-slate-600">
                <li>Comparação de desempenho com o mercado</li>
                <li>Geração de insights e recomendações</li>
                <li>Análise de tendências do setor</li>
                <li>Melhoria dos serviços da plataforma</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Segurança e Privacidade</h3>
              <p className="text-slate-600">
                Todos os dados são tratados de acordo com a LGPD (Lei Geral de Proteção de Dados).
                Implementamos medidas técnicas e organizacionais para garantir a segurança e
                privacidade dos dados compartilhados.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Direitos do Titular (LGPD)</h3>
              <p className="text-slate-600">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside ml-4 text-slate-600">
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar informações sobre como seus dados são utilizados</li>
                <li>Escolher quais tipos de dados compartilhar</li>
                <li>Solicitar exclusão dos dados compartilhados</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">6. Revogação do Consentimento</h3>
              <p className="text-slate-600">
                Você pode revogar seu consentimento a qualquer momento através desta interface.
                Após a revogação, seus dados não serão mais utilizados para novos benchmarks,
                mas dados já agregados podem permanecer em análises históricas.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
              Fechar
            </Button>
            {consentData?.terms_url && (
              <Button
                variant="outline"
                onClick={() => {
                  window.open(consentData.terms_url, '_blank');
                }}
              >
                Ver Termo Completo (PDF)
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default PublicSettingsModal;

