import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle2, XCircle, Clock, Eye, FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ReviewStatus = 'pending' | 'approved' | 'rejected';

interface TermAcceptance {
  id: string;
  partner_id: string;
  terms_version: number;
  pdf_url: string | null;
  digital_signature_url: string | null;
  uploaded_pdf_url: string | null;
  review_status: string;
  reviewed_at: string | null;
  review_notes: string | null;
  signed_at: string;
  ip_address: string | null;
  // joined
  partner_name?: string;
}

const statusConfig: Record<ReviewStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function PartnerTermsReview() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [terms, setTerms] = useState<TermAcceptance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('all');
  const [selectedTerm, setSelectedTerm] = useState<TermAcceptance | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadTerms = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('partner_terms_acceptances').select('*').order('signed_at', { ascending: false });
      if (filter !== 'all') {
        query = query.eq('review_status', filter);
      }
      const { data, error } = await query;
      if (error) throw error;

      // Fetch partner names
      const partnerIds = [...new Set((data || []).map(t => t.partner_id))];
      let partnerMap: Record<string, string> = {};
      if (partnerIds.length > 0) {
        const { data: partners } = await supabase
          .from('institutional_partners')
          .select('id, company_name')
          .in('id', partnerIds);
        partnerMap = (partners || []).reduce((acc, p) => ({ ...acc, [p.id]: p.company_name }), {} as Record<string, string>);
      }

      setTerms((data || []).map(t => ({ ...t, partner_name: partnerMap[t.partner_id] || 'Parceiro desconhecido' })));
    } catch (err) {
      console.error('Erro ao carregar termos:', err);
      toast({ title: 'Erro', description: 'Não foi possível carregar os termos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => { loadTerms(); }, [loadTerms]);

  const updateStatus = async (id: string, status: ReviewStatus) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('partner_terms_acceptances')
        .update({
          review_status: status,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null,
        } as any)
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: `Termo ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso` });
      setSelectedTerm(null);
      setReviewNotes('');
      loadTerms();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast({ title: 'Erro', description: 'Não foi possível atualizar o status', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status as ReviewStatus] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="w-3 h-3" /> {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todos' : statusConfig[f].label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : terms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum termo encontrado com o filtro selecionado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {terms.map(term => (
            <Card key={term.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{term.partner_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Versão {term.terms_version} • {new Date(term.signed_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={term.review_status} />
                    <div className="flex gap-1">
                      {term.pdf_url && (
                        <Button variant="ghost" size="icon" asChild title="Ver PDF digital">
                          <a href={term.pdf_url} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4" /></a>
                        </Button>
                      )}
                      {term.uploaded_pdf_url && (
                        <Button variant="ghost" size="icon" asChild title="Ver PDF enviado">
                          <a href={term.uploaded_pdf_url} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4 text-primary" /></a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedTerm(term); setReviewNotes(term.review_notes || ''); }} title="Revisar">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de revisão */}
      <Dialog open={!!selectedTerm} onOpenChange={(open) => { if (!open) setSelectedTerm(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Revisar Termo - {selectedTerm?.partner_name}</DialogTitle>
          </DialogHeader>
          {selectedTerm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Versão:</strong> {selectedTerm.terms_version}</div>
                <div><strong>Data:</strong> {new Date(selectedTerm.signed_at).toLocaleString('pt-BR')}</div>
                <div><strong>IP:</strong> {selectedTerm.ip_address || 'N/A'}</div>
                <div><strong>Status:</strong> <StatusBadge status={selectedTerm.review_status} /></div>
              </div>

              {selectedTerm.digital_signature_url && (
                <div>
                  <p className="text-sm font-semibold mb-1">Assinatura Digital:</p>
                  <img src={selectedTerm.digital_signature_url} alt="Assinatura" className="border rounded max-h-24" />
                </div>
              )}

              <div className="flex gap-2">
                {selectedTerm.pdf_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedTerm.pdf_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-1" /> PDF Digital
                    </a>
                  </Button>
                )}
                {selectedTerm.uploaded_pdf_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedTerm.uploaded_pdf_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-1" /> PDF Enviado
                    </a>
                  </Button>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold">Notas de revisão:</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Observações sobre a revisão..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => updateStatus(selectedTerm.id, 'rejected')}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                  Rejeitar
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateStatus(selectedTerm.id, 'approved')}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                  Aprovar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
