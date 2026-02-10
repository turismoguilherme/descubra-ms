// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, DollarSign, X, Search, Copy, Filter, Calendar, FileText, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PartnerPricingWizard from './PartnerPricingWizard';

interface PartnerPricing {
  id: string;
  partner_id: string;
  service_type: 'hotel' | 'restaurant' | 'tour' | 'transport' | 'attraction' | 'other';
  service_name: string;
  pricing_type: 'fixed' | 'per_person' | 'per_night' | 'package';
  base_price: number;
  price_per_person?: number;
  price_per_night?: number;
  min_guests: number;
  max_guests?: number;
  description?: string;
  gallery_images?: string[];
  is_active: boolean;
}

interface PartnerPricingEditorProps {
  partnerId: string;
  onUpdate?: () => void;
}

export default function PartnerPricingEditor({ partnerId, onUpdate }: PartnerPricingEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pricingList, setPricingList] = useState<PartnerPricing[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<PartnerPricing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadPricing();
  }, [partnerId]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_pricing')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPricingList(data || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar preços:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os preços',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este preço?')) return;

    try {
      const { error } = await supabase
        .from('partner_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Excluído',
        description: 'Preço excluído com sucesso',
      });

      loadPricing();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao excluir:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o preço',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (pricing: PartnerPricing) => {
    setEditingPricing(pricing);
    setWizardOpen(true);
  };

  const handleWizardSuccess = () => {
    setWizardOpen(false);
    setEditingPricing(null);
    loadPricing();
    if (onUpdate) onUpdate();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_pricing')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      loadPricing();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao atualizar status:', err);
    }
  };

  const getPricingTypeLabel = (type: string) => {
    const labels = {
      fixed: 'Preço Fixo',
      per_person: 'Por Pessoa',
      per_night: 'Por Noite',
      package: 'Pacote',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getServiceTypeLabel = (type: string) => {
    const labels = {
      hotel: 'Hotel',
      restaurant: 'Restaurante',
      tour: 'Tour',
      transport: 'Transporte',
      attraction: 'Atrativo',
      other: 'Outro',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleDuplicate = async (pricing: PartnerPricing) => {
    try {
      const { data, error } = await supabase
        .from('partner_pricing')
        .insert({
          partner_id: partnerId,
          service_type: pricing.service_type,
          service_name: `${pricing.service_name} (Cópia)`,
          pricing_type: pricing.pricing_type,
          base_price: pricing.base_price,
          price_per_person: pricing.price_per_person || null,
          price_per_night: pricing.price_per_night || null,
          min_guests: pricing.min_guests,
          max_guests: pricing.max_guests || null,
          description: pricing.description || null,
          gallery_images: pricing.gallery_images || [],
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Produto duplicado',
        description: 'Produto duplicado com sucesso',
      });

      loadPricing();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao duplicar:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar o produto',
        variant: 'destructive',
      });
    }
  };

  // Filtrar produtos por busca e categoria
  const filteredPricingList = pricingList.filter((pricing) => {
    const matchesSearch = searchQuery === '' || 
      pricing.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pricing.description && pricing.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || pricing.service_type === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
        <p className="text-gray-500">Carregando preços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">Preços e Disponibilidade</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Crie produtos/serviços com preço, disponibilidade e política de cancelamento. Configure tudo em um fluxo guiado.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Configure os preços dos seus serviços para que clientes possam reservar diretamente
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPricing(null);
            setWizardOpen(true);
          }}
          className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Preço
        </Button>
      </div>

      {/* Wizard Modal */}
      <PartnerPricingWizard
        open={wizardOpen}
        onOpenChange={(open) => {
          setWizardOpen(open);
          if (!open) setEditingPricing(null);
        }}
        partnerId={partnerId}
        editingPricing={editingPricing}
        onSuccess={handleWizardSuccess}
      />

      {/* Filtros e Busca */}
      {pricingList.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtro por Categoria */}
              <div className="w-full md:w-48">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="restaurant">Restaurante</SelectItem>
                    <SelectItem value="tour">Tour</SelectItem>
                    <SelectItem value="transport">Transporte</SelectItem>
                    <SelectItem value="attraction">Atrativo</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {searchQuery || filterCategory !== 'all' ? (
              <p className="text-sm text-gray-500 mt-2">
                {filteredPricingList.length} de {pricingList.length} produtos encontrados
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Lista de Preços */}
      {pricingList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum preço cadastrado</p>
            <p className="text-sm text-gray-400 mt-2">
              Adicione preços para que clientes possam reservar diretamente
            </p>
          </CardContent>
        </Card>
      ) : filteredPricingList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum produto encontrado</p>
            <p className="text-sm text-gray-400 mt-2">
              Tente ajustar os filtros de busca ou categoria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
              }}
              className="mt-4"
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPricingList.map((pricing) => (
            <Card key={pricing.id} className="overflow-hidden">
              {/* Foto Principal */}
              {pricing.gallery_images && pricing.gallery_images.length > 0 ? (
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={pricing.gallery_images[0]}
                    alt={pricing.service_name}
                    className="w-full h-full object-cover"
                  />
                  {pricing.gallery_images.length > 1 && (
                    <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      +{pricing.gallery_images.length - 1}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pricing.service_name}</CardTitle>
                    <CardDescription className="mt-1">
                      {getServiceTypeLabel(pricing.service_type)} • {getPricingTypeLabel(pricing.pricing_type)}
                    </CardDescription>
                  </div>
                  <Badge variant={pricing.is_active ? 'default' : 'secondary'}>
                    {pricing.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-ms-primary-blue">
                    R$ {pricing.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {pricing.pricing_type === 'per_person' && pricing.price_per_person && (
                    <p className="text-sm text-gray-600">
                      + R$ {pricing.price_per_person.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por pessoa
                    </p>
                  )}
                  {pricing.pricing_type === 'per_night' && pricing.price_per_night && (
                    <p className="text-sm text-gray-600">
                      + R$ {pricing.price_per_night.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por noite
                    </p>
                  )}
                </div>

                {pricing.description && (
                  <p className="text-sm text-gray-600">{pricing.description}</p>
                )}

                <div className="text-xs text-gray-500">
                  {pricing.min_guests} {pricing.min_guests === 1 ? 'pessoa' : 'pessoas'}
                  {pricing.max_guests && ` até ${pricing.max_guests} pessoas`}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(pricing)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(pricing)}
                    title="Duplicar produto"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(pricing.id, pricing.is_active)}
                  >
                    {pricing.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(pricing.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
