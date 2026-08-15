import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import { loginPathForBrand, type ResetBrand } from '@/lib/passwordReset';

type Status = 'checking' | 'ready' | 'invalid' | 'done';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Tela onde a pessoa define a nova senha ao clicar no link recebido por e-mail.
 * Suporta os dois formatos de link do Supabase: tokens no hash (fluxo implícito)
 * e `?code=` (fluxo PKCE).
 */
const ResetPasswordUpdate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const brand: ResetBrand = searchParams.get('brand') === 'ms' ? 'ms' : 'guata-labs';
  const isMs = brand === 'ms';
  const loginPath = loginPathForBrand(brand);

  const theme = useMemo(
    () =>
      isMs
        ? {
            wrapper: 'bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green',
            title: 'Área do Parceiro',
            subtitle: 'Descubra Mato Grosso do Sul',
            button: 'bg-ms-primary-blue hover:bg-ms-discovery-teal text-white',
            link: 'text-ms-primary-blue hover:underline',
            icon: 'text-ms-primary-blue',
          }
        : {
            wrapper: 'bg-guata-deep',
            title: 'Guatá Labs',
            subtitle: 'Área administrativa',
            button: 'bg-guata-forest hover:bg-guata-deep text-guata-cream',
            link: 'text-guata-forest hover:underline',
            icon: 'text-guata-forest',
          },
    [isMs],
  );

  useEffect(() => {
    let active = true;

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const hashError = hash.get('error_description') || hash.get('error');
    const code = searchParams.get('code');

    const prepare = async () => {
      if (hashError) {
        if (active) {
          setError(
            'O link de redefinição expirou ou já foi utilizado. Solicite um novo link para continuar.',
          );
          setStatus('invalid');
        }
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError && active) {
          setError('Não foi possível validar o link. Solicite um novo link de redefinição.');
          setStatus('invalid');
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (data.session) {
        setStatus('ready');
      } else {
        setError(
          'Abra esta página pelo link enviado no seu e-mail. Se o link expirou, solicite um novo.',
        );
        setStatus('invalid');
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || (session && status === 'checking')) {
        setStatus('ready');
      }
    });

    prepare();

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Use pelo menos uma letra e um número na nova senha.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setStatus('done');
      toast({
        title: 'Senha atualizada!',
        description: 'Você já pode entrar com a nova senha.',
      });
      setTimeout(() => navigate(loginPath, { replace: true }), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar a senha.';
      setError(
        /same as the old|should be different/i.test(message)
          ? 'A nova senha precisa ser diferente da anterior.'
          : message,
      );
    } finally {
      setSaving(false);
    }
  };

  const forgotPath = isMs ? '/descubrams/forgot-password' : '/viajar/forgot-password';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme.wrapper}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link
            to={loginPath}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
          <h1 className="text-xl font-bold text-white">{theme.title}</h1>
          <p className="text-white/80 text-sm">{theme.subtitle}</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <KeyRound className={`w-6 h-6 shrink-0 ${theme.icon}`} />
              Definir nova senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'checking' && (
              <div className="py-10 flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Validando seu link…</p>
              </div>
            )}

            {status === 'invalid' && (
              <div className="py-6 text-center space-y-4">
                <AlertTriangle className="w-10 h-10 mx-auto text-amber-500" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Link to={forgotPath}>
                  <Button className={`w-full ${theme.button}`} size="lg">
                    Solicitar novo link
                  </Button>
                </Link>
                <Link to={loginPath} className={`block text-sm ${theme.link}`}>
                  Voltar para o login
                </Link>
              </div>
            )}

            {status === 'done' && (
              <div className="py-6 text-center space-y-4">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                <p className="text-sm text-muted-foreground">
                  Senha atualizada com sucesso. Redirecionando para o login…
                </p>
                <Link to={loginPath}>
                  <Button className={`w-full ${theme.button}`} size="lg">
                    Ir para o login
                  </Button>
                </Link>
              </div>
            )}

            {status === 'ready' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo de 8 caracteres"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className={`w-full ${theme.button}`} size="lg" disabled={saving}>
                  {saving ? 'Salvando…' : 'Salvar nova senha'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordUpdate;
