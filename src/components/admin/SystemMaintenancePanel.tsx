
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Database,
  Cpu,
  HardDrive
} from "lucide-react";

const maintenanceFormSchema = z.object({
  issueType: z.string().min(1, {
    message: "Tipo de problema é obrigatório.",
  }),
  description: z.string().min(10, {
    message: "Descrição deve ter pelo menos 10 caracteres.",
  }),
});

const SystemMaintenancePanel = () => {
  const { toast } = useToast();
  const [systemStatus, setSystemStatus] = useState({
    api: "online", 
    database: "online",
    ai: "online",
    storage: "online"
  });
  
  const form = useForm<z.infer<typeof maintenanceFormSchema>>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      issueType: "",
      description: "",
    },
  });
  
  const onSubmit = (values: z.infer<typeof maintenanceFormSchema>) => {
    // Em produção, enviaria para uma API de tickets
    console.log("Registrando problema:", values);
    
    toast({
      title: "Problema registrado",
      description: "O problema foi registrado e será analisado pela equipe técnica.",
    });
    
    form.reset();
  };
  
  const checkSystemStatus = () => {
    // Simula uma verificação do sistema
    setSystemStatus({
      ...systemStatus,
      api: Math.random() > 0.9 ? "warning" : "online",
      database: Math.random() > 0.95 ? "offline" : "online",
      ai: Math.random() > 0.8 ? "warning" : "online",
      storage: "online",
    });
    
    toast({
      title: "Status do sistema atualizado",
      description: "A verificação do sistema foi concluída.",
    });
  };
  
  const clearCache = () => {
    toast({
      title: "Cache limpo",
      description: "O cache do sistema foi limpo com sucesso.",
    });
  };
  
  const rebuildIndex = () => {
    toast({
      title: "Reconstrução iniciada",
      description: "A reconstrução do índice de busca foi iniciada. Isso pode levar alguns minutos.",
    });
  };
  
  const restartAI = () => {
    setSystemStatus({
      ...systemStatus,
      ai: "restarting"
    });
    
    setTimeout(() => {
      setSystemStatus({
        ...systemStatus,
        ai: "online"
      });
      
      toast({
        title: "IA reiniciada",
        description: "Os serviços de IA foram reiniciados com sucesso.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Status do Sistema */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Status do Sistema</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkSystemStatus} 
            className="flex items-center"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar Status
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Cpu className="h-5 w-5 mr-2 text-gray-500" />
                <span>API & Serviços</span>
              </div>
              <StatusIndicator status={systemStatus.api} />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-gray-500" />
                <span>Banco de Dados</span>
              </div>
              <StatusIndicator status={systemStatus.database} />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-gray-500"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Serviços de IA</span>
              </div>
              <StatusIndicator status={systemStatus.ai} />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HardDrive className="h-5 w-5 mr-2 text-gray-500" />
                <span>Armazenamento</span>
              </div>
              <StatusIndicator status={systemStatus.storage} />
            </div>
          </Card>
        </div>
      </div>

      {/* Ações de Manutenção */}
      <div>
        <h3 className="text-lg font-medium mb-4">Ações de Manutenção</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" onClick={clearCache} className="h-auto py-6 flex flex-col items-center justify-center">
            <RefreshCcw className="h-8 w-8 mb-2" />
            <span>Limpar Cache</span>
          </Button>
          
          <Button variant="outline" onClick={rebuildIndex} className="h-auto py-6 flex flex-col items-center justify-center">
            <Database className="h-8 w-8 mb-2" />
            <span>Reconstruir Índices</span>
          </Button>
          
          <Button variant="outline" onClick={restartAI} className="h-auto py-6 flex flex-col items-center justify-center">
            <svg
              className="h-8 w-8 mb-2"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Reiniciar Serviços IA</span>
          </Button>
        </div>
      </div>

      {/* Registro de Problemas */}
      <div>
        <h3 className="text-lg font-medium mb-4">Registrar Problema</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="issueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Problema</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Bug no módulo CAT, Erro na API..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o problema em detalhes, incluindo passos para reproduzi-lo..." 
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              <AlertCircle className="mr-2 h-4 w-4" />
              Registrar Problema
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

// Componente para indicador visual de status
const StatusIndicator = ({ status }: { status: string }) => {
  switch (status) {
    case "online":
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle2 className="h-5 w-5 mr-1" />
          <span>Online</span>
        </div>
      );
    case "offline":
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="h-5 w-5 mr-1" />
          <span>Offline</span>
        </div>
      );
    case "warning":
      return (
        <div className="flex items-center text-yellow-600">
          <AlertCircle className="h-5 w-5 mr-1" />
          <span>Atenção</span>
        </div>
      );
    case "restarting":
      return (
        <div className="flex items-center text-blue-600">
          <RefreshCcw className="h-5 w-5 mr-1 animate-spin" />
          <span>Reiniciando</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center text-gray-600">
          <AlertCircle className="h-5 w-5 mr-1" />
          <span>Desconhecido</span>
        </div>
      );
  }
};

export default SystemMaintenancePanel;
