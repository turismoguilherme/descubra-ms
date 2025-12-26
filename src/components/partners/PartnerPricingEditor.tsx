import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, DollarSign, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  is_active: boolean;
}

interface PartnerPricingEditorProps {
  partnerId: string;
  onUpdate?: () => void;
}

export default function PartnerPricingEditor({ partnerId, onUpdate }: PartnerPricingEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricingList, setPricingList] = useState<PartnerPricing[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PartnerPricing>>({
    service_type: 'other',
    service_name: '',
    pricing_type: 'fixed',
    base_price: 0,
    price_per_person: undefined,
    price_per_night: undefined,
    min_guests: 1,
    max_guests: undefined,
    description: '',
    is_active: true,
  });

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
    } catch (error: any) {
      console.error('Erro ao carregar preços:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os preços',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.service_name || !formData.base_price) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome do serviço e preço base',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Atualizar existente
        const { error } = await supabase
          .from('partner_pricing')
          .update({
            service_type: formData.service_type,
            service_name: formData.service_name,
            pricing_type: formData.pricing_type,
            base_price: formData.base_price,
            price_per_person: formData.price_per_person || null,
            price_per_night: formData.price_per_night || null,
            min_guests: formData.min_guests || 1,
            max_guests: formData.max_guests || null,
            description: formData.description || null,
            is_active: formData.is_active !== false,
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Criar novo
        const { error } = await supabase
          .from('partner_pricing')
          .insert({
            partner_id: partnerId,
            service_type: formData.service_type,
            service_name: formData.service_name,
            pricing_type: formData.pricing_type,
            base_price: formData.base_price,
            price_per_person: formData.price_per_person || null,
            price_per_night: formData.price_per_night || null,
            min_guests: formData.min_guests || 1,
            max_guests: formData.max_guests || null,
            description: formData.description || null,
            is_active: true,
          });

        if (error) throw error;
      }

      toast({
        title: 'Salvo com sucesso!',
        description: 'Preço salvo com sucesso',
      });

      resetForm();
      loadPricing();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Erro ao salvar preço:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar o preço',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o preço',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (pricing: PartnerPricing) => {
    setFormData(pricing);
    setEditingId(pricing.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      service_type: 'other',
      service_name: '',
      pricing_type: 'fixed',
      base_price: 0,
      price_per_person: undefined,
      price_per_night: undefined,
      min_guests: 1,
      max_guests: undefined,
      description: '',
      is_active: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_pricing')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      loadPricing();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
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
          <h3 className="text-xl font-semibold text-gray-900">Preços e Disponibilidade</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure os preços dos seus serviços para que clientes possam reservar diretamente
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Preço
        </Button>
      </div>

      {/* Formulário de Adicionar/Editar */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingId ? 'Editar Preço' : 'Novo Preço'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_type">Tipo de Serviço</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData({ ...formData, service_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="restaurant">Restaurante</SelectItem>
                    <SelectItem value="tour">Tour</SelectItem>
                    <SelectItem value="transport">Transporte</SelectItem>
                    <SelectItem value="attraction">Atrativo</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service_name">Nome do Serviço *</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="Ex: Quarto Standard, Tour Pantanal, etc."
                />
              </div>

              <div>
                <Label htmlFor="pricing_type">Tipo de Preço</Label>
                <Select
                  value={formData.pricing_type}
                  onValueChange={(value) => setFormData({ ...formData, pricing_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Preço Fixo</SelectItem>
                    <SelectItem value="per_person">Por Pessoa</SelectItem>
                    <SelectItem value="per_night">Por Noite</SelectItem>
                    <SelectItem value="package">Pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="base_price">Preço Base (R$) *</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              {formData.pricing_type === 'per_person' && (
                <div>
                  <Label htmlFor="price_per_person">Preço por Pessoa (R$)</Label>
                  <Input
                    id="price_per_person"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_person || ''}
                    onChange={(e) => setFormData({ ...formData, price_per_person: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              )}

              {formData.pricing_type === 'per_night' && (
                <div>
                  <Label htmlFor="price_per_night">Preço por Noite (R$)</Label>
                  <Input
                    id="price_per_night"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_night || ''}
                    onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="min_guests">Mínimo de Pessoas</Label>
                <Input
                  id="min_guests"
                  type="number"
                  min="1"
                  value={formData.min_guests || 1}
                  onChange={(e) => setFormData({ ...formData, min_guests: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <Label htmlFor="max_guests">Máximo de Pessoas (opcional)</Label>
                <Input
                  id="max_guests"
                  type="number"
                  min="1"
                  value={formData.max_guests || ''}
                  onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o serviço, o que está incluído, etc."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pricingList.map((pricing) => (
            <Card key={pricing.id}>
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

                <div className="flex gap-2 pt-2 border-t">
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
