import React from 'react';
import { Edit, Trash2, MapPin, Phone, Mail, Globe, Star, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TourismInventory } from '@/services/inventory/inventoryService';

interface InventoryListProps {
  items: TourismInventory[];
  loading: boolean;
  onEdit: (item: TourismInventory) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  loading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'draft': return 'Rascunho';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const getPriceRangeLabel = (priceRange?: string) => {
    switch (priceRange) {
      case 'free': return 'Gratuito';
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      default: return 'Não informado';
    }
  };

  const getPriceRangeColor = (priceRange?: string) => {
    switch (priceRange) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MapPin className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum item encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou adicionar novos itens ao inventário.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {/* Image */}
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Sem imagem
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {item.short_description || item.description}
                    </p>
                    
                    {/* Location */}
                    {item.address && (
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="truncate">{item.address}</span>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="flex items-center space-x-4 text-gray-500 text-sm mb-3">
                      {item.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                      {item.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span className="truncate">{item.email}</span>
                        </div>
                      )}
                      {item.website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          <span className="truncate">Website</span>
                        </div>
                      )}
                    </div>

                    {/* Tags and Info */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                      
                      {item.category && (
                        <Badge variant="outline">
                          {item.category.name}
                        </Badge>
                      )}
                      
                      {item.subcategory && (
                        <Badge variant="outline">
                          {item.subcategory.name}
                        </Badge>
                      )}
                      
                      <Badge className={getPriceRangeColor(item.price_range)}>
                        {getPriceRangeLabel(item.price_range)}
                      </Badge>
                      
                      {item.is_featured && (
                        <Badge className="bg-cyan-100 text-cyan-800">
                          Destaque
                        </Badge>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                      {item.average_rating && item.average_rating > 0 && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          <span>{item.average_rating.toFixed(1)}</span>
                          <span className="ml-1">({item.review_count} avaliações)</span>
                        </div>
                      )}
                      
                      {item.capacity && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Capacidade: {item.capacity}</span>
                        </div>
                      )}
                      
                      {item.opening_hours && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Horários disponíveis</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isCurrentPage = page === currentPage;
              const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
              const isFirstPage = page === 1;
              const isLastPage = page === totalPages;
              
              if (!isNearCurrentPage && !isFirstPage && !isLastPage) {
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              }
              
              return (
                <Button
                  key={page}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={isCurrentPage ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
};
