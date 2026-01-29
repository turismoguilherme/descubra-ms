import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Image as ImageIcon, 
  Calendar, 
  FileText,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

interface CancellationPolicy {
  id: string;
  days_before_7_refund_percent: number;
  days_before_1_2_refund_percent: number;
  days_before_0_refund_percent: number;
  name: string;
  description?: string;
}

interface PartnerPricingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  editingPricing?: PartnerPricing | null;
  onSuccess?: () => void;
}

type WizardStep = 1 | 2 | 3;

export default function PartnerPricingWizard({
  open,
  onOpenChange,
  partnerId,
  editingPricing,
  onSuccess,
}: PartnerPricingWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Etapa 1: Informações do Preço
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
    gallery_images: [],
    is_active: true,
  });
  
  // Etapa 2: Disponibilidade
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [availabilityDates, setAvailabilityDates] = useState<Map<string, { available: boolean; max_guests?: number }>>(new Map());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [skipAvailability, setSkipAvailability] = useState(false);
  
  // Etapa 3: Política de Cancelamento
  const [defaultPolicy, setDefaultPolicy] = useState<CancellationPolicy | null>(null);
  const [customPolicy, setCustomPolicy] = useState<CancellationPolicy | null>(null);
  const [activePolicy, setActivePolicy] = useState<CancellationPolicy | null>(null);

  useEffect(() => {
    if (open) {
      if (editingPricing) {
        setFormData({
          ...editingPricing,
          gallery_images: editingPricing.gallery_images || [],
        });
        setSelectedServiceId(editingPricing.id);
      } else {
        resetForm();
      }
      setCurrentStep(1);
      loadDefaultPolicy();
    }
  }, [open, editingPricing]);

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
      gallery_images: [],
      is_active: true,
    });
    setSelectedServiceId(null);
    setAvailabilityDates(new Map());
    setSkipAvailability(false);
  };

  const loadDefaultPolicy = async () => {
    try {
      // Verificar se parceiro tem política personalizada
      const { data: custom } = await supabase
        .from('partner_cancellation_policies')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (custom) {
        setCustomPolicy(custom);
        setActivePolicy(custom);
      } else {
        // Buscar política padrão
        const { data: defaultData } = await supabase
          .from('partner_cancellation_policies')
          .select('*')
          .is('partner_id', null)
          .eq('is_default', true)
          .eq('is_active', true)
          .maybeSingle();
        
        if (defaultData) {
          setDefaultPolicy(defaultData);
          setActivePolicy(defaultData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar políticas:', error);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const maxImages = 5;
    if (formData.gallery_images && formData.gallery_images.length + files.length > maxImages) {
      toast({
        title: 'Limite de fotos',
        description: `Você pode adicionar no máximo ${maxImages} fotos por produto`,
        variant: 'destructive',
      });
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length && i < maxImages; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${partnerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('partner-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('partner-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData({
        ...formData,
        gallery_images: [...(formData.gallery_images || []), ...uploadedUrls],
      });

      toast({
        title: 'Fotos adicionadas',
        description: `${uploadedUrls.length} foto(s) adicionada(s) com sucesso`,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao fazer upload:', err);
      toast({
        title: 'Erro ao fazer upload',
        description: err.message || 'Não foi possível fazer upload das fotos',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.gallery_images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, gallery_images: newImages });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validar etapa 1
      if (!formData.service_name || !formData.base_price) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Preencha nome do serviço e preço base',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Salvar preço
      let savedPricingId: string;

      if (editingPricing) {
        const { data, error } = await supabase
          .from('partner_pricing')
          .update({
            ...formData,
            gallery_images: formData.gallery_images || [],
          })
          .eq('id', editingPricing.id)
          .select()
          .single();

        if (error) throw error;
        savedPricingId = data.id;
      } else {
        const { data, error } = await supabase
          .from('partner_pricing')
          .insert({
            ...formData,
            partner_id: partnerId,
            gallery_images: formData.gallery_images || [],
          })
          .select()
          .single();

        if (error) throw error;
        savedPricingId = data.id;
      }

      // Salvar disponibilidade (se configurada)
      if (!skipAvailability && savedPricingId && availabilityDates.size > 0) {
        const availabilityEntries = Array.from(availabilityDates.entries())
          .filter(([_, config]) => config.available !== undefined) // Apenas datas configuradas
          .map(([date, config]) => ({
            partner_id: partnerId,
            service_id: savedPricingId,
            date,
            available: config.available,
            max_guests: config.max_guests || null,
          }));

        if (availabilityEntries.length > 0) {
          const { error: availError } = await supabase
            .from('partner_availability')
            .upsert(availabilityEntries, {
              onConflict: 'partner_id,service_id,date',
            });

          if (availError) {
            console.warn('Erro ao salvar disponibilidade:', availError);
          } else {
            console.log('Disponibilidade salva com sucesso');
          }
        }
      }

      toast({
        title: 'Sucesso',
        description: editingPricing ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso',
      });

      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível salvar o produto',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hotel: 'Hotel',
      restaurant: 'Restaurante',
      tour: 'Tour',
      transport: 'Transporte',
      attraction: 'Atrativo',
      other: 'Outro',
    };
    return labels[type] || type;
  };

  const getPricingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fixed: 'Preço Fixo',
      per_person: 'Por Pessoa',
      per_night: 'Por Noite',
      package: 'Pacote',
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {editingPricing ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {currentStep === 1 && 'Informações básicas do produto/serviço'}
                {currentStep === 2 && 'Configure a disponibilidade por data'}
                {currentStep === 3 && 'Defina a política de cancelamento (opcional)'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Etapa {currentStep} de 3
              </span>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  'flex-1 h-2 rounded-full',
                  step <= currentStep ? 'bg-ms-primary-blue' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="mt-6">
          {/* ETAPA 1: Informações do Preço */}
          {currentStep === 1 && (
            <div className="space-y-6">
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

              {/* Upload de Fotos */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="gallery_images">Fotos do Produto (máximo 5)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Adicione até 5 fotos do seu produto/serviço. A primeira foto será a foto principal.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {(formData.gallery_images || []).map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">Principal</Badge>
                      )}
                    </div>
                  ))}
                  
                  {(formData.gallery_images?.length || 0) < 5 && (
                    <label className="cursor-pointer">
                      <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-ms-primary-blue transition-colors">
                        {uploadingImages ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ms-primary-blue mx-auto mb-1"></div>
                            <p className="text-xs text-gray-500">Enviando...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Adicionar</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        disabled={uploadingImages}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {(formData.gallery_images?.length || 0)}/5 fotos adicionadas
                </p>
              </div>
            </div>
          )}

          {/* ETAPA 2: Disponibilidade */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-ms-primary-blue" />
                <h3 className="text-lg font-semibold">Disponibilidade</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Configure quais datas estão disponíveis e quantas vagas há. Se não configurar, todas as datas estarão disponíveis sem limite de vagas.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 mb-1">Disponibilidade Opcional</p>
                    <p className="text-sm text-yellow-800">
                      Você pode configurar a disponibilidade agora ou depois. Se não configurar, todas as datas estarão disponíveis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="skip_availability"
                  checked={skipAvailability}
                  onChange={(e) => setSkipAvailability(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="skip_availability" className="cursor-pointer">
                  Pular esta etapa e configurar depois
                </Label>
              </div>

              {!skipAvailability && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    Clique nas datas do calendário para configurar disponibilidade. Você pode fazer isso depois também na aba "Disponibilidade".
                  </p>
                  
                  {/* Navegação do mês */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      ← Mês Anterior
                    </Button>
                    <h4 className="text-lg font-semibold">
                      {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      Próximo Mês →
                    </Button>
                  </div>

                  {/* Calendário */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Cabeçalho dos dias da semana */}
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}

                    {/* Dias do mês */}
                    {eachDayOfInterval({
                      start: startOfMonth(currentMonth),
                      end: endOfMonth(currentMonth),
                    }).map((date) => {
                      const dateString = format(date, 'yyyy-MM-dd');
                      const config = availabilityDates.get(dateString);
                      const isPast = date < new Date();
                      const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                      return (
                        <button
                          key={dateString}
                          onClick={() => {
                            if (isPast) return;
                            const newConfig = {
                              available: config?.available ?? true,
                              max_guests: config?.max_guests,
                            };
                            setAvailabilityDates(new Map(availabilityDates.set(dateString, newConfig)));
                          }}
                          disabled={isPast}
                          className={cn(
                            'relative p-2 rounded-lg border-2 transition-all text-sm',
                            isPast && 'opacity-50 cursor-not-allowed',
                            !isPast && 'hover:border-ms-primary-blue cursor-pointer',
                            isToday && 'ring-2 ring-ms-primary-blue',
                            config?.available === false && 'bg-red-100 border-red-300',
                            config?.available === true && config?.max_guests && 'bg-yellow-50 border-yellow-300',
                            config?.available === true && !config?.max_guests && 'bg-green-50 border-green-200',
                            !config && 'bg-gray-50 border-gray-200'
                          )}
                        >
                          <div className="font-semibold">{format(date, 'd')}</div>
                          {config?.max_guests && (
                            <div className="text-xs mt-1 text-gray-600">
                              {config.max_guests} vagas
                            </div>
                          )}
                          {config?.available === false && (
                            <X className="w-3 h-3 absolute top-1 right-1 text-red-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Formulário de edição de data */}
                  {Array.from(availabilityDates.entries()).length > 0 && (
                    <div className="border rounded-lg p-4 space-y-2">
                      <p className="text-sm font-semibold mb-2">Datas configuradas:</p>
                      {Array.from(availabilityDates.entries()).map(([dateString, config]) => (
                        <div key={dateString} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">
                            {format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.available}
                              onChange={(e) => {
                                setAvailabilityDates(new Map(availabilityDates.set(dateString, {
                                  ...config,
                                  available: e.target.checked,
                                })));
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-600">Disponível</span>
                            {config.available && (
                              <>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="Vagas"
                                  value={config.max_guests || ''}
                                  onChange={(e) => {
                                    setAvailabilityDates(new Map(availabilityDates.set(dateString, {
                                      ...config,
                                      max_guests: e.target.value ? parseInt(e.target.value) : undefined,
                                    })));
                                  }}
                                  className="w-20 h-8 text-xs"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newMap = new Map(availabilityDates);
                                    newMap.delete(dateString);
                                    setAvailabilityDates(newMap);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Legenda */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded" />
                      <span>Disponível</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-300 rounded" />
                      <span>Com limite de vagas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
                      <span>Bloqueado</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 3: Política de Cancelamento */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-ms-primary-blue" />
                <h3 className="text-lg font-semibold">Política de Cancelamento</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>A política de cancelamento é aplicada automaticamente. Se você tiver uma política personalizada, ela será usada. Caso contrário, a política padrão da plataforma será aplicada automaticamente.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">Aplicação Automática</p>
                    <p className="text-sm text-green-800">
                      A política de cancelamento será aplicada automaticamente quando um cliente cancelar uma reserva. Você pode personalizar sua política na aba "Políticas" do dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {activePolicy && (
                <div className="border rounded-lg p-4 bg-white">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    Política que será aplicada:
                    {customPolicy ? (
                      <Badge variant="default" className="bg-ms-primary-blue">Personalizada</Badge>
                    ) : (
                      <Badge variant="secondary">Padrão da Plataforma</Badge>
                    )}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">7+ dias antes</p>
                      <p className="text-xl font-bold text-green-700">
                        {activePolicy.days_before_7_refund_percent}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">1-2 dias antes</p>
                      <p className="text-xl font-bold text-yellow-700">
                        {activePolicy.days_before_1_2_refund_percent}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">No dia ou após</p>
                      <p className="text-xl font-bold text-red-700">
                        {activePolicy.days_before_0_refund_percent}%
                      </p>
                    </div>
                  </div>
                  {customPolicy && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Esta é sua política personalizada. Para editar, vá na aba "Políticas".
                    </p>
                  )}
                  {!customPolicy && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Esta é a política padrão da plataforma. Você pode criar uma personalizada na aba "Políticas".
                    </p>
                  )}
                </div>
              )}

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 text-center">
                  💡 <strong>Dica:</strong> Você pode personalizar sua política de cancelamento a qualquer momento na aba "Políticas" do dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Navegação */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => onOpenChange(false) : handleBack}
            disabled={saving}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} className="bg-ms-primary-blue hover:bg-ms-primary-blue/90">
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
            >
              {saving ? 'Salvando...' : editingPricing ? 'Atualizar' : 'Criar Produto'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

