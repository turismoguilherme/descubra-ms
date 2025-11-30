import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source?: string;
}

const PassportDestinationSearch: React.FC<{ destinationName: string }> = ({ destinationName }) => {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const searchDestination = async () => {
    if (!destinationName) return;

    try {
      setSearching(true);
      // Usar a URL do Supabase do cliente
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hvtrpkbjgbuypkskqcqm.supabase.co';
      const response = await fetch(
        `${supabaseUrl}/functions/v1/guata-google-search-proxy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `${destinationName} turismo Mato Grosso do Sul`,
            maxResults: 5,
            location: 'Mato Grosso do Sul',
          }),
        }
      );

      if (!response.ok) throw new Error('Erro na busca');

      const data = await response.json();
      if (data.success && data.results) {
        setResults(data.results);
      } else {
        throw new Error(data.error || 'Nenhum resultado encontrado');
      }
    } catch (error: any) {
      console.error('Erro ao buscar informações:', error);
      toast({
        title: 'Erro na busca',
        description: error.message || 'Não foi possível buscar informações sobre o destino.',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  // Buscar automaticamente ao montar se houver nome do destino
  React.useEffect(() => {
    if (destinationName) {
      searchDestination();
    }
  }, [destinationName]);

  if (!destinationName) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Informações sobre {destinationName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {searching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Buscando informações...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-3 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-semibold mb-1">{result.title}</h4>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {result.snippet}
                </p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Ver mais <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Nenhuma informação encontrada. Tente novamente.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassportDestinationSearch;

