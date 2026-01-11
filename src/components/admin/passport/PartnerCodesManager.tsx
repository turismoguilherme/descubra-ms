import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Key, RefreshCw, Eye, EyeOff, Copy, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { partnerCodeService } from '@/services/passport/partnerCodeService';
import { supabase } from '@/integrations/supabase/client';

interface PartnerCode {
  checkpoint_id: string;
  checkpoint_name: string;
  partner_code: string;
  partner_name?: string;
  usage_count: number;
}

const PartnerCodesManager: React.FC = () => {
  const [codes, setCodes] = useState<PartnerCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [routes, setRoutes] = useState<Array<{id: string, name: string}>>([]);
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Carregar rotas disponíveis
  useEffect(() => {
    const loadRoutes = async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setRoutes(data);
      }
    };
    loadRoutes();
  }, []);

  // Carregar códigos
  const loadCodes = async () => {
    setLoading(true);
    try {
      const routeFilter = selectedRoute === 'all' ? undefined : selectedRoute;
      const codesData = await partnerCodeService.getPartnerCodes(routeFilter);
      setCodes(codesData);
    } catch (error) {
      console.error('Erro ao carregar códigos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os códigos dos parceiros.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, [selectedRoute]);

  // Gerar código para checkpoint
  const generateCode = async (checkpointId: string) => {
    setGenerating(checkpointId);
    try {
      const newCode = await partnerCodeService.generatePartnerCode(checkpointId);
      toast({
        title: 'Código gerado!',
        description: `Novo código: ${newCode}`,
      });
      await loadCodes(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o código.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  // Copiar código
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência.',
    });
  };

  // Toggle visibilidade do código
  const toggleCodeVisibility = (checkpointId: string) => {
    setShowCodes(prev => ({
      ...prev,
      [checkpointId]: !prev[checkpointId]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            Gerenciamento de Códigos de Parceiros
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie códigos para validação de checkpoints. Cada parceiro pode usar o mesmo código em múltiplos roteiros ou códigos diferentes para cada checkpoint.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="route-filter">Filtrar por Rota</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Todas as rotas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as rotas</SelectItem>
                  {routes.map(route => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadCodes} variant="outline" className="mt-6">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* Tabela de códigos */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando códigos...</span>
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum código de parceiro encontrado.</p>
              <p className="text-sm">Configure códigos para checkpoints de parceiros.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Checkpoint</TableHead>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.checkpoint_id}>
                    <TableCell className="font-medium">
                      {code.checkpoint_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {code.partner_name || 'Não definido'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                          {showCodes[code.checkpoint_id] ? code.partner_code : '••••••'}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCodeVisibility(code.checkpoint_id)}
                        >
                          {showCodes[code.checkpoint_id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.usage_count > 0 ? "default" : "secondary"}>
                        {code.usage_count} uso{code.usage_count !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyCode(code.partner_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateCode(code.checkpoint_id)}
                          disabled={generating === code.checkpoint_id}
                        >
                          {generating === code.checkpoint_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Flexibilidade:</strong> O mesmo parceiro pode usar o mesmo código em diferentes roteiros ou códigos únicos por checkpoint.
          </div>
          <div>
            <strong>2. Geração:</strong> Clique no botão de refresh para gerar um novo código automaticamente ou digite manualmente.
          </div>
          <div>
            <strong>3. Distribuição:</strong> Compartilhe o código com o estabelecimento parceiro - eles podem reutilizar o mesmo código em múltiplos roteiros.
          </div>
          <div>
            <strong>4. Validação:</strong> O usuário solicita o código no estabelecimento para validar o checkpoint.
          </div>
          <div>
            <strong>5. Segurança:</strong> Cada código pode ser usado apenas uma vez por usuário por checkpoint.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerCodesManager;


