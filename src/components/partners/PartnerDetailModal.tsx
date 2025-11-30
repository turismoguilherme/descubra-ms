import React from 'react';
import { Partner } from '@/hooks/usePartners';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, Phone, MapPin, Mail, ExternalLink } from 'lucide-react';

interface PartnerDetailModalProps {
  partner: Partner | null;
  open: boolean;
  onClose: () => void;
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

export function PartnerDetailModal({ partner, open, onClose }: PartnerDetailModalProps) {
  if (!partner) return null;

  const allImages = [
    partner.logo_url,
    ...(partner.gallery_images || [])
  ].filter(Boolean) as string[];

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=))([\w-]{10,12})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  const youtubeEmbedUrl = partner.youtube_url ? getYouTubeEmbedUrl(partner.youtube_url) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-0 shadow-2xl">
        {/* Header com imagem de fundo */}
        <div className="relative h-48 bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal">
          {partner.logo_url && (
            <img
              src={partner.logo_url}
              alt={partner.name}
              className="w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          

          {/* Info do header */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {partner.partner_type && (
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full mb-3">
                {partnerTypeLabels[partner.partner_type] || partner.partner_type}
              </span>
            )}
            <h2 className="text-3xl font-bold text-white mb-1">
              {partner.name}
            </h2>
            {partner.address && (
              <p className="text-white/80 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {partner.address}
              </p>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Descrição */}
          {partner.description && (
            <div className="bg-gray-50 rounded-2xl p-5">
              <h4 className="font-semibold text-gray-900 mb-2 text-lg">Sobre</h4>
              <p className="text-gray-600 leading-relaxed">
                {partner.description}
              </p>
            </div>
          )}

          {/* Desconto */}
          {partner.discount_offer && (
            <div className="bg-gradient-to-r from-ms-secondary-yellow/30 to-ms-secondary-yellow/10 rounded-2xl p-5 border border-ms-secondary-yellow/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎁</span>
                <h4 className="font-bold text-ms-primary-blue text-lg">
                  Oferta Exclusiva Passaporte
                </h4>
              </div>
              <p className="text-gray-800 font-medium text-lg">
                {partner.discount_offer}
              </p>
            </div>
          )}

          {/* Vídeo */}
          {youtubeEmbedUrl && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">Vídeo</h4>
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src={youtubeEmbedUrl}
                  title={`Vídeo de ${partner.name}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Fotos */}
          {allImages.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">Fotos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${partner.name} - Foto ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:scale-[1.02] transition-transform"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contato */}
          {(partner.contact_email || partner.contact_phone) && (
            <div className="bg-gray-50 rounded-2xl p-5">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Contato</h4>
              <div className="flex flex-wrap gap-3">
                {partner.contact_email && (
                  <a 
                    href={`mailto:${partner.contact_email}`}
                    className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700"
                  >
                    <Mail className="w-5 h-5 text-ms-primary-blue" />
                    {partner.contact_email}
                  </a>
                )}
                {partner.contact_phone && (
                  <a 
                    href={`tel:${partner.contact_phone}`}
                    className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700"
                  >
                    <Phone className="w-5 h-5 text-ms-primary-blue" />
                    {partner.contact_phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {partner.website_url && (
              <Button
                size="lg"
                variant="outline"
                className="flex-1 rounded-xl h-12 text-base border-2"
                asChild
              >
                <a
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Visitar Site
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}

            {partner.contact_phone && (
              <Button
                size="lg"
                className="flex-1 rounded-xl h-12 text-base bg-green-500 hover:bg-green-600 text-white"
                asChild
              >
                <a
                  href={`https://wa.me/55${partner.contact_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Chamar no WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PartnerDetailModal;
