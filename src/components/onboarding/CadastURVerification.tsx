/**
 * CadastUR Verification Component
 * Verificação de CADASTUR (obrigatório para estabelecimentos turísticos no Brasil)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Loader2, Info, ExternalLink, Phone, Mail, Calendar, DollarSign, Award, Building2 } from 'lucide-react';
import { 
  verifyCadastUR, 
  validateCadastURFormat, 
  formatCadastUR, 
  CADASTUR_INFO,
  requiresCadastUR,
  type CadastURVerificationResult 
} from '@/services/cadasturService';
import { cn } from '@/lib/utils';

interface CadastURVerificationProps {
  category: string;
  cnpj: string;
  onVerified: (result: CadastURVerificationResult) => void;
  onSkip?: () => void;
}

export default function CadastURVerification({ 
  category, 
  cnpj, 
  onVerified,
  onSkip 
}: CadastURVerificationProps) {
  const [cadastur, setCadastur] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<CadastURVerificationResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [dontHaveCadastur, setDontHaveCadastur] = useState(false);

  const isMandatory = requiresCadastUR(category);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove não-dígitos
    if (value.length <= 15) {
      setCadastur(value);
      setResult(null); // Limpa resultado anterior
    }
  };

  const handleVerify = async () => {
    if (!validateCadastURFormat(cadastur)) {
      setResult({
        isValid: false,
        status: 'not_found',
        message: 'Formato inválido. CADASTUR deve ter 15 dígitos.'
      });
      return;
    }

    setIsVerifying(true);
    try {
      const verificationResult = await verifyCadastUR(cadastur, cnpj);
      setResult(verificationResult);
      
      if (verificationResult.isValid) {
        onVerified(verificationResult);
      }
    } catch (error) {
      setResult({
        isValid: false,
        status: 'not_found',
        message: 'Erro ao verificar CADASTUR. Tente novamente.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const formattedCadastur = cadastur ? formatCadastUR(cadastur) : '';

  return (
    <div className="space-y-6">
      {/* Header com Badge */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🇧🇷 Verificação CADASTUR
            {isMandatory && (
              <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Sistema de Cadastro de Prestadores de Serviços Turísticos do Ministério do Turismo
          </p>
        </div>
        
        <Dialog open={showInfo} onOpenChange={setShowInfo}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Info className="h-4 w-4" />
              Como obter?
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Como Obter o CADASTUR
              </DialogTitle>
              <DialogDescription>
                Registro gratuito e obrigatório para prestadores de serviços turísticos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Requisitos */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  📋 Documentos Necessários
                </h3>
                <ul className="space-y-2">
                  {CADASTUR_INFO.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefícios */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  🌟 Benefícios do CADASTUR
                </h3>
                <ul className="space-y-2">
                  {CADASTUR_INFO.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Informações Práticas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-sm">Custo</span>
                  </div>
                  <p className="text-lg font-bold text-green-700">{CADASTUR_INFO.cost}</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm">Prazo</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{CADASTUR_INFO.time}</p>
                </div>
              </div>

              {/* Contatos */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  📞 Suporte Oficial
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span>{CADASTUR_INFO.support.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span>{CADASTUR_INFO.support.email}</span>
                  </div>
                </div>
              </div>

              {/* Link Oficial */}
              <Button className="w-full gap-2" asChild>
                <a href={CADASTUR_INFO.officialSite} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Acessar Site Oficial do CADASTUR
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Card Principal */}
      <Card className={cn(
        "border-2",
        result?.isValid && "border-green-500",
        result && !result.isValid && "border-red-500"
      )}>
        <CardHeader>
          <CardTitle>Informe seu Número CADASTUR</CardTitle>
          <CardDescription>
            {isMandatory ? (
              <span className="text-orange-600 font-medium">
                ⚠️ Para operar legalmente no Brasil, estabelecimentos turísticos precisam ter registro no CADASTUR.
              </span>
            ) : (
              "O CADASTUR não é obrigatório para sua categoria, mas é recomendado."
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Número CADASTUR
              <span className="text-xs text-muted-foreground ml-2">
                (15 dígitos - formato: XX.XXX.XXX/XXXX-XX)
              </span>
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="12.345.678/9012-34"
                value={formattedCadastur}
                onChange={handleInputChange}
                disabled={isVerifying || result?.isValid || dontHaveCadastur}
                className={cn(
                  "font-mono text-lg",
                  result?.isValid && "border-green-500",
                  result && !result.isValid && "border-red-500"
                )}
              />
              <Button
                onClick={handleVerify}
                disabled={cadastur.length !== 15 || isVerifying || result?.isValid || dontHaveCadastur}
                className="min-w-[120px]"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : result?.isValid ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verificado
                  </>
                ) : (
                  'Verificar'
                )}
              </Button>
            </div>
          </div>

          {/* Checkbox "Não tenho CADASTUR" */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="dontHave"
              checked={dontHaveCadastur}
              onChange={(e) => {
                setDontHaveCadastur(e.target.checked);
                if (e.target.checked) {
                  setCadastur('');
                  setResult(null);
                }
              }}
              disabled={result?.isValid}
              className="mt-1"
            />
            <label htmlFor="dontHave" className="text-sm cursor-pointer">
              Não tenho CADASTUR ainda
              <span className="block text-xs text-muted-foreground mt-1">
                Você terá <strong>60 dias</strong> para obter o registro sem perder acesso à plataforma
              </span>
            </label>
          </div>

          {/* Resultado da Verificação */}
          {result && (
            <Alert className={cn(
              result.isValid ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
            )}>
              <div className="flex items-start gap-3">
                {result.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <p className={cn(
                      "font-medium mb-2",
                      result.isValid ? "text-green-900" : "text-red-900"
                    )}>
                      {result.message}
                    </p>
                    
                    {result.isValid && (
                      <div className="space-y-1 text-sm text-green-800">
                        {result.companyName && (
                          <p><strong>Empresa:</strong> {result.companyName}</p>
                        )}
                        {result.category && (
                          <p><strong>Categoria:</strong> {result.category}</p>
                        )}
                        {result.registrationDate && (
                          <p><strong>Registro:</strong> {new Date(result.registrationDate).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Aviso de Período de Graça */}
          {dontHaveCadastur && (
            <Alert className="border-orange-200 bg-orange-50">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm">
                <p className="font-medium text-orange-900 mb-2">
                  Período de Graça: 60 dias
                </p>
                <p className="text-orange-800">
                  Você pode usar a plataforma normalmente por 60 dias enquanto obtém seu CADASTUR.
                  Enviaremos lembretes e um tutorial completo de como registrar-se.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            {result?.isValid ? (
              <Button className="flex-1" size="lg">
                Continuar para Próxima Etapa →
              </Button>
            ) : dontHaveCadastur ? (
              <Button 
                variant="outline" 
                className="flex-1" 
                size="lg"
                onClick={handleSkip}
              >
                Continuar sem CADASTUR (60 dias de prazo)
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                disabled={isMandatory && !dontHaveCadastur}
              >
                Pular esta etapa
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CADASTUR de Teste (apenas em dev) */}
      {process.env.NODE_ENV === 'development' && (
        <Alert className="border-purple-200 bg-purple-50">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-sm">
            <p className="font-medium text-purple-900 mb-2">
              🧪 Ambiente de Desenvolvimento - CADASTUR de Teste:
            </p>
            <div className="space-y-1 text-purple-800 font-mono text-xs">
              <p>12.345.678/9012-34</p>
              <p>98.765.432/1098-76</p>
              <p>11.111.111/1111-11</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}


