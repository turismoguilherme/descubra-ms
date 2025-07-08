
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Search } from "lucide-react";

interface SuggestionManagerProps {
  region: string;
}

// Mock data - in a real app this would come from an API
const mockSuggestions = [
  {
    id: "1",
    name: "João Silva",
    type: "Morador",
    region: "campo-grande",
    suggestion: "Roteiro cultural incluindo visita guiada ao Mercado Municipal e Centro Histórico",
    date: "2025-05-08",
    status: "pending"
  },
  {
    id: "2",
    name: "Maria Oliveira",
    type: "Colaborador",
    region: "pantanal",
    suggestion: "Criar um observatório de aves no Porto da Manga com guias especializados",
    date: "2025-05-07",
    status: "approved"
  },
  {
    id: "3",
    name: "Carlos Neves",
    type: "Morador",
    region: "bonito",
    suggestion: "Implementar um sistema de transporte entre atrativos para reduzir o uso de carros",
    date: "2025-05-06",
    status: "rejected"
  },
  {
    id: "4",
    name: "Ana Pereira",
    type: "Colaborador",
    region: "caminhos-dos-ipes",
    suggestion: "Festival de artesanato regional itinerante conectando as cidades do Caminho dos Ipês",
    date: "2025-05-05",
    status: "pending"
  },
];

const SuggestionManager = ({ region }: SuggestionManagerProps) => {
  const [search, setSearch] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState(mockSuggestions);

  const handleSearch = () => {
    const filtered = mockSuggestions.filter(suggestion =>
      (region === "all" || suggestion.region === region) &&
      (suggestion.suggestion.toLowerCase().includes(search.toLowerCase()) ||
       suggestion.name.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredSuggestions(filtered);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    console.log(`Alterando sugestão ${id} para status ${newStatus}`);
    // In a real app, this would update the status via API
    setFilteredSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, status: newStatus } : s)
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aprovada</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejeitada</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Gerenciar Sugestões</h3>
        <div className="flex space-x-2">
          <Input
            placeholder="Pesquisar sugestões..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search size={18} />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Região</TableHead>
              <TableHead className="w-1/3">Sugestão</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuggestions
              .filter(s => region === "all" || s.region === region)
              .map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell>{suggestion.name}</TableCell>
                  <TableCell>{suggestion.type}</TableCell>
                  <TableCell>{suggestion.region}</TableCell>
                  <TableCell className="max-w-sm truncate" title={suggestion.suggestion}>
                    {suggestion.suggestion}
                  </TableCell>
                  <TableCell>{new Date(suggestion.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {suggestion.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-green-600" 
                            onClick={() => handleStatusChange(suggestion.id, 'approved')}
                          >
                            <Check size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600" 
                            onClick={() => handleStatusChange(suggestion.id, 'rejected')}
                          >
                            <X size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SuggestionManager;
