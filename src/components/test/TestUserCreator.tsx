import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOverflowOneAuth } from '@/hooks/useOverflowOneAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, UserPlus, Mail, Lock } from 'lucide-react';

const TestUserCreator: React.FC = () => {
  const [email, setEmail] = useState('teste@viajar.com');
  const [password, setPassword] = useState('123456');
  const [companyName, setCompanyName] = useState('Empresa Teste ViaJAR');
  const [contactPerson, setContactPerson] = useState('João Silva');
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  
  const { signUp, signIn } = useOverflowOneAuth();
  const { toast } = useToast();

  const handleCreateTestUser = async () => {
    try {
      setIsCreating(true);
      
      // First, try to sign in (in case user already exists)
      console.log("🔄 Tentando fazer login primeiro...");
      const { error: signInError } = await signIn(email, password);
      
      if (!signInError) {
        // Login successful
        toast({
          title: "✅ Login realizado com sucesso!",
          description: "Usuário de teste encontrado e logado!",
        });
        setCreated(true);
        return;
      }
      
      // If login failed, try to create user
      console.log("🔄 Login falhou, tentando criar usuário...");
      const { error: signUpError } = await signUp(email, password, companyName, contactPerson);
      
      if (signUpError) {
        // If user already exists, try to sign in again
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
          console.log("🔄 Usuário já existe, tentando login novamente...");
          
          const { error: retrySignInError } = await signIn(email, password);
          
          if (retrySignInError) {
            console.error("❌ Erro no login:", retrySignInError);
            toast({
              title: "⚠️ Erro no Login",
              description: "Usuário existe mas não foi possível fazer login. Tente usar as credenciais diretamente no formulário de login.",
              variant: "destructive",
            });
            return;
          }
          
          toast({
            title: "✅ Usuário de teste encontrado!",
            description: "Login realizado com sucesso! Você já pode usar o sistema.",
          });
          setCreated(true);
          return;
        } else {
          throw signUpError;
        }
      } else {
        toast({
          title: "✅ Usuário de teste criado!",
          description: "Conta criada e login realizado com sucesso!",
        });
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

  if (created) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Usuário de Teste Pronto!
          </h3>
          <p className="text-green-700 mb-4">
            Você pode agora acessar todas as funcionalidades do sistema.
          </p>
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Credenciais de acesso:</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Senha:</strong> {password}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Criar Usuário de Teste</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="test-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            placeholder="teste@viajar.com"
          />
          </div>
        </div>
        
        <div>
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="test-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            placeholder="123456"
          />
          </div>
        </div>
        
        <div>
          <Label htmlFor="company">Nome da Empresa</Label>
          <Input
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Empresa Teste ViaJAR"
          />
        </div>
        
        <div>
          <Label htmlFor="contact">Pessoa de Contato</Label>
          <Input
            id="contact"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="João Silva"
          />
        </div>
        
        <Button 
          onClick={handleCreateTestUser}
          disabled={isCreating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isCreating ? 'Criando...' : 'Criar Usuário de Teste'}
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          <p>Este usuário será usado para testar todas as funcionalidades do sistema.</p>
          <p>Se o usuário já existir, será feito login automaticamente.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestUserCreator;
