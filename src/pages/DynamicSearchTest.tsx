import React, { useState } from 'react';
import { dynamicWebSearchService, SearchAnalysis } from '@/services/ai/search/dynamicWebSearchService';

const DynamicSearchTest: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      console.log('🔍 Iniciando busca dinâmica:', query);
      const analysis = await dynamicWebSearchService.search(query);
      setResults(analysis);
      console.log('✅ Análise completa:', analysis);
    } catch (error) {
      console.error('❌ Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStats = () => {
    const stats = dynamicWebSearchService.getStats();
    setStats(stats);
    console.log('📊 Estatísticas:', stats);
  };

  const handleClearCache = () => {
    dynamicWebSearchService.clearCache();
    setResults(null);
    setStats(null);
    console.log('🧹 Cache limpo');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🔍 Teste de Busca Dinâmica Inteligente
        </h1>
        
        <p className="text-gray-600 mb-6">
          Sistema que busca em múltiplas fontes automaticamente, analisa o conteúdo e verifica a confiabilidade - como o Gemini!
        </p>

        {/* Controles */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite sua pergunta (ex: hotéis em Campo Grande, atrações de Bonito, restaurantes...)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '🔍 Buscando...' : '🔍 Buscar'}
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={handleGetStats}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📊 Estatísticas
          </button>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            🧹 Limpar Cache
          </button>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">📊 Estatísticas do Sistema</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Cache:</span> {stats.cacheSize} itens
              </div>
              <div>
                <span className="font-medium">Buscas:</span> {stats.totalSearches}
              </div>
              <div>
                <span className="font-medium">Confiança Média:</span> {stats.averageConfidence}%
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {results && (
          <div className="space-y-6">
            {/* Resposta Principal */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                ✅ Melhor Resposta ({results.confidence}% confiança)
              </h3>
              <p className="text-gray-700 mb-3">{results.bestAnswer}</p>
              <div className="text-sm text-gray-600">
                <strong>Fontes:</strong> {results.sources.join(', ')}
              </div>
            </div>

            {/* Análise Detalhada */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">📋 Análise Detalhada</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-4 rounded border">
                {results.analysis}
              </pre>
            </div>

            {/* Resultados Individuais */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">
                🔍 Resultados por Fonte ({results.results.length} fontes)
              </h3>
              <div className="space-y-4">
                {results.results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-blue-600">{result.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.reliability === 'high' ? 'bg-green-100 text-green-800' :
                          result.reliability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.reliability}
                        </span>
                        <span className="text-sm text-gray-600">
                          {result.confidence}% confiança
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{result.content}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Fonte: {result.source}</span>
                      <span>Oficial: {result.isOfficial ? '✅' : '❌'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exemplos */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            💡 Exemplos de Perguntas para Testar
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">🏨 Hotéis:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• "Hotéis em Campo Grande"</li>
                <li>• "Hospedagem em Bonito"</li>
                <li>• "Pousadas no Pantanal"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🍽️ Restaurantes:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• "Restaurantes em Campo Grande"</li>
                <li>• "Onde comer sobá"</li>
                <li>• "Comida típica de MS"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Atrações:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• "O que fazer em Bonito"</li>
                <li>• "Bioparque Pantanal horário"</li>
                <li>• "Gruta do Lago Azul"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📅 Eventos:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• "Eventos em MS"</li>
                <li>• "Festival de Bonito"</li>
                <li>• "Carnaval de Corumbá"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicSearchTest; 