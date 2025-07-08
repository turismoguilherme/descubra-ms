
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Download,
  TrendingUp,
  Users,
  Clock,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { catAIService, CATAIQuery } from "@/services/catAIService";
import { useToast } from "@/hooks/use-toast";

const CATAIManagement = () => {
  const [queries, setQueries] = useState<CATAIQuery[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<CATAIQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadQueries();
  }, []);

  useEffect(() => {
    filterQueries();
  }, [queries, searchTerm, locationFilter, feedbackFilter]);

  const loadQueries = async () => {
    try {
      setIsLoading(true);
      const data = await catAIService.getAllQueries();
      setQueries(data);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar o histórico de consultas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterQueries = () => {
    let filtered = queries;

    if (searchTerm) {
      filtered = filtered.filter(query => 
        query.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.response.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.attendant_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(query => query.cat_location === locationFilter);
    }

    if (feedbackFilter !== "all") {
      if (feedbackFilter === "positive") {
        filtered = filtered.filter(query => query.feedback_useful === true);
      } else if (feedbackFilter === "negative") {
        filtered = filtered.filter(query => query.feedback_useful === false);
      } else if (feedbackFilter === "no-feedback") {
        filtered = filtered.filter(query => query.feedback_useful === null);
      }
    }

    setFilteredQueries(filtered);
  };

  const getUniqueLocations = () => {
    const locations = queries
      .map(q => q.cat_location)
      .filter(Boolean)
      .filter((location, index, self) => self.indexOf(location) === index);
    return locations;
  };

  const getStats = () => {
    const total = queries.length;
    const positiveeFeedback = queries.filter(q => q.feedback_useful === true).length;
    const negativeFeedback = queries.filter(q => q.feedback_useful === false).length;
    const uniqueAttendants = new Set(queries.map(q => q.attendant_id)).size;
    
    return {
      total,
      positiveeFeedback,
      negativeFeedback,
      uniqueAttendants,
      satisfactionRate: total > 0 ? Math.round((positiveeFeedback / (positiveeFeedback + negativeFeedback)) * 100) : 0
    };
  };

  const exportData = () => {
    const csvContent = [
      ["Data", "Atendente", "CAT", "Pergunta", "Resposta", "Feedback", "Fonte"].join(","),
      ...filteredQueries.map(query => [
        new Date(query.created_at).toLocaleString('pt-BR'),
        query.attendant_name,
        query.cat_location || "",
        `"${query.question}"`,
        `"${query.response}"`,
        query.feedback_useful === true ? "Positivo" : query.feedback_useful === false ? "Negativo" : "Sem feedback",
        query.response_source || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consultas-ai-cat-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-ms-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consultas da IA - CATs</h2>
          <p className="text-gray-600">Histórico de perguntas e respostas dos atendentes</p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Consultas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atendentes Ativos</p>
                <p className="text-2xl font-bold">{stats.uniqueAttendants}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Satisfação</p>
                <p className="text-2xl font-bold">{stats.satisfactionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média Diária</p>
                <p className="text-2xl font-bold">
                  {Math.round(stats.total / Math.max(1, Math.ceil((Date.now() - new Date(queries[queries.length - 1]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))))}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por pergunta, resposta ou atendente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as localizações</SelectItem>
                {getUniqueLocations().map(location => (
                  <SelectItem key={location} value={location!}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por feedback" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os feedbacks</SelectItem>
                <SelectItem value="positive">Feedback positivo</SelectItem>
                <SelectItem value="negative">Feedback negativo</SelectItem>
                <SelectItem value="no-feedback">Sem feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queries List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Histórico de Consultas ({filteredQueries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredQueries.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma consulta encontrada com os filtros aplicados.
              </p>
            ) : (
              filteredQueries.map((query) => (
                <div key={query.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{query.attendant_name}</Badge>
                        {query.cat_location && (
                          <Badge variant="secondary">{query.cat_location}</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(query.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 mb-2">
                        Pergunta: "{query.question}"
                      </p>
                      <p className="text-gray-700 text-sm mb-2">
                        Resposta: {query.response}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {query.response_source || 'Sistema'}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      {query.feedback_useful === true && (
                        <div className="flex items-center gap-1 text-green-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs">Útil</span>
                        </div>
                      )}
                      {query.feedback_useful === false && (
                        <div className="flex items-center gap-1 text-red-600">
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-xs">Não útil</span>
                        </div>
                      )}
                      {query.feedback_useful === null && (
                        <span className="text-xs text-gray-400">Sem feedback</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CATAIManagement;
