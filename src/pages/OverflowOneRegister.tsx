import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, Building, User, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

// Categorias de negócio (sem depender de cadasturService)
const BUSINESS_CATEGORIES = [
  { id: 'hotel', name: 'Hotel/Pousada' },
  { id: 'agency', name: 'Agência de Turismo' },
  { id: 'transport', name: 'Transportadora Turística' },
  { id: 'event', name: 'Organizadora de Eventos' },
  { id: 'park', name: 'Parque Temático' },
  { id: 'camping', name: 'Acampamento Turístico' },
  { id: 'guide', name: 'Guia de Turismo' },
  { id: 'restaurant', name: 'Restaurante' },
  { id: 'attraction', name: 'Atração Turística' },
  { id: 'other', name: 'Outro' },
];

// Lista de países principais
const COUNTRIES = [
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'AR', name: 'Argentina' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'BO', name: 'Bolívia' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'PE', name: 'Peru' },
  { code: 'MX', name: 'México' },
  { code: 'PT', name: 'Portugal' },
  { code: 'ES', name: 'Espanha' },
  { code: 'FR', name: 'França' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'IT', name: 'Itália' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CA', name: 'Canadá' },
  { code: 'JP', name: 'Japão' },
  { code: 'CN', name: 'China' },
  { code: 'OTHER', name: 'Outro' },
];

const OverflowOneRegister: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'BR', // País (Brasil por padrão)
    cnpj: '', // CNPJ (obrigatório apenas para brasileiros)
    category: 'hotel'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<string | null>(null);
  
  // TODOS os hooks devem ser chamados ANTES de qualquer early return
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('OverflowOneRegister: AuthProvider não disponível:', error);
  }
  
  // Se auth não estiver disponível, mostrar loading (DEPOIS de todos os hooks)
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de autenticação...</p>
        </div>
      </div>
    );
  }
  
  const { signUp } = auth;

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

  // Verificar se é brasileiro
  const isBrazilian = formData.country === 'BR';

  const handleInputChange = (field: string, value: string) => {
    // Formatar CNPJ automaticamente
    if (field === 'cnpj') {
      const digitsOnly = value.replace(/\D/g, ''); // Remove tudo que não é dígito
      
      // Formatar como CNPJ: 00.000.000/0000-00
      if (digitsOnly.length <= 14) {
        value = digitsOnly.replace(/^(\d{2})(\d)/, '$1.$2');
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

    // Validar CNPJ apenas para brasileiros
    if (formData.country === 'BR') {
      const digitsOnly = formData.cnpj.replace(/\D/g, '');
      if (digitsOnly.length !== 14) {
        setError('CNPJ inválido. O CNPJ deve ter 14 dígitos.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const { error, data } = await signUp(
        formData.email, 
        formData.password, 
        formData.companyName, 
        formData.contactPerson
      );
      
      if (error) {
        // Se o erro for "User already registered", sugerir login
        if (error.message?.includes('already registered')) {
          setError('Este email já está cadastrado. Por favor, faça login ou use outro email.');
          // Opcional: redirecionar para login após 2 segundos
          setTimeout(() => {
            navigate('/viajar/login');
          }, 3000);
        } else {
          setError(error.message);
        }
      } else {
        // Salvar dados temporários no localStorage para o onboarding
        localStorage.setItem('registration_data', JSON.stringify({
          country: formData.country,
          cnpj: formData.country === 'BR' ? formData.cnpj : '',
          category: formData.category,
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          selectedPlan: selectedPlan,
          selectedBilling: 'monthly' // ViaJARTur só tem plano mensal
        }));
        
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Agora vamos para o pagamento.",
        });
        
        // Redirecionar para onboarding com plano (vai direto para pagamento)
        const currentPath = window.location.pathname;
        if (currentPath.includes('/descubramatogrossodosul/') || currentPath.includes('/ms/')) {
          navigate('/ms');
        } else {
          // Redirecionar para o onboarding do ViaJAR com plano na URL
          if (selectedPlan) {
            navigate(`/viajar/onboarding?plan=${selectedPlan}&billing=monthly`);
          } else {
            // Se não tem plano, vai para página de preços
            navigate('/viajar/precos');
          }
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Criar Conta</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Comece sua jornada
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Transforme seu negócio turístico com inteligência artificial
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 -mt-10">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
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

              {/* País */}
              <div className="space-y-2">
                <Label htmlFor="country">
                  <Globe className="inline h-4 w-4 mr-2" />
                  País *
                </Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => handleInputChange('country', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CNPJ - Apenas para brasileiros */}
              {isBrazilian && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cnpj">
                      CNPJ *
                    </Label>
                    {import.meta.env.DEV && (
                      <button
                        type="button"
                        onClick={() => {
                          import('@/utils/testCnpj').then(({ DEFAULT_TEST_CNPJ }) => {
                            handleInputChange('cnpj', DEFAULT_TEST_CNPJ);
                          });
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Usar CNPJ de teste
                      </button>
                    )}
                  </div>
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
                    {formData.cnpj.replace(/\D/g, '').length === 14 
                      ? '✓ CNPJ válido (14 dígitos)' 
                      : 'Digite o CNPJ (14 dígitos)'}
                  </p>
                </div>
              )}

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
              ✅ Acesso a todas as funcionalidades
            </li>
            <li className="flex items-center gap-2">
              ✅ Suporte especializado
            </li>
            <li className="flex items-center gap-2">
              ✅ Cancele quando quiser
            </li>
            <li className="flex items-center gap-2">
              ✅ Dashboard personalizado com insights
            </li>
          </ul>
        </div>
      </div>
      </section>
      
      <ViaJARFooter />
    </div>
  );
};

export default OverflowOneRegister;