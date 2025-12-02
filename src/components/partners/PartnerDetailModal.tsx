import React, { useState, useEffect } from 'react';
import { Partner } from '@/hooks/usePartners';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, ExternalLink, Calendar, Users, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePartnerLeads, PartnerLeadRequestType } from '@/hooks/usePartnerLeads';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const { createLead, isSubmitting } = usePartnerLeads();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  const [peopleCount, setPeopleCount] = useState<string>('');
  const [requestType, setRequestType] = useState<PartnerLeadRequestType>('day_use');
  const [message, setMessage] = useState('');
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  // Prefill com dados do usuário autenticado, se existirem
  useEffect(() => {
    if (userProfile) {
      if (!fullName && (userProfile.full_name || userProfile.name)) {
        setFullName(userProfile.full_name || userProfile.name || '');
      }
      if (!email && userProfile.email) {
        setEmail(userProfile.email);
      } else if (!email && user?.email) {
        setEmail(user.email);
      }
      if (!phone && (userProfile.phone || userProfile.whatsapp)) {
        setPhone(userProfile.phone || userProfile.whatsapp || '');
      }
    } else if (user && !email) {
      setEmail(user.email || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile]);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      toast({
        title: 'Preencha nome e e-mail',
        description: 'Esses campos são obrigatórios para enviar sua solicitação.',
        variant: 'destructive',
      });
      return;
    }

    const countNumber = peopleCount ? Number(peopleCount) : undefined;

    const result = await createLead({
      partner,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      desiredDate: desiredDate || undefined,
      peopleCount: Number.isNaN(countNumber || NaN) ? undefined : countNumber,
      requestType,
      message: message.trim() || undefined,
    });

    if (result.success) {
      // Limpa apenas campos mais sensíveis; mantém nome/email preenchidos para próximos envios
      setDesiredDate('');
      setPeopleCount('');
      setMessage('');
      onClose();
    }
  };

  const allImages = [
    partner.logo_url,
    ...(partner.gallery_images || [])
  ].filter(Boolean) as string[];

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=))([\w-]{10,12})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  const youtubeEmbedUrl = partner.youtube_url ? getYouTubeEmbedUrl(partner.youtube_url) : null;

  // Reset índice de foto quando o parceiro mudar
  useEffect(() => {
    setPreviewIndex(0);
  }, [partner?.id]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Detalhes do parceiro {partner.name}</DialogTitle>
          <DialogDescription>
            Informações e formulário de pedido de reserva para parceiro do Descubra Mato Grosso do Sul.
          </DialogDescription>
        </DialogHeader>
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
                  Oferta exclusiva para quem usa o Passaporte Digital
                </h4>
              </div>
              <p className="text-gray-800 font-medium text-lg">
                {partner.discount_offer}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Apresente seu Passaporte Digital Descubra MS neste parceiro para garantir o
                benefício indicado.
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
              {/* Foto principal em destaque */}
              <div className="w-full mb-3">
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                  <img
                    src={allImages[previewIndex]}
                    alt={`${partner.name} - Foto em destaque`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Miniaturas em carrossel horizontal */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        index === previewIndex
                          ? 'border-ms-primary-blue'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      onClick={() => setPreviewIndex(index)}
                    >
                      <img
                        src={img}
                        alt={`${partner.name} - Foto ${index + 1}`}
                        className="w-24 h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ação: Pedido de reserva/orçamento via Descubra MS */}
          <div className="bg-ms-primary-blue/5 rounded-2xl p-5 space-y-4 border border-ms-primary-blue/20">
            <div className="flex items-center gap-2 mb-1">
              <Inbox className="w-5 h-5 text-ms-primary-blue" />
              <h4 className="font-semibold text-gray-900 text-lg">
                Pedir reserva ou orçamento pelo Descubra MS
              </h4>
            </div>
            <p className="text-sm text-gray-600">
              Envie seus dados e seu pedido. O parceiro receberá a solicitação e entrará em contato
              diretamente com você.
            </p>
            {!user && (
              <p className="text-sm text-red-600 font-medium">
                Você precisa estar logado para enviar uma solicitação. Use o menu de login do
                Descubra MS antes de continuar.
              </p>
            )}

            <form onSubmit={handleSubmitLead} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-name">Seu nome *</Label>
                  <Input
                    id="lead-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-email">E-mail *</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-phone">WhatsApp / Telefone</Label>
                  <Input
                    id="lead-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(67) 9 0000-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-date">Data desejada</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <Input
                      id="lead-date"
                      type="date"
                      value={desiredDate}
                      onChange={(e) => setDesiredDate(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-people">Número de pessoas</Label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <Input
                      id="lead-people"
                      type="number"
                      min={1}
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-type">O que você quer reservar?</Label>
                  <select
                    id="lead-type"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ms-primary-blue focus:border-ms-primary-blue bg-white"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as PartnerLeadRequestType)}
                  >
                    <option value="day_use">Day use em fazenda / balneário</option>
                    <option value="diaria">Diária de hospedagem</option>
                    <option value="pacote_completo">Pacote completo (hospedagem + passeios)</option>
                    <option value="passeio_especifico">
                      Passeio / atividade específica (flutuação, trilha, cavalgada etc.)
                    </option>
                    <option value="gastronomia">Experiência gastronômica</option>
                    <option value="transporte">Transporte (traslado, barco etc.)</option>
                    <option value="evento_grupo">Evento / grupo (empresa, escola, excursão)</option>
                    <option value="outro">Outro tipo de serviço</option>
                  </select>
              </div>
            </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-message">Detalhes do que você procura</Label>
                <Textarea
                  id="lead-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex.: Quero reservar um day use para família com crianças, com almoço incluso."
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className="flex-1 rounded-xl h-11 text-base bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white"
                >
                  {isSubmitting ? "Enviando pedido..." : "Enviar pedido de reserva"}
                </Button>
              </div>
            </form>
          </div>

          {/* Botão direto do site do parceiro */}
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
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export default PartnerDetailModal;
