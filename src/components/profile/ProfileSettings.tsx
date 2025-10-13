import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_animal: string;
  avatar_history: string[];
  achievements: string[];
  created_at: string;
  updated_at: string;
}

interface ProfileSettingsProps {
  profile: UserProfile;
  onClose: () => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onClose,
  onProfileUpdate
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para formulários
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmEmail: ''
  });

  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    achievementsPublic: true,
    emailNotifications: true,
    marketingEmails: false
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });

      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (emailData.newEmail !== emailData.confirmEmail) {
      toast({
        title: "Erro",
        description: "Os emails não coincidem.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Email alterado com sucesso! Verifique sua nova caixa de entrada.",
      });

      setShowEmailChange(false);
      setEmailData({ newEmail: '', confirmEmail: '' });
    } catch (error) {
      console.error('Erro ao alterar email:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Deletar perfil do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', profile.id);

      if (profileError) throw profileError;

      // Deletar conta do usuário
      const { error: authError } = await supabase.auth.admin.deleteUser(profile.id);

      if (authError) throw authError;

      toast({
        title: "Conta Excluída",
        description: "Sua conta foi excluída com sucesso.",
      });

      // Redirecionar para login
      window.location.href = '/ms/login';
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/ms/reset-password`
      });

      if (error) throw error;

      toast({
        title: "Email Enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-ms-primary-blue">
            ⚙️ Configurações do Perfil
          </DialogTitle>
          <p className="text-center text-gray-600">
            Gerencie suas informações pessoais e preferências
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'personal', label: 'Pessoal', icon: User },
              { id: 'security', label: 'Segurança', icon: Lock },
              { id: 'privacy', label: 'Privacidade', icon: Shield },
              { id: 'notifications', label: 'Notificações', icon: Bell }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'personal' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-ms-primary-blue" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Membro desde</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-red-600" />
                    Segurança da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Alterar Senha</h4>
                      <p className="text-sm text-gray-600">Atualize sua senha para maior segurança</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setShowPasswordChange(true)}
                    >
                      Alterar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Alterar Email</h4>
                      <p className="text-sm text-gray-600">Atualize seu endereço de email</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setShowEmailChange(true)}
                    >
                      Alterar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Recuperar Senha</h4>
                      <p className="text-sm text-gray-600">Enviar link de recuperação por email</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={handleRecoverPassword}
                    >
                      Enviar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Zona de Perigo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-white">
                    <div>
                      <h4 className="font-semibold text-red-800">Excluir Conta</h4>
                      <p className="text-sm text-red-600">
                        Esta ação é irreversível. Todos os seus dados serão perdidos.
                      </p>
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Configurações de Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Perfil Público</h4>
                    <p className="text-sm text-gray-600">Permitir que outros usuários vejam seu perfil</p>
                  </div>
                  <Switch
                    checked={privacySettings.profilePublic}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({...privacySettings, profilePublic: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Conquistas Públicas</h4>
                    <p className="text-sm text-gray-600">Mostrar suas conquistas para outros usuários</p>
                  </div>
                  <Switch
                    checked={privacySettings.achievementsPublic}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({...privacySettings, achievementsPublic: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-yellow-600" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Notificações por Email</h4>
                    <p className="text-sm text-gray-600">Receber atualizações importantes por email</p>
                  </div>
                  <Switch
                    checked={privacySettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({...privacySettings, emailNotifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Emails de Marketing</h4>
                    <p className="text-sm text-gray-600">Receber ofertas e novidades da plataforma</p>
                  </div>
                  <Switch
                    checked={privacySettings.marketingEmails}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({...privacySettings, marketingEmails: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>

      {/* Modal de Alteração de Senha */}
      {showPasswordChange && (
        <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPasswordChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handlePasswordChange} disabled={loading}>
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Alteração de Email */}
      {showEmailChange && (
        <Dialog open={showEmailChange} onOpenChange={setShowEmailChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">Novo Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmEmail">Confirmar Novo Email</Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  value={emailData.confirmEmail}
                  onChange={(e) => setEmailData({...emailData, confirmEmail: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEmailChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEmailChange} disabled={loading}>
                  {loading ? 'Alterando...' : 'Alterar Email'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-800">Confirmar Exclusão da Conta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">Atenção!</span>
                </div>
                <p className="text-red-700 text-sm">
                  Esta ação é irreversível. Todos os seus dados, conquistas e avatares serão perdidos permanentemente.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                  {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default ProfileSettings;

