import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { msRegions } from "@/data/msRegions";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  clearFilters: () => void;
}

const UserFilters = ({
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  selectedRegion,
  setSelectedRegion,
  selectedStatus,
  setSelectedStatus,
  clearFilters
}: UserFiltersProps) => {
  const hasActiveFilters = selectedRole !== "all" || selectedRegion !== "all" || selectedStatus !== "all" || searchTerm !== "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={selectedRole} onValueChange={setSelectedRole}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por função" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Funções</SelectItem>
          <SelectItem value="admin">🔴 Administrador</SelectItem>
          <SelectItem value="tech">🟣 Técnico</SelectItem>
          <SelectItem value="gestor">🔵 Gestor Regional</SelectItem>
          <SelectItem value="municipal">🟢 Gestor Municipal</SelectItem>
          <SelectItem value="municipal_manager">🟢 Gerente Municipal</SelectItem>
          <SelectItem value="atendente">🟡 Atendente CAT</SelectItem>
          <SelectItem value="user">⚪ Usuário Comum</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por região" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Regiões</SelectItem>
          <SelectItem value="all_regions">🌐 Acesso Total</SelectItem>
          {Object.entries(msRegions).map(([key, name]) => (
            <SelectItem key={key} value={key}>
              📍 {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="active">✅ Ativos</SelectItem>
          <SelectItem value="inactive">❌ Inativos</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          {hasActiveFilters ? "Filtros Ativos" : "Filtros"}
        </Button>
      </div>
    </div>
  );
};

export default UserFilters;