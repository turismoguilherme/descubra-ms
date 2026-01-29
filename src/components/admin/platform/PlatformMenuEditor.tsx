import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, Edit, Trash2, GripVertical, Loader2, 
  Menu, ExternalLink, Lock, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface MenuItem {
  id: string;
  label: string;
  path: string | null;
  menu_type: 'main' | 'footer' | 'sidebar';
  icon: string | null;
  order_index: number;
  is_active: boolean;
  requires_auth: boolean;
  parent_id: string | null;
  platform: string;
}

interface PlatformMenuEditorProps {
  platform: 'viajar' | 'descubra_ms';
}

export default function PlatformMenuEditor({ platform }: PlatformMenuEditorProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [activeMenuType, setActiveMenuType] = useState<'main' | 'footer' | 'sidebar'>('main');
  const { toast } = useToast();

  const platformName = platform === 'viajar' ? 'ViaJARTur' : 'Descubra MS';

  useEffect(() => {
    loadMenus();
  }, [platform]);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('dynamic_menus')
        .select('*')
        .eq('platform', platform)
        .order('order_index');

      if (error) throw error;
      setMenus((data || []) as MenuItem[]);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar menus:', err);
      // Usar dados locais como fallback
      const localData = localStorage.getItem(`menus_${platform}`);
      if (localData) {
        setMenus(JSON.parse(localData));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (menu: MenuItem) => {
    try {
      const { error } = await (supabase as any)
        .from('dynamic_menus')
        .update({ is_active: !menu.is_active })
        .eq('id', menu.id);

      if (error) throw error;
      
      setMenus(prev => prev.map(m => 
        m.id === menu.id ? { ...m, is_active: !m.is_active } : m
      ));
      
      toast({ 
        title: 'Atualizado', 
        description: `Menu ${!menu.is_active ? 'ativado' : 'desativado'}.` 
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao atualizar.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await (supabase as any)
        .from('dynamic_menus')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMenus(prev => prev.filter(m => m.id !== id));
      toast({ title: 'Excluído', description: 'Item removido com sucesso.' });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao excluir.',
        variant: 'destructive',
      });
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    const filteredMenus = menus.filter(m => m.menu_type === activeMenuType);
    const draggedIndex = filteredMenus.findIndex(m => m.id === draggedItem);
    const targetIndex = filteredMenus.findIndex(m => m.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newFilteredMenus = [...filteredMenus];
    const [removed] = newFilteredMenus.splice(draggedIndex, 1);
    newFilteredMenus.splice(targetIndex, 0, removed);

    // Atualizar order_index
    const updatedMenus = newFilteredMenus.map((menu, index) => ({
      ...menu,
      order_index: index,
    }));

    // Atualizar estado local
    setMenus(prev => {
      const otherMenus = prev.filter(m => m.menu_type !== activeMenuType);
      return [...otherMenus, ...updatedMenus].sort((a, b) => a.order_index - b.order_index);
    });
    setDraggedItem(null);

    // Salvar no banco
    try {
      for (const menu of updatedMenus) {
        await (supabase as any)
          .from('dynamic_menus')
          .update({ order_index: menu.order_index })
          .eq('id', menu.id);
      }
      toast({ title: 'Ordem atualizada' });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar ordem.',
        variant: 'destructive',
      });
      loadMenus();
    }
  };

  const filteredMenus = menus.filter(m => m.menu_type === activeMenuType);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Editor de Menus - {platformName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os itens de navegação
            </p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMenu(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? 'Editar Item' : 'Novo Item de Menu'}
              </DialogTitle>
              <DialogDescription>
                {editingMenu ? 'Atualize as informações' : 'Adicione um novo item ao menu'}
              </DialogDescription>
            </DialogHeader>
            <MenuForm
              menu={editingMenu}
              platform={platform}
              defaultMenuType={activeMenuType}
              onSuccess={() => {
                setIsDialogOpen(false);
                setEditingMenu(null);
                loadMenus();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Type Tabs */}
      <div className="flex gap-2">
        {(['main', 'footer', 'sidebar'] as const).map(type => (
          <Button
            key={type}
            variant={activeMenuType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveMenuType(type)}
          >
            {type === 'main' && 'Menu Principal'}
            {type === 'footer' && 'Rodapé'}
            {type === 'sidebar' && 'Sidebar'}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      <Card className="border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Itens do {activeMenuType === 'main' ? 'Menu Principal' : activeMenuType === 'footer' ? 'Rodapé' : 'Sidebar'}
          </CardTitle>
          <CardDescription>
            Arraste para reordenar os itens
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMenus.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Menu className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum item encontrado</p>
              <p className="text-sm">Clique em "Novo Item" para adicionar</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredMenus
                .sort((a, b) => a.order_index - b.order_index)
                .map((menu) => (
                <div
                  key={menu.id}
                  draggable
                  onDragStart={() => handleDragStart(menu.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(menu.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-move",
                    draggedItem === menu.id && "opacity-50 bg-muted",
                    !menu.is_active && "opacity-60"
                  )}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {menu.label}
                      </span>
                      {menu.requires_auth && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    {menu.path && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">{menu.path}</span>
                      </div>
                    )}
                  </div>

                  <Badge variant="outline" className="flex-shrink-0">
                    {menu.order_index + 1}
                  </Badge>

                  <Switch
                    checked={menu.is_active}
                    onCheckedChange={() => handleToggleActive(menu)}
                  />

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingMenu(menu);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(menu.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MenuFormProps {
  menu: MenuItem | null;
  platform: 'viajar' | 'descubra_ms';
  defaultMenuType: 'main' | 'footer' | 'sidebar';
  onSuccess: () => void;
}

function MenuForm({ menu, platform, defaultMenuType, onSuccess }: MenuFormProps) {
  const [formData, setFormData] = useState({
    label: menu?.label || '',
    path: menu?.path || '',
    menu_type: menu?.menu_type || defaultMenuType,
    icon: menu?.icon || '',
    order_index: menu?.order_index ?? 0,
    is_active: menu?.is_active ?? true,
    requires_auth: menu?.requires_auth ?? false,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (menu) {
        const { error } = await (supabase as any)
          .from('dynamic_menus')
          .update(formData)
          .eq('id', menu.id);

        if (error) throw error;
        toast({ title: 'Atualizado', description: 'Item atualizado com sucesso.' });
      } else {
        const { error } = await (supabase as any)
          .from('dynamic_menus')
          .insert([{
            ...formData,
            platform,
            roles: null,
            parent_id: null,
          }]);

        if (error) throw error;
        toast({ title: 'Criado', description: 'Item criado com sucesso.' });
      }
      onSuccess();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="label">Label *</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Ex: Destinos"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="path">Caminho (URL)</Label>
        <Input
          id="path"
          value={formData.path}
          onChange={(e) => setFormData({ ...formData, path: e.target.value })}
          placeholder="/destinos"
        />
      </div>
      
      <div>
        <Label htmlFor="menu_type">Tipo de Menu</Label>
        <Select
          value={formData.menu_type}
          onValueChange={(value: 'main' | 'footer' | 'sidebar') => setFormData({ ...formData, menu_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Menu Principal</SelectItem>
            <SelectItem value="footer">Rodapé</SelectItem>
            <SelectItem value="sidebar">Sidebar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="icon">Ícone (Lucide)</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="Home, MapPin, Calendar..."
        />
      </div>
      
      <div>
        <Label htmlFor="order_index">Ordem</Label>
        <Input
          id="order_index"
          type="number"
          value={formData.order_index}
          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
          min={0}
        />
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Ativo</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="requires_auth"
            checked={formData.requires_auth}
            onCheckedChange={(checked) => setFormData({ ...formData, requires_auth: checked })}
          />
          <Label htmlFor="requires_auth">Requer Login</Label>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {menu ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );
}
