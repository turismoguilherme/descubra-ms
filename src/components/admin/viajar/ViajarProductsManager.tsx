import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, Edit, Trash2, Image as ImageIcon, 
  Video, X, Upload, Loader2, Package
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as LucideIcons from 'lucide-react';

interface ViajarProduct {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  image_url: string | null;
  video_url: string | null;
  icon_name: string | null;
  gradient_colors: string | null;
  display_order: number;
  is_active: boolean;
  cta_text: string | null;
  cta_link: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const BUCKET_NAME = 'tourism-images';

// Ícones disponíveis (apenas alguns comuns)
const AVAILABLE_ICONS = [
  'Brain', 'TrendingUp', 'BarChart3', 'Map', 'Calendar', 
  'Building2', 'Shield', 'Globe', 'FileText', 'Sparkles'
];

// Gradientes comuns
const GRADIENT_OPTIONS = [
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-cyan-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600',
];

export default function ViajarProductsManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ViajarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ViajarProduct | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    full_description: '',
    image_url: '',
    video_url: '',
    icon_name: 'Brain',
    gradient_colors: 'from-purple-500 to-violet-600',
    display_order: 0,
    is_active: true,
    cta_text: 'Saiba mais',
    cta_link: '',
  });

  // Estados para imagem
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('viajar_products')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      short_description: '',
      full_description: '',
      image_url: '',
      video_url: '',
      icon_name: 'Brain',
      gradient_colors: 'from-purple-500 to-violet-600',
      display_order: products.length,
      is_active: true,
      cta_text: 'Saiba mais',
      cta_link: '',
    });
    setMainImageFile(null);
    setMainImagePreview(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product: ViajarProduct) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      short_description: product.short_description || '',
      full_description: product.full_description || '',
      image_url: product.image_url || '',
      video_url: product.video_url || '',
      icon_name: product.icon_name || 'Brain',
      gradient_colors: product.gradient_colors || 'from-purple-500 to-violet-600',
      display_order: product.display_order || 0,
      is_active: product.is_active ?? true,
      cta_text: product.cta_text || 'Saiba mais',
      cta_link: product.cta_link || '',
    });
    setMainImageFile(null);
    setMainImagePreview(product.image_url || null);
    setDialogOpen(true);
  };

  const uploadMainImage = async (productId: string): Promise<string | null> => {
    if (!mainImageFile) return formData.image_url || null;

    try {
      const fileExt = mainImageFile.name.split('.').pop();
      const fileName = `viajar-products/${productId}/main_${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, mainImageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          console.warn('⚠️ Bucket não encontrado, usando URL manual');
          return formData.image_url || null;
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      return formData.image_url || null;
    }
  };

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setMainImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setMainImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      let imageUrl = formData.image_url;

      if (editingProduct) {
        // Upload imagem se houver arquivo novo
        if (mainImageFile) {
          imageUrl = await uploadMainImage(editingProduct.id);
        }

        const { error } = await supabase
          .from('viajar_products')
          .update({
            title: formData.title,
            short_description: formData.short_description || null,
            full_description: formData.full_description || null,
            image_url: imageUrl || null,
            video_url: formData.video_url || null,
            icon_name: formData.icon_name || null,
            gradient_colors: formData.gradient_colors || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
            cta_text: formData.cta_text || 'Saiba mais',
            cta_link: formData.cta_link || null,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Produto atualizado com sucesso!',
        });
      } else {
        // Criar novo produto
        const { data: newProduct, error: insertError } = await supabase
          .from('viajar_products')
          .insert({
            title: formData.title,
            short_description: formData.short_description || null,
            full_description: formData.full_description || null,
            image_url: null, // Será atualizado após upload
            video_url: formData.video_url || null,
            icon_name: formData.icon_name || null,
            gradient_colors: formData.gradient_colors || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
            cta_text: formData.cta_text || 'Saiba mais',
            cta_link: formData.cta_link || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Upload imagem se houver
        if (mainImageFile && newProduct) {
          imageUrl = await uploadMainImage(newProduct.id);
          await supabase
            .from('viajar_products')
            .update({ image_url: imageUrl })
            .eq('id', newProduct.id);
        }

        toast({
          title: 'Sucesso',
          description: 'Produto criado com sucesso!',
        });
      }

      setDialogOpen(false);
      loadProducts();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar produto',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('viajar_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso!',
      });

      loadProducts();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir produto',
        variant: 'destructive',
      });
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Package;
    return IconComponent;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gerenciar Produtos/Soluções</h2>
          <p className="text-muted-foreground">Crie e edite produtos exibidos na homepage do ViajARTur</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-muted/50 rounded-lg border-2 border-dashed">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            Não há produtos cadastrados. Clique em "Novo Produto" para criar o primeiro.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Produto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const IconComponent = getIconComponent(product.icon_name || 'Package');
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{product.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Ordem: {product.display_order}
                      </CardDescription>
                    </div>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : product.video_url ? (
                    <div className="w-full h-48 rounded-lg mb-4 bg-muted flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className={`w-full h-48 rounded-lg mb-4 bg-gradient-to-br ${product.gradient_colors || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                      <IconComponent className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {product.short_description || 'Sem descrição'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Guilherme IA"
                  />
                </div>
                <div>
                  <Label htmlFor="short_description">Descrição Curta (Marketing)</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Texto curto e marketing (ex: Transforme dados em decisões estratégicas)"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="full_description">Descrição Completa (Opcional)</Label>
                  <Textarea
                    id="full_description"
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    placeholder="Descrição completa do produto..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mídia */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Imagem e Vídeo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image">Imagem Principal</Label>
                  <div className="space-y-2">
                    {(mainImagePreview || formData.image_url) && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <img
                          src={mainImagePreview || formData.image_url || ''}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {mainImageFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setMainImageFile(null);
                              setMainImagePreview(formData.image_url || null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageSelect}
                    />
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Ou cole URL da imagem"
                      className="text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="video_url">Vídeo YouTube (Opcional)</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {formData.video_url && getYouTubeEmbedUrl(formData.video_url) && (
                    <div className="mt-2 aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(formData.video_url)!}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Aparência */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aparência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="icon_name">Ícone</Label>
                  <Select
                    value={formData.icon_name}
                    onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ICONS.map((icon) => {
                        const IconComp = getIconComponent(icon);
                        return (
                          <SelectItem key={icon} value={icon}>
                            <div className="flex items-center gap-2">
                              <IconComp className="h-4 w-4" />
                              <span>{icon}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gradient_colors">Cores do Gradiente</Label>
                  <Select
                    value={formData.gradient_colors}
                    onValueChange={(value) => setFormData({ ...formData, gradient_colors: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADIENT_OPTIONS.map((gradient) => (
                        <SelectItem key={gradient} value={gradient}>
                          {gradient}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_order">Ordem de Exibição</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cta_text">Texto do Botão CTA</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="Saiba mais"
                  />
                </div>
                <div>
                  <Label htmlFor="cta_link">Link do Botão CTA (Opcional)</Label>
                  <Input
                    id="cta_link"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder="/solucoes/guata-ia"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingProduct ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}






