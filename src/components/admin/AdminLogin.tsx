import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, Lock, AlertCircle, Sparkles, LayoutDashboard, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import guataLabsLogo from '@/assets/guata-labs-logo.png';

const HIGHLIGHTS = [
  { icon: LayoutDashboard, label: 'Gestão unificada de conteúdos e eventos' },
  { icon: Users, label: 'Parceiros, usuários e permissões em um só lugar' },
  { icon: Sparkles, label: 'Inteligência e automações do Guatá' },
];

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-guata-cream flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl border border-guata-paper bg-card">
        {/* Painel de marca */}
        <aside className="hidden lg:flex flex-col justify-between bg-guata-deep p-10 text-guata-cream">
          <div>
            <img
              src={guataLabsLogo}
              alt="Guatá Labs"
              className="h-14 w-auto object-contain"
              loading="lazy"
            />
            <h2 className="mt-10 text-3xl font-bold leading-tight">
              Painel administrativo
            </h2>
            <p className="mt-3 text-guata-cream/70 text-sm leading-relaxed">
              Centro de controle das plataformas Guatá Labs e Descubra MS.
            </p>
          </div>

          <ul className="space-y-4 mt-10">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-guata-forest">
                  <Icon className="h-4 w-4 text-guata-gold" />
                </span>
                <span className="text-sm text-guata-cream/85">{label}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-xs text-guata-cream/50">
            © {new Date().getFullYear()} Guatá Labs
          </p>
        </aside>

        {/* Formulário */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="lg:hidden mb-8 text-center">
            <img
              src={guataLabsLogo}
              alt="Guatá Labs"
              className="h-12 w-auto object-contain mx-auto"
              loading="lazy"
            />
          </div>

          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-guata-paper px-3 py-1 text-xs font-medium text-guata-forest">
              <Shield className="h-3.5 w-3.5" />
              Acesso restrito
            </span>
            <h1 className="mt-4 text-2xl font-bold text-foreground">Área administrativa</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Guatá Labs &amp; Descubra MS
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md flex items-center gap-2 text-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-guata-forest hover:bg-guata-deep text-guata-cream font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Apenas usuários com permissão de administrador podem acessar.
          </p>
        </div>
      </div>
    </div>
  );
}
