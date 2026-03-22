import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, Lock, AlertCircle, FlaskConical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  isViajarTestLoginEnabled,
  VIAJAR_ADMIN_TEST_DISPLAY,
  VIAJAR_TEST_PASSWORD,
} from '@/utils/viajarTestLogin';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { toast } = useToast();
  const testMode = isViajarTestLoginEnabled();

  const runSignIn = async (e: string, p: string) => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn(e, p);

      if (result.error) {
        const errorMessage = result.error.message || 'Credenciais inválidas';
        setError(errorMessage);
        toast({
          title: 'Erro no login',
          description: errorMessage,
          variant: 'destructive',
        });
      } else if (result.data) {
        setTimeout(() => {
          window.location.reload();
        }, 400);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorMessage = error.message || 'Ocorreu um erro inesperado';
      setError(errorMessage);
      toast({
        title: 'Erro no login',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSignIn(email, password);
  };

  const fillAdminTestAndLogin = async () => {
    setEmail(VIAJAR_ADMIN_TEST_DISPLAY.email);
    setPassword(VIAJAR_ADMIN_TEST_DISPLAY.password);
    await runSignIn(VIAJAR_ADMIN_TEST_DISPLAY.email, VIAJAR_ADMIN_TEST_DISPLAY.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Shield className="h-8 w-8 text-gray-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Área Administrativa</h1>
            <p className="text-sm text-gray-500 mt-2">ViajARTur & Descubra MS</p>
          </div>

          {testMode && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <FlaskConical className="h-4 w-4 shrink-0" />
                Login de teste (homologação / dev)
              </div>
              <p className="text-sm mb-2">
                <strong>Email:</strong>{' '}
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">{VIAJAR_ADMIN_TEST_DISPLAY.email}</code>
              </p>
              <p className="text-sm mb-3">
                <strong>Senha:</strong>{' '}
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">{VIAJAR_TEST_PASSWORD}</code>
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-300 bg-white hover:bg-amber-100/50"
                disabled={isLoading}
                onClick={() => void fillAdminTestAndLogin()}
              >
                Entrar como admin de teste
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Apenas usuários com permissão de administrador podem acessar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
