import React from 'react';
import { Partner } from '@/hooks/usePartners';
import { Card } from '@/components/ui/card';
import { Building, MapPin, Gift } from 'lucide-react';

interface PartnerCardProps {
  partner: Partner;
  onViewMore: () => void;
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

export function PartnerCard({ partner, onViewMore }: PartnerCardProps) {
  const getCity = () => {
    if (partner.address) {
      const parts = partner.address.split('-');
      if (parts.length > 1) {
        return parts[parts.length - 1].trim();
      }
    }
    return 'MS';
  };

  return (
    <Card 
      onClick={onViewMore}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0"
    >
      {/* Imagem */}
      <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ms-primary-blue/10 to-ms-pantanal-green/10">
            <Building className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Tipo - Badge */}
        {partner.partner_type && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-ms-primary-blue text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {partnerTypeLabels[partner.partner_type] || partner.partner_type}
          </span>
        )}

        {/* Desconto indicator */}
        {partner.discount_offer && (
          <span className="absolute top-3 right-3 bg-ms-secondary-yellow text-black text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
            <Gift className="w-3.5 h-3.5" />
            Desconto
          </span>
        )}

        {/* Ver mais - aparece no hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white text-ms-primary-blue font-semibold px-6 py-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            Ver mais
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-ms-primary-blue transition-colors">
          {partner.name}
        </h3>
        
        <p className="text-sm text-gray-500 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-ms-primary-blue" />
          {getCity()}
        </p>

        {partner.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {partner.description}
          </p>
        )}
      </div>
    </Card>
  );
}

export default PartnerCard;
