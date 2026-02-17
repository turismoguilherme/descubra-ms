import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Search, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  User,
  Mail,
  ExternalLink,
  Loader2,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TermsAcceptance {
  id: string;
  partner_id: string;
  terms_version: number;
  pdf_url: string | null;
  ip_address: string | null;
  user_agent: string | null;
  document_hash: string;
  signed_at: string;
  created_at: string;
  partner?: {
    id: string;
    name: string;
    contact_email: string;
  };
}

export default function PartnerTermsAcceptances() {
  const { toast } = useToast();
  const [acceptances, setAcceptances] = useState<TermsAcceptance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVersion, setFilterVersion] = useState<string>('all');
  const [pdfErrors, setPdfErrors] = useState<string[]>([]);

  useEffect(() => {
    loadAcceptances();
  }, []);

  const loadAcceptances = async () => {
    setLoading(true);
    try {
      // Buscar aceites com dados do parceiro
      const { data, error } = await supabase
        .from('partner_terms_acceptances')
        .select(`
          *,
          partner:institutional_partners!partner_id (
            id,
            name,
            contact_email
          )
        `)
        .order('signed_at', { ascending: false });

      if (error) {
        // Se a tabela não existir, mostrar mensagem
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Tabela partner_terms_acceptances não existe. A migration pode não ter sido aplicada.');
          setAcceptances([]);
          toast({
            title: 'Tabela não encontrada',
            description: 'A tabela de aceites de termos não existe. Execute a migration primeiro.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        setAcceptances(data || []);
        
        // Identificar PDFs não salvos
        const errors = (data || [])
          .filter(acc => !acc.pdf_url || acc.pdf_url.trim() === '')
          .map(acc => acc.id);
        setPdfErrors(errors);
        
        if (errors.length > 0) {
          toast({
            title: 'Aviso',
            description: `${errors.length} PDF(s) não foram salvos. Verifique o bucket "documents" no Supabase Storage.`,
            variant: 'destructive',
            duration: 8000,
          });
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar aceites:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os aceites de termos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAcceptances = acceptances.filter(acc => {
    const matchesSearch = !searchTerm || 
      acc.partner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.partner?.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.document_hash?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVersion = filterVersion === 'all' || 
      acc.terms_version.toString() === filterVersion;
    
    return matchesSearch && matchesVersion;
  });

  const handleDownloadPDF = (pdfUrl: string, partnerName: string, version: number) => {
    if (!pdfUrl || pdfUrl.trim() === '') {
      toast({
        title: 'PDF não disponível',
        description: 'Este PDF não foi salvo. Verifique o bucket "documents" no Supabase Storage.',
        variant: 'destructive',
      });
      return;
    }
    
    // Abrir PDF em nova aba
    window.open(pdfUrl, '_blank');
  };

  const getVersionOptions = () => {
    const versions = Array.from(new Set(acceptances.map(acc => acc.terms_version)))
      .sort((a, b) => b - a);
    return versions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ms-primary-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Aceites de Termos de Parceria"
        description="Visualize todos os aceites de termos de parceria com PDFs e metadados para segurança jurídica"
        icon={FileText}
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Aceites</p>
                <p className="text-2xl font-bold">{acceptances.length}</p>
              </div>
              <FileText className="w-8 h-8 text-ms-primary-blue" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PDFs Salvos</p>
                <p className="text-2xl font-bold text-green-600">
                  {acceptances.filter(acc => acc.pdf_url && acc.pdf_url.trim() !== '').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PDFs Não Salvos</p>
                <p className="text-2xl font-bold text-red-600">{pdfErrors.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Versões Diferentes</p>
                <p className="text-2xl font-bold">{getVersionOptions().length}</p>
              </div>
              <FileText className="w-8 h-8 text-ms-discovery-teal" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email ou hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterVersion} onValueChange={setFilterVersion}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por versão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as versões</SelectItem>
                  {getVersionOptions().map(version => (
                    <SelectItem key={version} value={version.toString()}>
                      Versão {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Aceites */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Aceites</CardTitle>
          <CardDescription>
            {filteredAcceptances.length} aceite(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAcceptances.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum aceite encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAcceptances.map((acceptance) => (
                    <TableRow key={acceptance.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {acceptance.partner?.name || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{acceptance.partner?.contact_email || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{acceptance.terms_version}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(acceptance.signed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-gray-600">
                          {acceptance.ip_address || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {acceptance.pdf_url && acceptance.pdf_url.trim() !== '' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Salvo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Não salvo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {acceptance.pdf_url && acceptance.pdf_url.trim() !== '' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(
                                acceptance.pdf_url!,
                                acceptance.partner?.name || 'Parceiro',
                                acceptance.terms_version
                              )}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              title="PDF não disponível"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              N/A
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(acceptance.document_hash);
                              toast({
                                title: 'Hash copiado',
                                description: 'Hash do documento copiado para a área de transferência',
                              });
                            }}
                          >
                            Hash
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

