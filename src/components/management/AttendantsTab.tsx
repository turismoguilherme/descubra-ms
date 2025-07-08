
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Clock, MapPin, Check, UserPlus, Navigation } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import CATAttendantGeolocation from "./CATAttendantGeolocation";

// Schema for attendant form validation
const attendantFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Email inválido." }),
  cat: z.string().min(1, { message: "Selecione um CAT." }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres." }),
});

interface Attendant {
  id: string;
  name: string;
  cat: string;
  status: string;
  lastCheckIn: string | null;
  lastCheckOut: string | null;
  coords: { lat: number; lng: number };
  region: string;
  email?: string;
}

interface AttendantsTabProps {
  region: string;
  attendants: Attendant[];
  setAttendants: React.Dispatch<React.SetStateAction<Attendant[]>>;
  initiateCheckIn: (catName: string) => void;
  catLocations: Record<string, { lat: number; lng: number }>;
}

const AttendantsTab = ({ 
  region, 
  attendants, 
  setAttendants, 
  initiateCheckIn,
  catLocations 
}: AttendantsTabProps) => {
  const [showAddAttendantDialog, setShowAddAttendantDialog] = useState(false);
  const [selectedAttendantForTracking, setSelectedAttendantForTracking] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Check if user is manager or attendant
  const isManager = region === "all" || region !== "atendente";
  
  // Filter attendants based on the region
  const filteredAttendants = attendants.filter(attendant => {
    // Admin or tech users can see all attendants
    if (region === "all") return true;
    
    // Regional managers can only see attendants from their region
    return attendant.region === region || attendant.cat.includes(region);
  });
  
  // Form for adding new attendant
  const form = useForm<z.infer<typeof attendantFormSchema>>({
    resolver: zodResolver(attendantFormSchema),
    defaultValues: {
      name: "",
      email: "",
      cat: "",
      password: "",
    },
  });
  
  // Handle form submission for new attendant
  const onSubmitNewAttendant = (values: z.infer<typeof attendantFormSchema>) => {
    // Add new attendant
    const newAttendant = {
      id: `${attendants.length + 1}`,
      name: values.name,
      email: values.email,
      cat: values.cat,
      status: "inactive",
      lastCheckIn: null,
      lastCheckOut: null,
      coords: catLocations[values.cat as keyof typeof catLocations] || { lat: 0, lng: 0 },
      region: region === "all" ? "Campo Grande" : region
    };
    
    setAttendants([...attendants, newAttendant]);
    setShowAddAttendantDialog(false);
    
    toast({
      title: "Atendente adicionado",
      description: `${values.name} foi adicionado com sucesso ao ${values.cat}.`,
    });
    
    form.reset();
  };

  const handleLocationUpdate = (attendantId: string, location: { lat: number; lng: number; accuracy: number }) => {
    setAttendants(prev => 
      prev.map(attendant => 
        attendant.id === attendantId 
          ? { 
              ...attendant, 
              coords: { lat: location.lat, lng: location.lng },
              status: "active", // Atualizar status quando localização é obtida
              lastCheckIn: new Date().toISOString()
            }
          : attendant
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {region === "all" 
              ? "Monitoramento de CATs (Todos)"
              : `Monitoramento de CATs (Região: ${region})`}
          </CardTitle>
          
          {isManager && (
            <Dialog open={showAddAttendantDialog} onOpenChange={setShowAddAttendantDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Atendente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Atendente</DialogTitle>
                  <DialogDescription>
                    Preencha os dados abaixo para adicionar um novo atendente ao sistema.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitNewAttendant)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do atendente" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CAT</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um CAT" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CAT Campo Grande">CAT Campo Grande</SelectItem>
                              <SelectItem value="CAT Bonito">CAT Bonito</SelectItem>
                              <SelectItem value="CAT Corumbá">CAT Corumbá</SelectItem>
                              <SelectItem value="CAT Dourados">CAT Dourados</SelectItem>
                              <SelectItem value="CAT Ponta Porã">CAT Ponta Porã</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Inicial</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Adicionar Atendente</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {filteredAttendants.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Não há atendentes cadastrados para esta região.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atendente</TableHead>
                  <TableHead>CAT</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Check-in</TableHead>
                  <TableHead>Último Check-out</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendants.map((attendant) => (
                  <TableRow key={attendant.id}>
                    <TableCell className="flex items-center space-x-2">
                      <User size={16} />
                      <span>{attendant.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-ms-primary-blue" />
                        <span>{attendant.cat}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {attendant.status === "active" ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} />
                        <span>
                          {attendant.lastCheckIn ? 
                            new Date(attendant.lastCheckIn).toLocaleString('pt-BR') : 
                            '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {attendant.lastCheckOut ? 
                        new Date(attendant.lastCheckOut).toLocaleString('pt-BR') : 
                        '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => initiateCheckIn(attendant.cat)}
                          title="Check-in com Geolocalização"
                          className="flex items-center"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Check-in
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedAttendantForTracking(attendant.id)}
                          title="Rastrear Localização"
                        >
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Painel de Geolocalização do Atendente Selecionado */}
      {selectedAttendantForTracking && (
        <div className="space-y-4">
          {filteredAttendants
            .filter(attendant => attendant.id === selectedAttendantForTracking)
            .map(attendant => (
              <CATAttendantGeolocation
                key={attendant.id}
                attendantId={attendant.id}
                attendantName={attendant.name}
                assignedCAT={attendant.cat}
                onLocationUpdate={(location) => handleLocationUpdate(attendant.id, location)}
              />
            ))}
          
          <Button 
            variant="outline" 
            onClick={() => setSelectedAttendantForTracking(null)}
          >
            Fechar Rastreamento
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendantsTab;
