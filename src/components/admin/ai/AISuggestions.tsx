import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle, XCircle, Clock } from 'lucide-react';
import { aiAdminService } from '@/services/admin/aiAdminService';
import { useToast } from '@/hooks/use-toast';
import { AIAdminAction } from '@/types/admin';

export default function AISuggestions() {
  const [suggestions, setSuggestions] = useState<AIAdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const data = await aiAdminService.getActions('pending' as any);
      setSuggestions((data || []) as AIAdminAction[]);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar sugestões',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await aiAdminService.approveAction(id, user.id);
        toast({ title: 'Sucesso', description: 'Sugestão aprovada' });
        fetchSuggestions();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao aprovar sugestão',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await aiAdminService.rejectAction(id);
      toast({ title: 'Sucesso', description: 'Sugestão rejeitada' });
      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao rejeitar sugestão',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sugestões da IA</h2>
        <p className="text-gray-600 mt-1">Sugestões automáticas baseadas em análise de dados</p>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Nenhuma sugestão disponível no momento
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{suggestion.description}</CardTitle>
                      <CardDescription className="mt-1">
                        {suggestion.platform && `Plataforma: ${suggestion.platform}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={suggestion.status === 'approved' ? 'default' : 'secondary'}>
                    {suggestion.status}
                  </Badge>
                </div>
              </CardHeader>
              {suggestion.status === 'pending' && (
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(suggestion.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(suggestion.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
