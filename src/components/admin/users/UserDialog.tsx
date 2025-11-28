
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { msRegions, regionCities } from "@/data/msRegions";
import { useEffect } from "react";

export const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Email inválido",
  }),
  role: z.string().min(1, {
    message: "Por favor selecione uma função",
  }),
  region: z.string().min(1, {
    message: "Por favor selecione uma região",
  }),
  password: z.string().min(8, {
    message: "Senha deve ter pelo menos 8 caracteres",
  }).optional(),
});

interface UserDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  editingUser: any;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  openNewUserDialog: () => void;
}

const UserDialog = ({ isDialogOpen, setIsDialogOpen, editingUser, form, onSubmit, openNewUserDialog }: UserDialogProps) => {
  const watchedRole = form.watch("role");

  // Auto-select "all" region for admin and tech roles
  useEffect(() => {
    if (watchedRole === "admin" || watchedRole === "tech") {
      form.setValue("region", "all");
    }
  }, [watchedRole, form]);

  const isAdminOrTech = watchedRole === "admin" || watchedRole === "tech";

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={openNewUserDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 -m-6 mb-6 rounded-t-lg">
          <DialogTitle className="text-xl font-bold">
            {editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-2">
            {editingUser
              ? "Faça as alterações nos dados do usuário abaixo."
              : "Preencha os dados para adicionar um novo usuário ao sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Nome Completo *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome completo do usuário" 
                      {...field} 
                      className="bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="usuario@exemplo.com" 
                      {...field} 
                      className="bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Função no Sistema *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 h-12">
                        <SelectValue placeholder="Selecione a função do usuário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-2 border-gray-200 shadow-xl max-h-60">
                      <SelectItem value="admin" className="font-medium text-red-600">
                        🔴 Administrador do Sistema
                      </SelectItem>
                      <SelectItem value="tech" className="font-medium text-purple-600">
                        🟣 Técnico do Sistema
                      </SelectItem>
                      <SelectItem value="gestor" className="font-medium text-blue-600">
                        🔵 Gestor Regional
                      </SelectItem>
                      <SelectItem value="municipal_manager" className="font-medium text-green-600">
                        🟢 Gerente Municipal
                      </SelectItem>
                      <SelectItem value="municipal" className="font-medium text-green-600">
                        🟢 Gestor Municipal
                      </SelectItem>
                      <SelectItem value="atendente" className="font-medium text-orange-600">
                        🟡 Atendente CAT
                      </SelectItem>
                      <SelectItem value="user" className="font-medium text-gray-600">
                        ⚪ Usuário Comum
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    {isAdminOrTech ? "Acesso a Região" : "Região Turística *"}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isAdminOrTech}
                  >
                    <FormControl>
                      <SelectTrigger className={`bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 h-12 ${isAdminOrTech ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                        <SelectValue placeholder="Selecione a região de atuação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-2 border-gray-200 shadow-xl max-h-60">
                      {isAdminOrTech && (
                        <SelectItem value="all" className="font-bold text-blue-600">
                          🌐 Todas as Regiões (Admin/Técnico)
                        </SelectItem>
                      )}
                      {!isAdminOrTech && Object.entries(msRegions).map(([key, name]) => (
                        <SelectItem key={key} value={key} className="font-medium">
                          📍 {name}
                          <div className="text-xs text-gray-500 mt-1">
                            Cidades: {regionCities[key as keyof typeof regionCities]?.slice(0, 3).join(", ")}
                            {regionCities[key as keyof typeof regionCities]?.length > 3 && "..."}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {!isAdminOrTech && (
                    <p className="text-sm text-gray-600 mt-1">
                      O usuário terá acesso apenas à região selecionada e suas cidades.
                    </p>
                  )}
                </FormItem>
              )}
            />
            
            {!editingUser && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Senha Inicial *</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Mínimo 8 caracteres" 
                        {...field} 
                        className="bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-1">
                      O usuário deverá alterar a senha no primeiro login.
                    </p>
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter className="pt-6 border-t-2 border-gray-100 flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="px-6 py-3 border-2 border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {editingUser ? "💾 Salvar Alterações" : "➕ Adicionar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
