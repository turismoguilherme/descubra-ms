import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  X, 
  Eye, 
  Clock, 
  MapPin,
  Phone,
  Globe,
  Mail,
  Building2,
  Percent,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyPartnerApproved, notifyPartnerRejected } from '@/services/email/notificationEmailService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Partner {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  partner_type?: string;
  status: string;
  discount_offer?: string;
  gallery_images?: string[];
  youtube_url?: string;
  created_at: string;
}

export default function PartnersManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  const loadPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar parceiros:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os parceiros',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const updatePartnerStatus = async (partnerId: string, status: string) => {
    try {
      // Buscar dados do parceiro para o email
      const partner = partners.find(p => p.id === partnerId);

      const { error } = await supabase
        .from('institutional_partners')
        .update({ status, is_active: status === 'approved' })
        .eq('id', partnerId);

      if (error) throw error;

      // Enviar email de notificação
      if (partner?.contact_email) {
        if (status === 'approved') {
          notifyPartnerApproved({
            partnerEmail: partner.contact_email,
            partnerName: partner.name,
          }).catch(err => console.error('Erro ao enviar email:', err));
        } else if (status === 'rejected') {
          notifyPartnerRejected({
            partnerEmail: partner.contact_email,
            partnerName: partner.name,
          }).catch(err => console.error('Erro ao enviar email:', err));
        }
      }

      const messages: Record<string, { title: string; description: string }> = {
        approved: {
          title: 'Parceiro aprovado!',
          description: 'O parceiro agora está visível na plataforma. Email de notificação enviado.',
        },
        rejected: {
          title: 'Parceiro rejeitado',
          description: 'A solicitação foi rejeitada. Email de notificação enviado.',
        },
        suspended: {
          title: 'Parceiro suspenso',
          description: 'O parceiro foi temporariamente suspenso.',
        },
      };

      toast(messages[status] || { title: 'Status atualizado', description: '' });
      loadPartners();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deletePartner = async (partnerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este parceiro?')) return;

    try {
      const { error } = await supabase
        .from('institutional_partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: 'Parceiro excluído',
        description: 'O parceiro foi removido permanentemente.',
      });
      loadPartners();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const pendingPartners = partners.filter(p => p.status === 'pending');
  const approvedPartners = partners.filter(p => p.status === 'approved');
  const rejectedPartners = partners.filter(p => p.status === 'rejected' || p.status === 'suspended');

  const PartnerCard = ({ partner }: { partner: Partner }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {partner.logo_url ? (
            <img 
              src={partner.logo_url} 
              alt={partner.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                {partner.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    {partner.address}
                  </div>
                )}
                {partner.partner_type && (
                  <Badge variant="outline" className="mt-1">
                    {partner.partner_type}
                  </Badge>
                )}
              </div>
              <Badge 
                variant={
                  partner.status === 'approved' ? 'default' : 
                  partner.status === 'pending' ? 'secondary' : 
                  'destructive'
                }
              >
                {partner.status === 'approved' ? 'Ativo' : 
                 partner.status === 'pending' ? 'Pendente' : 
                 'Rejeitado'}
              </Badge>
            </div>

            {partner.discount_offer && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <Percent className="w-4 h-4" />
                {partner.discount_offer}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedPartner(partner)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver Detalhes
              </Button>
              
              {partner.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updatePartnerStatus(partner.id, 'approved')}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rejeitar
                  </Button>
                </>
              )}

              {partner.status === 'approved' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updatePartnerStatus(partner.id, 'suspended')}
                >
                  Suspender
                </Button>
              )}

              {(partner.status === 'rejected' || partner.status === 'suspended') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updatePartnerStatus(partner.id, 'approved')}
                >
                  Reativar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Parceiros</h2>
          <p className="text-gray-600">Aprovar, rejeitar e gerenciar parceiros da plataforma</p>
        </div>
        <Button onClick={loadPartners} variant="outline">
          Atualizar Lista
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{pendingPartners.length}</div>
            <p className="text-xs text-yellow-600">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{approvedPartners.length}</div>
            <p className="text-xs text-green-600">Parceiros aprovados</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{rejectedPartners.length}</div>
            <p className="text-xs text-red-600">Rejeitados ou suspensos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de parceiros */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pendentes ({pendingPartners.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <Check className="w-4 h-4" />
            Ativos ({approvedPartners.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <X className="w-4 h-4" />
            Inativos ({rejectedPartners.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : pendingPartners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum parceiro pendente de aprovação
            </div>
          ) : (
            pendingPartners.map(partner => (
              <PartnerCard key={partner.id} partner={partner} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-4">
          {approvedPartners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum parceiro ativo
            </div>
          ) : (
            approvedPartners.map(partner => (
              <PartnerCard key={partner.id} partner={partner} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {rejectedPartners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum parceiro inativo
            </div>
          ) : (
            rejectedPartners.map(partner => (
              <PartnerCard key={partner.id} partner={partner} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPartner?.name}</DialogTitle>
            <DialogDescription>Detalhes completos do parceiro</DialogDescription>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="space-y-4">
              {selectedPartner.logo_url && (
                <img 
                  src={selectedPartner.logo_url} 
                  alt={selectedPartner.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {selectedPartner.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-700 mt-1">{selectedPartner.description}</p>
                </div>
              )}

              {selectedPartner.discount_offer && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Oferta de Desconto
                  </label>
                  <p className="text-green-700 mt-1 font-medium">{selectedPartner.discount_offer}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPartner.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Endereço</label>
                      <p className="text-gray-700">{selectedPartner.address}</p>
                    </div>
                  </div>
                )}
                {selectedPartner.contact_phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      <p className="text-gray-700">{selectedPartner.contact_phone}</p>
                    </div>
                  </div>
                )}
                {selectedPartner.contact_email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-700">{selectedPartner.contact_email}</p>
                    </div>
                  </div>
                )}
                {selectedPartner.website_url && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <a 
                        href={selectedPartner.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block"
                      >
                        {selectedPartner.website_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {selectedPartner.youtube_url && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4" />
                    Vídeo Promocional
                  </label>
                  <a 
                    href={selectedPartner.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Ver no YouTube
                  </a>
                </div>
              )}

              {selectedPartner.gallery_images && selectedPartner.gallery_images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4" />
                    Galeria de Fotos
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPartner.gallery_images.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {selectedPartner.status === 'pending' && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        updatePartnerStatus(selectedPartner.id, 'approved');
                        setSelectedPartner(null);
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar Parceiro
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        updatePartnerStatus(selectedPartner.id, 'rejected');
                        setSelectedPartner(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
                {selectedPartner.status === 'approved' && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      updatePartnerStatus(selectedPartner.id, 'suspended');
                      setSelectedPartner(null);
                    }}
                  >
                    Suspender Parceiro
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    deletePartner(selectedPartner.id);
                    setSelectedPartner(null);
                  }}
                >
                  Excluir Permanentemente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

