
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Filter, Calendar, MapPin, User } from "lucide-react";
import { TouristRoute } from "@/types/passport";

interface RouteCompletionsProps {
  routes: TouristRoute[];
  userRegion?: string;
}

interface CompletionRecord {
  id: string;
  user_name: string;
  user_email: string;
  route_name: string;
  completed_at: string;
  completion_time_minutes: number;
  checkpoints_completed: number;
  total_checkpoints: number;
}

const RouteCompletions = ({ routes, userRegion }: RouteCompletionsProps) => {
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [filteredCompletions, setFilteredCompletions] = useState<CompletionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    route: "",
    dateFrom: "",
    dateTo: "",
  });

  // Mock data para demonstração
  useEffect(() => {
    const mockCompletions: CompletionRecord[] = [
      {
        id: "1",
        user_name: "João Silva",
        user_email: "joao@email.com",
        route_name: "Roteiro da Natureza",
        completed_at: "2024-01-15T14:30:00Z",
        completion_time_minutes: 120,
        checkpoints_completed: 5,
        total_checkpoints: 5,
      },
      {
        id: "2",
        user_name: "Maria Santos",
        user_email: "maria@email.com",
        route_name: "Aventura no Pantanal",
        completed_at: "2024-01-16T10:15:00Z",
        completion_time_minutes: 180,
        checkpoints_completed: 4,
        total_checkpoints: 6,
      },
      {
        id: "3",
        user_name: "Pedro Costa",
        user_email: "pedro@email.com",
        route_name: "Roteiro da Natureza",
        completed_at: "2024-01-17T16:45:00Z",
        completion_time_minutes: 95,
        checkpoints_completed: 5,
        total_checkpoints: 5,
      },
    ];
    setCompletions(mockCompletions);
    setFilteredCompletions(mockCompletions);
  }, []);

  useEffect(() => {
    let filtered = completions;

    if (filters.search) {
      filtered = filtered.filter(completion => 
        completion.user_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        completion.user_email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.route) {
      filtered = filtered.filter(completion => completion.route_name === filters.route);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(completion => 
        new Date(completion.completed_at) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(completion => 
        new Date(completion.completed_at) <= new Date(filters.dateTo)
      );
    }

    setFilteredCompletions(filtered);
  }, [filters, completions]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Nome", "Email", "Roteiro", "Data Conclusão", "Tempo (min)", "Pontos Visitados"],
      ...filteredCompletions.map(completion => [
        completion.user_name,
        completion.user_email,
        completion.route_name,
        new Date(completion.completed_at).toLocaleDateString('pt-BR'),
        completion.completion_time_minutes.toString(),
        `${completion.checkpoints_completed}/${completion.total_checkpoints}`,
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conclusoes-roteiros-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCompletionStatus = (completed: number, total: number) => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) {
      return { label: "Concluído", color: "bg-green-100 text-green-800" };
    } else if (percentage >= 50) {
      return { label: "Em Progresso", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "Iniciado", color: "bg-blue-100 text-blue-800" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.route} onValueChange={(value) => handleFilterChange("route", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os roteiros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os roteiros</SelectItem>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route.name}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Data inicial"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />

            <Input
              type="date"
              placeholder="Data final"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleExportCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Conclusões</p>
                <p className="text-2xl font-bold">
                  {filteredCompletions.filter(c => c.checkpoints_completed === c.total_checkpoints).length}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Progresso</p>
                <p className="text-2xl font-bold">
                  {filteredCompletions.filter(c => c.checkpoints_completed > 0 && c.checkpoints_completed < c.total_checkpoints).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold">
                  {Math.round(filteredCompletions.reduce((sum, c) => sum + c.completion_time_minutes, 0) / filteredCompletions.length || 0)}min
                </p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Conclusões */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Conclusões</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Roteiro</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompletions.map((completion) => {
                const status = getCompletionStatus(completion.checkpoints_completed, completion.total_checkpoints);
                return (
                  <TableRow key={completion.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{completion.user_name}</div>
                        <div className="text-sm text-gray-500">{completion.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{completion.route_name}</TableCell>
                    <TableCell>
                      {new Date(completion.completed_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{completion.completion_time_minutes}min</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(completion.checkpoints_completed / completion.total_checkpoints) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm">
                          {completion.checkpoints_completed}/{completion.total_checkpoints}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredCompletions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conclusão encontrada com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteCompletions;
