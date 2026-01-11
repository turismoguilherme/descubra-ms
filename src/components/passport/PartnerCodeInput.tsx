import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, CheckCircle, XCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PartnerCodeInputProps {
  checkpointId: string;
  routeId: string;
  onCodeValidated: (points: number) => void;
  onClose: () => void;
  disabled?: boolean;
}

const PartnerCodeInput: React.FC<PartnerCodeInputProps> = ({
  checkpointId,
  routeId,
  onCodeValidated,
  onClose,
  disabled = false
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const validatePartnerCode = async () => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    if (!code.trim()) {
      setError('Digite o código do parceiro');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar o checkpoint para obter informações
      const { data: checkpoint, error: checkpointError } = await supabase
        .from('route_checkpoints')
        .select('partner_code, points_reward')
        .eq('id', checkpointId)
        .single();

      if (checkpointError) throw checkpointError;

      if (!checkpoint.partner_code) {
        setError('Este checkpoint não possui código de parceiro configurado');
        return;
      }

      // Validar o código
      if (code.trim().toUpperCase() !== checkpoint.partner_code.toUpperCase()) {
        setError('Código inválido. Verifique com o parceiro.');
        return;
      }

      // Verificar se já foi usado por este usuário
      const { data: existingStamp, error: stampError } = await supabase
        .from('passport_stamps')
        .select('id')
        .eq('user_id', user.id)
        .eq('checkpoint_id', checkpointId)
        .maybeSingle();

      if (stampError && stampError.code !== 'PGRST116') throw stampError;

      if (existingStamp) {
        setError('Você já validou este checkpoint anteriormente');
        return;
      }

      // Criar o carimbo
      const { error: insertError } = await supabase
        .from('passport_stamps')
        .insert({
          user_id: user.id,
          route_id: routeId,
          checkpoint_id: checkpointId,
          stamp_type: 'partner_code',
          activity_type: 'checkpoint_validation',
          points_earned: checkpoint.points_reward || 10,
          stamped_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Sucesso!
      toast({
        title: 'Checkpoint validado!',
        description: `Você ganhou ${checkpoint.points_reward || 10} pontos!`,
      });

      onCodeValidated(checkpoint.points_reward || 10);

    } catch (err: any) {
      console.error('Erro ao validar código:', err);
      setError(err.message || 'Erro ao validar código');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !disabled) {
      validatePartnerCode();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <Key className="w-12 h-12 text-blue-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Código do Parceiro</h3>
          <p className="text-sm text-muted-foreground">
            Digite o código fornecido pelo parceiro para validar este checkpoint
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Peça ao estabelecimento parceiro o código específico para este local.
            Cada código é único e só pode ser usado uma vez.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="partner-code">Código do Parceiro</Label>
          <Input
            id="partner-code"
            type="text"
            placeholder="Digite o código..."
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            disabled={loading || disabled}
            className="text-center font-mono text-lg tracking-wider"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={validatePartnerCode}
            className="flex-1"
            disabled={loading || disabled || !code.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Validar Código
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Este código é fornecido pelo estabelecimento parceiro no momento do check-in
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerCodeInput;


