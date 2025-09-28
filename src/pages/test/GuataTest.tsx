import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Globe, Instagram, CheckCircle, AlertCircle } from 'lucide-react';
import { webSearchService } from '@/services/ai/search/webSearchService';
import { ValidatedSearchResult } from '@/services/ai/search/webSearchTypes';

const GuataTest: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ValidatedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      console.log('🔍 Iniciando busca para:', query);
      const searchResults = await webSearchService.search(query);
      console.log('📦 Resultados encontrados:', searchResults);
      setResults(searchResults as ValidatedSearchResult[]);
    } catch (err) {
      console.error('❌ Erro na busca:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await webSearchService.clearCache();
      console.log('🧹 Cache limpo com sucesso');
    } catch (err) {
      console.error('❌ Erro ao limpar cache:', err);
    }
  };

  const getSourceIcon = (source: any) => {
    if (!source) return <Globe className="h-4 w-4" />;
    
    if (source.name?.toLowerCase().includes('instagram')) {
      return <Instagram className="h-4 w-4" />;
    }
    
    return <Globe className="h-4 w-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Teste de Busca Web - Guatá AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input de Busca */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua consulta (ex: restaurantes em Bonito, hotéis em Campo Grande...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              className="min-w-[100px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearCache}
              disabled={loading}
            >
              Limpar Cache
            </Button>
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Resultados */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Resultados ({results.length})
                </h3>
                <Badge variant="secondary">
                  Cache: {results.some(r => r.isVerified) ? 'Ativo' : 'Não usado'}
                </Badge>
              </div>
              
              <Separator />
              
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(result.source)}
                          <h4 className="font-medium text-lg">{result.title || 'Sem título'}</h4>
                          {result.isVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {result.snippet || result.content || 'Sem descrição disponível'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Fonte: {result.source?.name || result.source || 'Web'}</span>
                          <span>Categoria: {result.category}</span>
                          <span>Atualizado: {new Date(result.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        
                        {result.url && (
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Ver fonte original →
                          </a>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getConfidenceColor(result.confidence)}>
                          {Math.round(result.confidence * 100)}% confiança
                        </Badge>
                        
                        {result.isVerified && (
                          <Badge variant="outline" className="text-green-600">
                            Fonte Verificada
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Estado vazio */}
          {!loading && !error && results.length === 0 && query && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum resultado encontrado para "{query}"</p>
              <p className="text-sm">Tente uma consulta diferente ou verifique se há conexão com a internet.</p>
            </div>
          )}

          {/* Instruções */}
          {!loading && !error && results.length === 0 && !query && (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Como usar este teste</h3>
              <p className="text-sm mb-4">
                Digite uma consulta relacionada ao turismo em Mato Grosso do Sul para testar 
                a busca web do Guatá AI.
              </p>
              <div className="text-xs space-y-1">
                <p><strong>Exemplos:</strong></p>
                <p>• "restaurantes em Bonito"</p>
                <p>• "hotéis em Campo Grande"</p>
                <p>• "passeios no Pantanal"</p>
                <p>• "eventos em MS"</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuataTest;


