import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dices, QrCode } from 'lucide-react';
import { randomPrefix, sanitizePrefix } from './rewardPrefix';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

/** Campo de prefixo com botão de geração e prévia de como o QR Code é criado. */
const VoucherPrefixField: React.FC<Props> = ({ value, onChange }) => {
  const example = `${value || 'MS'}-A8B9C2`;
  return (
    <div className="space-y-2">
      <Label>Prefixo do Voucher (gerado automaticamente)</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(sanitizePrefix(e.target.value))}
          placeholder="Ex: DCG-HOTEL"
        />
        <Button type="button" variant="outline" size="icon" title="Gerar outro prefixo" onClick={() => onChange(randomPrefix())}>
          <Dices className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
        <p className="flex items-center gap-1 font-medium">
          <QrCode className="h-4 w-4" /> Como o QR Code é criado
        </p>
        <p>Você não precisa enviar imagem de QR Code. Quando o turista completa 100% da rota, o sistema cria um código único e mostra o QR Code no celular dele.</p>
        <p>
          Exemplo do código do turista: <span className="font-mono font-semibold">{example}</span>
        </p>
        <p>No balcão, o parceiro lê o QR Code (ou digita o código) no Painel do Parceiro → Validar Voucher.</p>
      </div>
    </div>
  );
};

export default VoucherPrefixField;
