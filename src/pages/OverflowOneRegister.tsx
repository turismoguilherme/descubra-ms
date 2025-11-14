import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, Building, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { BUSINESS_CATEGORIES } from '@/services/cadasturService';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';

const OverflowOneRegister: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    password: '',
    confirmPassword: '',
    cnpj: '',
    cadastur: '',
    category: 'hotel'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<string | null>(null);
  
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('OverflowOneRegister: AuthProvider não disponível:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de autenticação...</p>
        </div>
      </div>
    );
  }
  
  const { signUp, signInWithProvider } = auth;
  const { toast } = useToast();
  const navigate = useNavigate();

  // Capturar parâmetros de plano da URL
  useEffect(() => {
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing');
    
    if (plan) {
      setSelectedPlan(plan);
    }
    if (billing) {
      setSelectedBilling(billing);
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    // Formatar CNPJ automaticamente
    if (field === 'cnpj') {
      value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
      if (value.length <= 14) {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    // Validar CNPJ ou CADASTUR (pelo menos um deve ser preenchido)
    const hasCnpj = formData.cnpj && formData.cnpj.replace(/\D/g, '').length === 14;
    const hasCadastur = formData.cadastur && formData.cadastur.length >= 6;
    
    if (!hasCnpj && !hasCadastur) {
      setError('Preencha pelo menos o CNPJ ou CADASTUR.');
      setIsLoading(false);
      return;
    }

    try {
      const { error, data } = await signUp(
        formData.email, 
        formData.password, 
        formData.companyName, 
        formData.contactPerson
      );
      
      if (error) {
        setError(error.message);
      } else {
        // Salvar dados temporários no localStorage para escolha de plano
        localStorage.setItem('registration_data', JSON.stringify({
          cnpj: formData.cnpj,
          cadastur: formData.cadastur,
          category: formData.category,
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          selectedPlan: selectedPlan,
          selectedBilling: selectedBilling
        }));
        
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: selectedPlan ? `Plano ${selectedPlan} pré-selecionado! Agora faça o pagamento.` : "Agora escolha seu plano e faça o pagamento.",
        });
        
        // Redirecionar para escolha de plano (com plano pré-selecionado se houver)
        // Redirecionar baseado no contexto (MS ou ViaJAR)
        const currentPath = window.location.pathname;
        if (currentPath.includes('/ms/')) {
          navigate('/ms');
        } else {
          const pricingUrl = selectedPlan ? `/viajar/pricing?plan=${selectedPlan}&billing=${selectedBilling}` : '/viajar/pricing';
          navigate(pricingUrl);
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithProvider('google');
      // Após login com Google, redirecionar baseado no contexto
      const currentPath = window.location.pathname;
      if (currentPath.includes('/ms/')) {
        navigate('/ms');
      } else {
        navigate('/viajar/onboarding');
      }
    } catch (err) {
      setError('Erro ao fazer cadastro com Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">Comece seu teste</span>
              <span className="text-cyan-300"> grátis</span>
            </h1>
            <p className="text-lg text-blue-100 mb-4 max-w-2xl mx-auto">
              14 dias grátis • Sem cartão de crédito • Cancele quando quiser
            </p>
            <p className="text-sm text-blue-200">
              Transforme seu negócio turístico com inteligência artificial
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <div className="max-w-md mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Criar Conta Empresarial</CardTitle>
            {selectedPlan && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <span className="font-semibold">Plano Selecionado:</span>
                  <span className="capitalize font-bold">{selectedPlan}</span>
                  {selectedBilling && (
                    <span className="text-blue-600">
                      ({selectedBilling === 'annual' ? 'Anual' : 'Mensal'})
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Este plano será ativado após o pagamento
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome da Empresa */}
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  <Building className="inline h-4 w-4 mr-2" />
                  Nome da Empresa *
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Hotel Exemplo Ltda"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cnpj">
                  CNPJ *
                </Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  maxLength={18}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Será usado para verificação CADASTUR
                </p>
              </div>

              {/* Categoria de Negócio */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoria do Negócio *
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pessoa de Contato */}
              <div className="space-y-2">
                <Label htmlFor="contactPerson">
                  <User className="inline h-4 w-4 mr-2" />
                  Seu Nome *
                </Label>
                <Input
                  id="contactPerson"
                  type="text"
                  placeholder="João Silva"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Corporativo *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com.br"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Confirmar Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full gap-2" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta e Continuar'}
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Cadastrar com Google
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/viajar/login" className="text-blue-600 hover:underline font-semibold">
                Fazer Login
              </Link>
            </div>

            {/* Terms */}
            <p className="mt-4 text-xs text-center text-gray-500">
              Ao criar uma conta, você concorda com nossos{' '}
              <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a>
              {' '}e{' '}
              <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
            </p>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3 text-center">O que você ganha:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              ✅ 14 dias de teste grátis (sem cartão)
            </li>
            <li className="flex items-center gap-2">
              ✅ Acesso a todas as funcionalidades
            </li>
            <li className="flex items-center gap-2">
              ✅ Suporte especializado
            </li>
            <li className="flex items-center gap-2">
              ✅ Cancele quando quiser
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OverflowOneRegister;