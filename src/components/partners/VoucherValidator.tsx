import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Keyboard,
  Camera,
  X
} from 'lucide-react';
import { rewardsService } from '@/services/passport/rewardsService';
import { Html5Qrcode } from 'html5-qrcode';

interface VoucherValidatorProps {
  partnerId: string;
  partnerName: string;
  onVoucherValidated: () => void;
}

const VoucherValidator: React.FC<VoucherValidatorProps> = ({
  partnerId,
  partnerName,
  onVoucherValidated,
}) => {
  const { toast } = useToast();
  const [voucherCode, setVoucherCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
    voucher?: unknown;
  } | null>(null);
  
  // QR Scanner state
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  const handleManualValidation = async () => {
    if (!voucherCode.trim()) {
      toast({
        title: 'Código necessário',
        description: 'Por favor, digite o código do voucher',
        variant: 'destructive',
      });
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      // Validar voucher
      const voucher = await rewardsService.validateVoucherCode(voucherCode.trim());

      if (!voucher) {
        setValidationResult({
          success: false,
          message: 'Voucher não encontrado ou código inválido',
        });
        return;
      }

      if (voucher.is_used) {
        setValidationResult({
          success: false,
          message: 'Este voucher já foi usado anteriormente',
          voucher,
        });
        return;
      }

      // Verificar se o voucher pertence a uma recompensa deste parceiro
      const reward = (voucher as any).reward;
      if (reward && reward.partner_name !== partnerName) {
        setValidationResult({
          success: false,
          message: 'Este voucher não pertence às suas recompensas',
        });
        return;
      }

      // Marcar como usado
      await rewardsService.markRewardAsUsed(voucher.user_id, voucher.id);

      setValidationResult({
        success: true,
        message: 'Voucher validado e marcado como usado com sucesso!',
        voucher,
      });

      toast({
        title: 'Voucher validado! ✅',
        description: 'O voucher foi marcado como usado.',
      });

      // Limpar campo e atualizar lista
      setVoucherCode('');
      onVoucherValidated();

      // Limpar resultado após 5 segundos
      setTimeout(() => {
        setValidationResult(null);
      }, 5000);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao validar voucher:', err);
      setValidationResult({
        success: false,
        message: error.message || 'Erro ao validar voucher',
      });
      toast({
        title: 'Erro',
        description: 'Não foi possível validar o voucher',
        variant: 'destructive',
      });
    } finally {
      setValidating(false);
    }
  };

  const startQRScanner = async () => {
    if (!scannerRef.current) return;

    try {
      setScanning(true);
      const html5QrCode = new Html5Qrcode('qr-reader');
      
      await html5QrCode.start(
        { facingMode: 'environment' }, // Usar câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code escaneado com sucesso
          handleQRCodeScanned(decodedText);
        },
        (errorMessage) => {
          // Ignorar erros de leitura (ainda tentando ler)
        }
      );

      setScanner(html5QrCode);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao iniciar scanner:', err);
      toast({
        title: 'Erro ao acessar câmera',
        description: 'Não foi possível acessar a câmera. Verifique as permissões.',
        variant: 'destructive',
      });
      setScanning(false);
    }
  };

  const stopQRScanner = async (): Promise<void> => {
    if (scanner) {
      try {
        await scanner.stop();
        await scanner.clear();
        setScanner(null);
      } catch (error) {
        console.error('Erro ao parar scanner:', error);
      }
    }
    setScanning(false);
  };

  const handleQRCodeScanned = async (code: string) => {
    // Parar scanner
    try {
      await stopQRScanner();
    } catch (error) {
      console.error('Erro ao parar scanner:', error);
    }

    // Tentar extrair código do JSON se for o caso
    let voucherCode = code;
    try {
      const parsed = JSON.parse(code);
      if (parsed.voucherCode) {
        voucherCode = parsed.voucherCode;
      }
    } catch {
      // Não é JSON, usar código direto
    }

    // Validar voucher
    setVoucherCode(voucherCode);
    await handleManualValidation();
  };

  useEffect(() => {
    // Limpar scanner ao desmontar
    return () => {
      if (scanner) {
        // Parar scanner de forma assíncrona
        scanner.stop().catch(console.error);
        // Limpar scanner (pode ser void)
        try {
          const clearResult = scanner.clear();
          // Se clear retornar uma Promise, tratar
          if (clearResult && typeof clearResult === 'object' && 'catch' in clearResult) {
            (clearResult as Promise<void>).catch(console.error);
          }
        } catch (error) {
          console.error('Erro ao limpar scanner:', error);
        }
      }
    };
  }, [scanner]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validar Voucher</CardTitle>
          <CardDescription>
            Valide vouchers dos clientes digitando o código ou escaneando o QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                <Keyboard className="w-4 h-4 mr-2" />
                Digitar Código
              </TabsTrigger>
              <TabsTrigger value="scan">
                <Camera className="w-4 h-4 mr-2" />
                Escanear QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voucher-code">Código do Voucher</Label>
                <div className="flex gap-2">
                  <Input
                    id="voucher-code"
                    placeholder="Ex: MS-12345678"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleManualValidation();
                      }
                    }}
                    className="font-mono"
                    disabled={validating}
                  />
                  <Button
                    onClick={handleManualValidation}
                    disabled={validating || !voucherCode.trim()}
                    className="bg-ms-primary-blue hover:bg-ms-discovery-teal"
                  >
                    {validating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Validar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {validationResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  validationResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {validationResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        validationResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {validationResult.success ? 'Voucher Válido!' : 'Erro na Validação'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        validationResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {validationResult.message}
                      </p>
                      {validationResult.voucher && (
                        <div className="mt-2 text-xs text-gray-600">
                          <p>Código: {validationResult.voucher.voucher_code}</p>
                          {validationResult.voucher.reward && (
                            <p>Recompensa: {(validationResult.voucher.reward as any).partner_name}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="scan" className="space-y-4">
              {!scanning ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Clique no botão abaixo para iniciar o scanner de QR code. 
                      Certifique-se de permitir o acesso à câmera quando solicitado.
                    </p>
                  </div>
                  <Button
                    onClick={startQRScanner}
                    className="w-full bg-ms-primary-blue hover:bg-ms-discovery-teal"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Iniciar Scanner
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <div
                      id="qr-reader"
                      ref={scannerRef}
                      className="w-full rounded-lg overflow-hidden"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                  <Button
                    onClick={stopQRScanner}
                    variant="destructive"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Parar Scanner
                  </Button>
                  <p className="text-sm text-center text-gray-600">
                    Posicione o QR code do voucher dentro da área de leitura
                  </p>
                </div>
              )}

              {validationResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  validationResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {validationResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        validationResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {validationResult.success ? 'Voucher Válido!' : 'Erro na Validação'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        validationResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {validationResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherValidator;

