
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Search, Plus, Edit2, Trash2, MapPin } from "lucide-react";

// Define os tipos para os dados dos CATs e atendentes
interface CAT {
  id: string;
  nome: string;
  endereco: string;
  horario: string;
  cidade: string;
  regiao: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
}

// Mock data para os CATs (em produção, isso viria do banco de dados)
const mockCATs: CAT[] = [
  {
    id: "1",
    nome: "CAT Campo Grande",
    endereco: "Av. Afonso Pena, 7000",
    horario: "Segunda a Sexta: 8h às 18h",
    cidade: "Campo Grande",
    regiao: "Campo Grande",
    coordenadas: { lat: -20.4697, lng: -54.6201 }
  },
  {
    id: "2",
    nome: "CAT Bonito",
    endereco: "Rua Cel. Pilad Rebuá, 1780",
    horario: "Segunda a Domingo: 8h às 18h",
    cidade: "Bonito",
    regiao: "Bonito",
    coordenadas: { lat: -21.1261, lng: -56.4514 }
  },
  {
    id: "3",
    nome: "CAT Corumbá",
    endereco: "Rua Delamare, 1546",
    horario: "Segunda a Sexta: 8h às 18h",
    cidade: "Corumbá",
    regiao: "Pantanal",
    coordenadas: { lat: -19.0078, lng: -57.6506 }
  }
];

// Schema para validação do formulário
const catFormSchema = z.object({
  nome: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres",
  }),
  endereco: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres",
  }),
  horario: z.string().min(5, {
    message: "Horário deve ser especificado",
  }),
  cidade: z.string().min(2, {
    message: "Cidade deve ter pelo menos 2 caracteres",
  }),
  regiao: z.string({
    // Validação de região obrigatória
  }).min(1, { message: "Por favor selecione uma região" }),
  latitude: z.string().refine(val => !isNaN(Number(val)), {
    message: "Latitude deve ser um número",
  }),
  longitude: z.string().refine(val => !isNaN(Number(val)), {
    message: "Longitude deve ser um número",
  }),
});

const CATLocationManager = () => {
  const { toast } = useToast();
  const [cats, setCATs] = useState<CAT[]>(mockCATs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCATs, setFilteredCATs] = useState<CAT[]>(mockCATs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCAT, setEditingCAT] = useState<CAT | null>(null);

  const form = useForm<z.infer<typeof catFormSchema>>({
    resolver: zodResolver(catFormSchema),
    defaultValues: {
      nome: "",
      endereco: "",
      horario: "",
      cidade: "",
      regiao: "",
      latitude: "",
      longitude: "",
    },
  });

  useEffect(() => {
    const results = cats.filter(cat => {
      return (
        cat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.regiao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredCATs(results);
  }, [searchTerm, cats]);

  const openNewCATDialog = () => {
    setEditingCAT(null);
    form.reset({
      nome: "",
      endereco: "",
      horario: "",
      cidade: "",
      regiao: "",
      latitude: "",
      longitude: "",
    });
    setIsDialogOpen(true);
  };

  const openEditCATDialog = (cat: CAT) => {
    setEditingCAT(cat);
    form.reset({
      nome: cat.nome,
      endereco: cat.endereco,
      horario: cat.horario,
      cidade: cat.cidade,
      regiao: cat.regiao,
      latitude: cat.coordenadas.lat.toString(),
      longitude: cat.coordenadas.lng.toString(),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof catFormSchema>) => {
    const catData = {
      nome: values.nome,
      endereco: values.endereco,
      horario: values.horario,
      cidade: values.cidade,
      regiao: values.regiao,
      coordenadas: {
        lat: Number(values.latitude),
        lng: Number(values.longitude),
      }
    };

    if (editingCAT) {
      // Editar CAT existente
      const updatedCATs = cats.map(cat => {
        if (cat.id === editingCAT.id) {
          return {
            ...cat,
            ...catData
          };
        }
        return cat;
      });
      setCATs(updatedCATs);
      toast({
        title: "CAT atualizado",
        description: `${values.nome} foi atualizado com sucesso.`,
      });
    } else {
      // Adicionar novo CAT
      const newCAT = {
        id: `${cats.length + 1}`,
        ...catData
      };
      setCATs([...cats, newCAT]);
      toast({
        title: "CAT criado",
        description: `${values.nome} foi adicionado com sucesso.`,
      });
    }
    setIsDialogOpen(false);
  };

  const deleteCAT = (catId: string) => {
    if (confirm("Tem certeza que deseja excluir este CAT?")) {
      const updatedCATs = cats.filter(cat => cat.id !== catId);
      setCATs(updatedCATs);
      
      toast({
        title: "CAT excluído",
        description: "O CAT foi excluído com sucesso.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar CATs..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do CAT</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CAT Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="horario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Funcionamento</FormLabel>
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
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="regiao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Região</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a região" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Campo Grande">Campo Grande</SelectItem>
                            <SelectItem value="Bonito">Bonito</SelectItem>
                            <SelectItem value="Pantanal">Pantanal</SelectItem>
                            <SelectItem value="Corumbá">Corumbá</SelectItem>
                            <SelectItem value="Ponta Porã">Ponta Porã</SelectItem>
                            <SelectItem value="Dourados">Dourados</SelectItem>
                            <SelectItem value="Costa Leste">Costa Leste</SelectItem>
                          </SelectContent>
                        </Select>
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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Região</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCATs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  Nenhum CAT encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredCATs.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-ms-primary-blue mr-2" />
                      {cat.nome}
                    </div>
                  </TableCell>
                  <TableCell>{cat.endereco}</TableCell>
                  <TableCell>{cat.cidade}</TableCell>
                  <TableCell>{cat.regiao}</TableCell>
                  <TableCell>{cat.horario}</TableCell>
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
    </div>
  );
};

export default CATLocationManager;
