import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Map, List, Grid, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { inventoryService, TourismInventory, InventoryCategory, InventoryFilters, InventoryStats } from '@/services/inventory/inventoryService';
import { InventoryMap } from './InventoryMap';
import { InventoryList } from './InventoryList';
import { InventoryForm } from './InventoryForm';
import { InventoryStats as InventoryStatsComponent } from './InventoryStats';

export const InventoryManager: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<TourismInventory[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'grid'>('list');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TourismInventory | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({
    is_active: true,
    status: 'approved'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadInventoryItems();
  }, [filters, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesData, statsData] = await Promise.all([
        inventoryService.getCategories(),
        inventoryService.getStats()
      ]);

      setCategories(categoriesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * itemsPerPage;
      const items = await inventoryService.getInventoryItems(filters, itemsPerPage, offset);
      
      setInventoryItems(items);
      setTotalPages(Math.ceil((stats?.total_items || 0) / itemsPerPage));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar inventário');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        setLoading(true);
        const items = await inventoryService.searchInventory(query, filters);
        setInventoryItems(items);
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro na busca');
      } finally {
        setLoading(false);
      }
    } else {
      loadInventoryItems();
    }
  };

  const handleFilterChange = (key: keyof InventoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleItemSave = async (item: Partial<TourismInventory>) => {
    try {
      if (editingItem) {
        await inventoryService.updateInventoryItem(editingItem.id, item);
      } else {
        await inventoryService.createInventoryItem(item);
      }
      
      setShowForm(false);
      setEditingItem(null);
      loadInventoryItems();
      loadData(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar item');
    }
  };

  const handleItemEdit = (item: TourismInventory) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleItemDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await inventoryService.deleteInventoryItem(id);
        loadInventoryItems();
        loadData(); // Refresh stats
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir item');
      }
    }
  };

  const handleExport = async () => {
    try {
      const allItems = await inventoryService.getInventoryItems(filters, 1000, 0);
      const csvContent = convertToCSV(allItems);
      downloadCSV(csvContent, 'inventario-turistico.csv');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar dados');
    }
  };

  const convertToCSV = (items: TourismInventory[]): string => {
    const headers = [
      'Nome', 'Descrição', 'Categoria', 'Subcategoria', 'Endereço', 'Cidade', 'Estado',
      'Telefone', 'Email', 'Website', 'Faixa de Preço', 'Status', 'Destaque'
    ];
    
    const rows = items.map(item => [
      item.name,
      item.description || '',
      item.category?.name || '',
      item.subcategory?.name || '',
      item.address || '',
      item.city || '',
      item.state || '',
      item.phone || '',
      item.email || '',
      item.website || '',
      item.price_range || '',
      item.status,
      item.is_featured ? 'Sim' : 'Não'
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !inventoryItems.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando inventário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">Erro ao carregar inventário</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={loadData} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventário Turístico</h1>
          <p className="text-gray-600 mt-1">
            Gerencie atrativos, serviços e experiências turísticas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowForm(true)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && <InventoryStatsComponent stats={stats} />}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome, descrição..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Categoria
              </label>
              <Select
                value={filters.category_id || ''}
                onValueChange={(value) => handleFilterChange('category_id', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Destaque
              </label>
              <Select
                value={filters.is_featured?.toString() || ''}
                onValueChange={(value) => handleFilterChange('is_featured', value === 'true' ? true : value === 'false' ? false : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Em Destaque</SelectItem>
                  <SelectItem value="false">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'map' | 'grid')}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Grade
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-gray-600">
            {inventoryItems.length} de {stats?.total_items || 0} itens
          </div>
        </div>

        <TabsContent value="list" className="mt-4">
          <InventoryList
            items={inventoryItems}
            loading={loading}
            onEdit={handleItemEdit}
            onDelete={handleItemDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <InventoryMap
            items={inventoryItems}
            loading={loading}
            onItemClick={handleItemEdit}
          />
        </TabsContent>

        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventoryItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sem imagem
                    </div>
                  )}
                  {item.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-cyan-600">
                      Destaque
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.short_description || item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {item.category?.name}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleItemEdit(item)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <InventoryForm
          item={editingItem}
          categories={categories}
          onSave={handleItemSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};
