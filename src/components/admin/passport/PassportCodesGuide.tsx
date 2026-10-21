import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

type GuideVariant = 'checkpoint' | 'voucher' | 'partner-codes';

interface PassportCodesGuideProps {
  variant?: GuideVariant;
}

/**
 * Explica no admin a diferença entre código de check-in (checkpoint) e voucher de recompensa.
 */
const PassportCodesGuide: React.FC<PassportCodesGuideProps> = ({ variant = 'checkpoint' }) => {
  const emphasis =
    variant === 'voucher'
      ? 'voucher'
      : variant === 'partner-codes'
        ? 'checkpoint'
        : 'checkpoint';

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-blue-900">
          <Info className="h-4 w-4 shrink-0" />
          Check-in vs recompensa — dois códigos diferentes
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-blue-950 space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-blue-200 rounded-md bg-white/80">
            <thead>
              <tr className="bg-blue-100/80">
                <th className="text-left p-2 font-semibold" />
                <th className="text-left p-2 font-semibold">Código do checkpoint</th>
                <th className="text-left p-2 font-semibold">Voucher (recompensa)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              <tr>
                <td className="p-2 font-medium">Para quê?</td>
                <td className="p-2">Carimbar um ponto da rota</td>
                <td className="p-2">Resgatar prêmio após 100% da rota</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Quem cadastra?</td>
                <td className="p-2">Você, no checkpoint (ou Gerador de códigos)</td>
                <td className="p-2">Recompensa da rota; sistema gera por turista</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Exemplo</td>
                <td className="p-2 font-mono">MS-4281 (fixo)</td>
                <td className="p-2 font-mono">DESCUBRA-A1B2C3D4 (único)</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">No app do turista</td>
                <td className="p-2">Digita ao carimbar o ponto</td>
                <td className="p-2">Mostra QR/código ao completar a rota</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Parceiro valida como?</td>
                <td className="p-2">Informa o código no balcão (não usa leitor QR)</td>
                <td className="p-2">Aba Validar Vouchers (QR ou digitar)</td>
              </tr>
            </tbody>
          </table>
        </div>
        {emphasis === 'checkpoint' && (
          <p className="text-blue-800">
            <strong>Nesta tela:</strong> o &quot;Código do parceiro&quot; do checkpoint{' '}
            <strong>não</strong> é o voucher de desconto. É só para o turista{' '}
            <strong>carimbar este ponto</strong>.
          </p>
        )}
        {emphasis === 'voucher' && (
          <p className="text-blue-800">
            <strong>Nesta tela:</strong> ao completar a rota, cada turista recebe um voucher único
            (prefixo + código). O parceiro valida na aba <strong>Validar Vouchers</strong> do painel
            dele.
          </p>
        )}
        {variant === 'partner-codes' && (
          <p className="text-blue-800">
            <strong>Gerador de códigos:</strong> lista e regenera códigos de{' '}
            <strong>check-in</strong> por checkpoint — não confundir com voucher da recompensa.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PassportCodesGuide;
