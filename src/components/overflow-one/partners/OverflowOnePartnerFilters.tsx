import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface OverflowOnePartnerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  businessTypeFilter: string;
  onBusinessTypeChange: (value: string) => void;
  cityFilter: string;
  onCityChange: (value: string) => void;
  planFilter: string;
  onPlanChange: (value: string) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const businessTypes = [
  { value: '', label: 'Todos os tipos' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'consulting', label: 'Consultoria' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Desenvolvimento' },
  { value: 'infrastructure', label: 'Infraestrutura' },
  { value: 'security', label: 'Segurança' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'communication', label: 'Comunicação' },
  { value: 'other', label: 'Outros' }
];

const subscriptionPlans = [
  { value: '', label: 'Todos os planos' },
  { value: 'basic', label: 'Básico' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Enterprise' }
];

const OverflowOnePartnerFilters: React.FC<OverflowOnePartnerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  businessTypeFilter,
  onBusinessTypeChange,
  cityFilter,
  onCityChange,
  planFilter,
  onPlanChange,
  onClearFilters,
  isLoading = false
}) => {
  const hasActiveFilters = searchTerm || businessTypeFilter || cityFilter || planFilter;

  return (
    <div className="space-y-4">
      {/* Search and Main Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome da empresa, cidade ou descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={businessTypeFilter} onValueChange={onBusinessTypeChange} disabled={isLoading}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo de negócio" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Cidade..."
            value={cityFilter}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full sm:w-[150px]"
            disabled={isLoading}
          />

          <Select value={planFilter} onValueChange={onPlanChange} disabled={isLoading}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              {subscriptionPlans.map((plan) => (
                <SelectItem key={plan.value} value={plan.value}>
                  {plan.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Filtros ativos:</span>
          
          {searchTerm && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              <span>Busca: "{searchTerm}"</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-blue-200"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {businessTypeFilter && (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              <span>Tipo: {businessTypes.find(t => t.value === businessTypeFilter)?.label}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-green-200"
                onClick={() => onBusinessTypeChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {cityFilter && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
              <span>Cidade: "{cityFilter}"</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-purple-200"
                onClick={() => onCityChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {planFilter && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
              <span>Plano: {subscriptionPlans.find(p => p.value === planFilter)?.label}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-orange-200"
                onClick={() => onPlanChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            Limpar todos
          </Button>
        </div>
      )}

      {/* Results Summary */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Carregando parceiros...
          </div>
        </div>
      )}
    </div>
  );
};

export default OverflowOnePartnerFilters;





