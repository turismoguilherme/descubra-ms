import React from 'react';
import { Partner } from '@/hooks/usePartners';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Gift } from 'lucide-react';

interface PartnerCardExpandedProps {
  partner: Partner;
  onClick?: () => void;
}

const partnerTypeLabels: Record<string, string> = {
  hotel: 'Hotel',
  pousada: 'Pousada',
  resort: 'Resort',
  restaurante: 'Restaurante',
  atrativo_turistico: 'Atrativo Turístico',
  agencia_turismo: 'Agência de Turismo',
  transporte: 'Transporte',
  guia_turismo: 'Guia de Turismo',
  artesanato: 'Artesanato',
  evento: 'Eventos',
  outro: 'Parceiro',
};

export function PartnerCardExpanded({ partner, onClick }: PartnerCardExpandedProps) {
  const getCity = () => {
    if (partner.address) {
      const parts = partner.address.split('-');
      if (parts.length > 1) {
        return parts[parts.length - 1].trim();
      }
      return partner.address;
    }
    return 'MS';
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md cursor-pointer group"
      onClick={onClick}
    >
      {/* Imagem */}
      <div className="relative aspect-video bg-gray-100">
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Building className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Badge de tipo */}
        {partner.partner_type && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-ms-primary-blue text-white">
              {partnerTypeLabels[partner.partner_type] || partner.partner_type}
            </Badge>
          </div>
        )}

        {/* Indicador de desconto */}
        {partner.discount_offer && (
          <div className="absolute top-3 right-3">
            <div className="bg-ms-secondary-yellow text-black px-2 py-1 rounded-full flex items-center gap-1">
              <Gift className="w-4 h-4" />
              <span className="text-xs font-bold">DESCONTO</span>
            </div>
          </div>
        )}

        {/* Overlay ao passar o mouse */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-4 py-2 rounded-full">
            Ver detalhes
          </span>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Nome e localização */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {partner.name}
        </h3>
        
        <div className="flex items-center gap-1.5 text-gray-600 mb-3">
          <MapPin className="w-4 h-4 text-ms-primary-blue" />
          <span className="text-sm">{getCity()}</span>
        </div>

        {/* Descrição curta */}
        {partner.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {partner.description}
          </p>
        )}

        {/* Preview do desconto */}
        {partner.discount_offer && (
          <div className="bg-ms-secondary-yellow/20 border border-ms-secondary-yellow/30 rounded-lg px-3 py-2">
            <p className="text-sm text-gray-800 font-medium line-clamp-1">
              🎁 {partner.discount_offer}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PartnerCardExpanded;
