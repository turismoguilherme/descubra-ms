import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, Clock } from 'lucide-react';
import { usePartners, Partner } from '@/hooks/usePartners';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const PartnerLeadsManagement = () => {
  const { toast } = useToast();
  // Modificado: Agora busca apenas parceiros com status 'pending'
  const { partners, isLoading, error, refetch } = usePartners('pending');

  // A filtragem por status 'pending' agora é feita diretamente no hook
  // const pendingPartners = partners.filter(p => p.status === 'pending');

  const handleUpdatePartnerStatus = async (partnerId: string, newStatus: string) => {
    const { error } = await supabase
      .from('institutional_partners')
      .update({ status: newStatus, approved_at: newStatus === 'approved' ? new Date().toISOString() : null })
      .eq('id', partnerId);

    if (error) {
      toast({
        title: "Erro ao atualizar parceiro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: `Parceiro ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso.`, 
      });
      refetch(); // Recarregar a lista de parceiros
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando leads de parceiros...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Erro ao carregar leads: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Leads de Parceiros</CardTitle>
        <CardDescription>Revise e aprove ou rejeite solicitações de parceria.</CardDescription>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <p className="text-center text-gray-600">Nenhuma solicitação de parceria pendente no momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Pessoa de Contato</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Interesse</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Usar 'partners' diretamente, pois já estão filtrados por status 'pending' */}
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>{partner.cnpj || 'N/A'}</TableCell>
                    <TableCell>{partner.contact_person || 'N/A'}</TableCell>
                    <TableCell>{partner.contact_email || 'N/A'}</TableCell>
                    <TableCell>{partner.contact_whatsapp || 'N/A'}</TableCell>
                    <TableCell>{partner.segment || 'N/A'}</TableCell>
                    <TableCell>{partner.partnership_interest || 'N/A'}</TableCell>
                    <TableCell>{partner.city || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock size={14} className="mr-1" />
                        Pendente
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          // Implementar visualização detalhada, se necessário
                          toast({
                            title: "Visualizar Detalhes",
                            description: `Exibir detalhes de ${partner.name}`,
                          });
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleUpdatePartnerStatus(partner.id, 'approved')}
                      >
                        <Check size={16} />
                        Aprovar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleUpdatePartnerStatus(partner.id, 'rejected')}
                      >
                        <X size={16} />
                        Rejeitar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerLeadsManagement; 