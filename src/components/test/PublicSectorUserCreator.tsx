import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOverflowOneAuth } from '@/hooks/useOverflowOneAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, UserPlus, Mail, Lock, Building, Shield } from 'lucide-react';

interface PublicSectorUser {
  email: string;
  password: string;
  companyName: string;
  contactPerson: string;
  role: string;
}

const PublicSectorUserCreator: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('atendente');
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createdUser, setCreatedUser] = useState<PublicSectorUser | null>(null);
  
  const { signUp, signIn } = useOverflowOneAuth();
  const { toast } = useToast();

  const publicSectorUsers: Record<string, PublicSectorUser> = {
    atendente: {
      email: 'atendente@ms.gov.br',
      password: 'atendente123',
      companyName: 'CAT Mato Grosso do Sul',
      contactPerson: 'Atendente Teste',
      role: 'atendente'
    },
    gestor_municipal: {
      email: 'gestor.municipal@ms.gov.br',
      password: 'gestor123',
      companyName: 'Prefeitura Municipal',
      contactPerson: 'Gestor Municipal Teste',
      role: 'gestor_municipal'
    },
    gestor_regional: {
      email: 'gestor.regional@ms.gov.br',
      password: 'regional123',
      companyName: 'Governo Regional',
      contactPerson: 'Gestor Regional Teste',
      role: 'gestor_regional'
    },
    admin: {
      email: 'admin@ms.gov.br',
      password: 'admin123',
      companyName: 'Governo do Estado MS',
      contactPerson: 'Administrador Teste',
      role: 'admin'
    }
  };

  const handleCreateUser = async () => {
    const user = publicSectorUsers[selectedRole];
    if (!user) return;

    try {
      setIsCreating(true);
      
      // Try to create user first
      console.log(`🔄 Criando usuário ${user.email}...`);
      const { error: signUpError } = await signUp(user.email, user.password, user.companyName, user.contactPerson);
      
      if (signUpError) {
        // If user already exists, try to sign in
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
          console.log("🔄 Usuário já existe, tentando login...");
          
          const { error: signInError } = await signIn(user.email, user.password);
          
          if (signInError) {
            console.error("❌ Erro no login:", signInError);
            toast({
              title: "⚠️ Erro no Login",
              description: "Usuário existe mas não foi possível fazer login. Tente usar as credenciais diretamente.",
              variant: "destructive",
            });
            return;
          }
          
          toast({
            title: "✅ Usuário encontrado!",
            description: "Login realizado com sucesso! Você já pode usar o sistema.",
          });
          setCreatedUser(user);
          setCreated(true);
          return;
        } else {
          throw signUpError;
        }
      } else {
        toast({
          title: "✅ Usuário criado!",
          description: "Conta criada com sucesso! Use as credenciais para fazer login.",
        });
        setCreatedUser(user);
        setCreated(true);
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário de teste:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o usuário de teste.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleInfo = (role: string) => {
    const roleInfo = {
      atendente: {
        title: "Atendente CAT",
        description: "Sistema de ponto, check-in, IA de atendimento",
        icon: <Shield className="h-5 w-5" />,
        color: "text-blue-600"
      },
      gestor_municipal: {
        title: "Gestor Municipal",
        description: "Dashboard municipal, gestão de colaboradores",
        icon: <Building className="h-5 w-5" />,
        color: "text-green-600"
      },
      gestor_regional: {
        title: "Gestor Regional",
        description: "Gestão regional, múltiplas cidades",
        icon: <Building className="h-5 w-5" />,
        color: "text-purple-600"
      },
      admin: {
        title: "Administrador",
        description: "Acesso total ao sistema",
        icon: <Shield className="h-5 w-5" />,
        color: "text-red-600"
      }
    };
    return roleInfo[role as keyof typeof roleInfo] || roleInfo.atendente;
  };

  if (created && createdUser) {
    const roleInfo = getRoleInfo(createdUser.role);
    
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Usuário {roleInfo.title} Criado!
          </h3>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>Email:</strong> {createdUser.email}</p>
            <p><strong>Senha:</strong> {createdUser.password}</p>
            <p><strong>Função:</strong> {roleInfo.description}</p>
          </div>
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Próximos passos:</strong><br />
              1. Use as credenciais acima para fazer login<br />
              2. Acesse as funcionalidades específicas do seu perfil<br />
              3. Teste o sistema de ponto (atendente) ou dashboard (gestor)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentUser = publicSectorUsers[selectedRole];
  const roleInfo = getRoleInfo(selectedRole);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Criar Usuário Setor Público
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Tipo de Usuário</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atendente">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Atendente CAT</span>
                </div>
              </SelectItem>
              <SelectItem value="gestor_municipal">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-green-600" />
                  <span>Gestor Municipal</span>
                </div>
              </SelectItem>
              <SelectItem value="gestor_regional">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-purple-600" />
                  <span>Gestor Regional</span>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <span>Administrador</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentUser && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 mb-2">
              {roleInfo.icon}
              <span className={`font-medium ${roleInfo.color}`}>
                {roleInfo.title}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Senha:</strong> {currentUser.password}</p>
              <p><strong>Função:</strong> {roleInfo.description}</p>
            </div>
          </div>
        )}

        <Button 
          onClick={handleCreateUser} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? (
            "Criando usuário..."
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Usuário de Teste
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublicSectorUserCreator;
