
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PDFExportButton from "../exports/PDFExportButton";

interface Partner {
  id: string;
  name: string;
  city: string;
  segment: string;
  category: string;
  tier: string;
  status: string;
  website_link?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  message?: string;
  created_at: string;
  approved_at?: string;
}

const PartnersManager = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Map database fields to Partner interface
      const mappedPartners = (data || []).map(item => ({
        ...item,
        category: (item.partner_type || 'local') as 'local' | 'regional' | 'estadual',
        city: '', // Default empty city
        segment: '', // Default empty segment
        tier: '', // Default empty tier
        status: 'approved' as string // Default status
      }));
      setPartners(mappedPartners);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar parceiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePartnerStatus = async (partnerId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('institutional_partners')
        .update(updateData)
        .eq('id', partnerId);

      if (error) throw error;

      await fetchPartners();
      toast({
        title: "Status atualizado",
        description: `Parceiro ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error updating partner status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do parceiro",
        variant: "destructive",
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

      await fetchPartners();
      toast({
        title: "Parceiro excluído",
        description: "O parceiro foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir parceiro",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.segment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportColumns = [
    { header: 'Nome', dataKey: 'name' },
    { header: 'Cidade', dataKey: 'city' },
    { header: 'Segmento', dataKey: 'segment' },
    { header: 'Categoria', dataKey: 'category' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Data de Criação', dataKey: 'created_at' },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Parceiros</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie as solicitações de parceria institucional
            </p>
          </div>
          <PDFExportButton
            data={filteredPartners}
            filename="relatorio-parceiros"
            title="Relatório de Parceiros Institucionais"
            columns={exportColumns}
          />
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, cidade ou segmento..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Carregando parceiros...
                    </TableCell>
                  </TableRow>
                ) : filteredPartners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Nenhum parceiro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.city}</TableCell>
                      <TableCell>{partner.segment}</TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>
                        {new Date(partner.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPartner(partner);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {partner.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updatePartnerStatus(partner.id, 'approved')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePartner(partner.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Detalhes do Parceiro</DialogTitle>
            <DialogDescription>
              Informações completas da solicitação de parceria
            </DialogDescription>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome</Label>
                  <p className="text-sm text-gray-700">{selectedPartner.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cidade</Label>
                  <p className="text-sm text-gray-700">{selectedPartner.city}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Segmento</Label>
                  <p className="text-sm text-gray-700">{selectedPartner.segment}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPartner.status)}</div>
                </div>
              </div>
              
              {selectedPartner.website_link && (
                <div>
                  <Label className="text-sm font-medium">Website</Label>
                  <p className="text-sm text-blue-600 hover:underline">
                    <a href={selectedPartner.website_link} target="_blank" rel="noopener noreferrer">
                      {selectedPartner.website_link}
                    </a>
                  </p>
                </div>
              )}
              
              {selectedPartner.contact_email && (
                <div>
                  <Label className="text-sm font-medium">E-mail</Label>
                  <p className="text-sm text-gray-700">{selectedPartner.contact_email}</p>
                </div>
              )}
              
              {selectedPartner.contact_whatsapp && (
                <div>
                  <Label className="text-sm font-medium">WhatsApp</Label>
                  <p className="text-sm text-gray-700">{selectedPartner.contact_whatsapp}</p>
                </div>
              )}
              
              {selectedPartner.message && (
                <div>
                  <Label className="text-sm font-medium">Mensagem</Label>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedPartner.message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersManager;
