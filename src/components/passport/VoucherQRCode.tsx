import React from 'react';
import QRCodeSVG from 'react-qr-code';

interface VoucherQRCodeProps {
  voucherCode: string;
  size?: number;
  className?: string;
}

/**
 * Componente para exibir QR Code de voucher do passaporte
 * O QR code contém o código do voucher para validação rápida
 */
const VoucherQRCode: React.FC<VoucherQRCodeProps> = ({
  voucherCode,
  size = 200,
  className = '',
}) => {
  // Conteúdo do QR code: apenas o código do voucher
  // Formato simples para fácil leitura
  const qrValue = voucherCode;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
        <QRCodeSVG
          value={qrValue}
          size={size}
          level="M" // Nível de correção de erro: M (médio)
          viewBox={`0 0 ${size} ${size}`}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        Escaneie este código no estabelecimento
      </p>
    </div>
  );
};

export default VoucherQRCode;

