import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { descubraMSAdminService } from '@/services/admin/descubraMSAdminService';
import { useToast } from '@/hooks/use-toast';
import { DynamicMenu } from '@/types/admin';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MenuManager() {
  const [menus, setMenus] = useState<DynamicMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<DynamicMenu | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const data = await descubraMSAdminService.getMenus('descubra_ms');
      setMenus(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar menus',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (menu: DynamicMenu) => {
    try {
      await descubraMSAdminService.updateMenu(menu.id, {
        is_active: !menu.is_active,
      });
      fetchMenus();
      toast({ title: 'Sucesso', description: 'Menu atualizado' });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar menu',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item de menu?')) return;

    try {
      await descubraMSAdminService.deleteMenu(id);
      fetchMenus();
      toast({ title: 'Sucesso', description: 'Item excluído' });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir menu',
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

    const draggedIndex = menus.findIndex(m => m.id === draggedItem);
    const targetIndex = menus.findIndex(m => m.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newMenus = [...menus];
    const [removed] = newMenus.splice(draggedIndex, 1);
    newMenus.splice(targetIndex, 0, removed);

    // Atualizar order_index
    const updatedMenus = newMenus.map((menu, index) => ({
      ...menu,
      order_index: index,
    }));

    setMenus(updatedMenus);
    setDraggedItem(null);

    // Salvar nova ordem
    try {
      for (const menu of updatedMenus) {
        await descubraMSAdminService.updateMenu(menu.id, {
          order_index: menu.order_index,
        });
      }
      toast({ title: 'Sucesso', description: 'Ordem dos menus atualizada' });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar ordem',
        variant: 'destructive',
      });
      fetchMenus(); // Reverter em caso de erro
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciador de Menus</h2>
          <p className="text-gray-600 mt-1">Gerencie menus do Descubra MS</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMenu ? 'Editar Item de Menu' : 'Novo Item de Menu'}</DialogTitle>
              <DialogDescription>
                {editingMenu ? 'Atualize o item de menu' : 'Adicione um novo item ao menu'}
              </DialogDescription>
            </DialogHeader>
            <MenuForm
              menu={editingMenu}
              onSuccess={() => {
                setIsDialogOpen(false);
                setEditingMenu(null);
                fetchMenus();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens de Menu</CardTitle>
          <CardDescription>Gerencie os itens do menu principal</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum item de menu encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  menus
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((menu) => (
                    <TableRow 
                      key={menu.id}
                      draggable
                      onDragStart={() => handleDragStart(menu.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(menu.id)}
                      className={`cursor-move ${draggedItem === menu.id ? 'opacity-50' : ''}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                          {menu.order_index}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{menu.label}</TableCell>
                      <TableCell>{menu.path || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{menu.menu_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={menu.is_active}
                          onCheckedChange={() => handleToggleActive(menu)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMenu(menu);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(menu.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MenuForm({ menu, onSuccess }: { menu: DynamicMenu | null; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    label: menu?.label || '',
    path: menu?.path || '',
    menu_type: menu?.menu_type || 'main',
    icon: menu?.icon || '',
    order_index: menu?.order_index || 0,
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
        await descubraMSAdminService.updateMenu(menu.id, formData);
        toast({ title: 'Sucesso', description: 'Item atualizado com sucesso' });
      } else {
        await descubraMSAdminService.createMenu({
          ...formData,
          platform: 'descubra_ms',
          roles: null,
          parent_id: null,
        });
        toast({ title: 'Sucesso', description: 'Item criado com sucesso' });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar item',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="path">Path (URL)</Label>
        <Input
          id="path"
          value={formData.path}
          onChange={(e) => setFormData({ ...formData, path: e.target.value })}
          placeholder="/descubramatogrossodosul/destinos"
        />
      </div>
      <div>
        <Label htmlFor="menu_type">Tipo de Menu</Label>
        <Select
          value={formData.menu_type}
          onValueChange={(value) => setFormData({ ...formData, menu_type: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Principal</SelectItem>
            <SelectItem value="footer">Rodapé</SelectItem>
            <SelectItem value="sidebar">Sidebar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="icon">Ícone (nome do ícone Lucide)</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="Home"
        />
      </div>
      <div>
        <Label htmlFor="order_index">Ordem</Label>
        <Input
          id="order_index"
          type="number"
          value={formData.order_index}
          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div className="flex items-center gap-4">
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
          <Label htmlFor="requires_auth">Requer autenticação</Label>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : menu ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );
}
