import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Search, Plus, Edit2, Trash2, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Interface baseada na tabela cat_locations do banco
interface CAT {
  id: string;
  name: string;
  address: string | null;
  city: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  working_hours: string | null;
  is_active: boolean | null;
  platform: 'ms' | 'viajar' | null;
  created_at: string;
  updated_at: string;
}

// Schema para validação do formulário
const catFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres",
  }),
  address: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres",
  }),
  working_hours: z.string().min(5, {
    message: "Horário deve ser especificado",
  }),
  city: z.string().min(2, {
    message: "Cidade deve ter pelo menos 2 caracteres",
  }),
  region: z.string().optional(),
  latitude: z.string().refine(val => !val || !isNaN(Number(val)), {
    message: "Latitude deve ser um número",
  }),
  longitude: z.string().refine(val => !val || !isNaN(Number(val)), {
    message: "Longitude deve ser um número",
  }),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  platform: z.enum(['ms', 'viajar']).optional().nullable(),
  is_active: z.boolean().default(true),
});

const CATLocationManager = () => {
  const { toast } = useToast();
  const [cats, setCATs] = useState<CAT[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<'all' | 'ms' | 'viajar'>('all');
  const [filteredCATs, setFilteredCATs] = useState<CAT[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCAT, setEditingCAT] = useState<CAT | null>(null);

  const form = useForm<z.infer<typeof catFormSchema>>({
    resolver: zodResolver(catFormSchema),
    defaultValues: {
      name: "",
      address: "",
      working_hours: "",
      city: "",
      region: "",
      latitude: "",
      longitude: "",
      contact_phone: "",
      contact_email: "",
      platform: 'ms',
      is_active: true,
    },
  });

  useEffect(() => {
    loadCATs();
  }, []);

  useEffect(() => {
    filterCATs();
  }, [searchTerm, cats, platformFilter]);

  const loadCATs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cat_locations')
        .select('*')
        .order('name');

      if (error) throw error;
      setCATs(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar CATs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCATs = () => {
    let results = cats.filter(cat => {
      const matchesSearch = 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.address?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        cat.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.region?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

      const matchesPlatform = 
        platformFilter === 'all' || 
        cat.platform === platformFilter ||
        (platformFilter === 'ms' && !cat.platform); // CATs sem platform são considerados MS

      return matchesSearch && matchesPlatform;
    });
    setFilteredCATs(results);
  };

  const openNewCATDialog = () => {
    setEditingCAT(null);
    form.reset({
      name: "",
      address: "",
      working_hours: "",
      city: "",
      region: "",
      latitude: "",
      longitude: "",
      contact_phone: "",
      contact_email: "",
      platform: 'ms',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditCATDialog = (cat: CAT) => {
    setEditingCAT(cat);
    form.reset({
      name: cat.name,
      address: cat.address || "",
      working_hours: cat.working_hours || "",
      city: cat.city,
      region: cat.region || "",
      latitude: cat.latitude?.toString() || "",
      longitude: cat.longitude?.toString() || "",
      contact_phone: cat.contact_phone || "",
      contact_email: cat.contact_email || "",
      platform: cat.platform || 'ms',
      is_active: cat.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof catFormSchema>) => {
    try {
      const catData = {
        name: values.name,
        address: values.address || null,
        working_hours: values.working_hours || null,
        city: values.city,
        region: values.region || null,
        latitude: values.latitude ? parseFloat(values.latitude) : null,
        longitude: values.longitude ? parseFloat(values.longitude) : null,
        contact_phone: values.contact_phone || null,
        contact_email: values.contact_email || null,
        platform: values.platform || 'ms',
        is_active: values.is_active ?? true,
        updated_at: new Date().toISOString(),
      };

      if (editingCAT) {
        const { error } = await supabase
          .from('cat_locations')
          .update(catData)
          .eq('id', editingCAT.id);

        if (error) throw error;

        toast({
          title: "CAT atualizado",
          description: `${values.name} foi atualizado com sucesso.`,
        });
      } else {
        const { error } = await supabase
          .from('cat_locations')
          .insert(catData);

        if (error) throw error;

        toast({
          title: "CAT criado",
          description: `${values.name} foi adicionado com sucesso.`,
        });
      }

      setIsDialogOpen(false);
      loadCATs();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro ao salvar CAT',
        variant: 'destructive',
      });
    }
  };

  const deleteCAT = async (catId: string) => {
    if (!confirm("Tem certeza que deseja excluir este CAT?")) return;

    try {
      const { error } = await supabase
        .from('cat_locations')
        .delete()
        .eq('id', catId);

      if (error) throw error;

      toast({
        title: "CAT excluído",
        description: "O CAT foi excluído com sucesso.",
      });

      loadCATs();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro ao excluir CAT',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar CATs..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={platformFilter} onValueChange={(value: 'all' | 'ms' | 'viajar') => setPlatformFilter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Plataformas</SelectItem>
              <SelectItem value="ms">Descubra MS</SelectItem>
              <SelectItem value="viajar">ViaJAR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewCATDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo CAT
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingCAT ? "Editar CAT" : "Adicionar Novo CAT"}</DialogTitle>
              <DialogDescription>
                {editingCAT 
                  ? "Faça as alterações nos dados do CAT abaixo."
                  : "Preencha os dados para adicionar um novo CAT ao sistema."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do CAT *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CAT Campo Grande" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço *</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="working_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Funcionamento *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Segunda a Sexta: 8h às 18h" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Região</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Sudoeste, Pantanal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(67) 3318-7600" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contato@cat.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: -20.4697" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: -54.6201" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plataforma</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === 'null' ? null : value)} 
                        value={field.value || 'ms'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a plataforma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ms">Descubra MS</SelectItem>
                          <SelectItem value="viajar">ViaJAR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          CAT será exibido no site
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="submit">
                    {editingCAT ? "Salvar Alterações" : "Adicionar CAT"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Região</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCATs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    Nenhum CAT encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCATs.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-ms-primary-blue mr-2" />
                        {cat.name}
                      </div>
                    </TableCell>
                    <TableCell>{cat.address || '-'}</TableCell>
                    <TableCell>{cat.city}</TableCell>
                    <TableCell>{cat.region || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={cat.platform === 'viajar' ? 'secondary' : 'default'}>
                        {cat.platform === 'viajar' ? 'ViaJAR' : 'Descubra MS'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cat.is_active ? 'default' : 'destructive'}>
                        {cat.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditCATDialog(cat)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCAT(cat.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default CATLocationManager;
