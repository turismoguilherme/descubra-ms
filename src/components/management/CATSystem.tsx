
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Importing components
import AttendantsTab from "./AttendantsTab";
import IASupportTab from "./IASupportTab";
import PendingQuestionsTab from "./PendingQuestionsTab";
import GeoLocationService from "./GeoLocationService";
import CATAIManagement from "./CATAIManagement";

// Importing utils and data
import { calculateDistance } from "./utils/geoUtils";
import { mockAttendants, catLocations, mockQuestions } from "./data/mockData";

interface CATSystemProps {
  region: string;
}

const CATSystem = ({ region }: CATSystemProps) => {
  const [iaQuery, setIaQuery] = useState("");
  const [iaResponse, setIaResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [selectedCat, setSelectedCat] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [attendants, setAttendants] = useState(mockAttendants);
  const { toast } = useToast();
  
  // Verificar o tipo de usuário (gestor ou atendente)
  const isManager = region === "all" || region !== "atendente"; // Admins e gestores veem todas as regiões
  const isAttendant = !isManager;

  // Function for simulating check-in with geolocation
  const initiateCheckIn = (catName: string) => {
    setSelectedCat(catName);
    
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
      toast({
        title: "Erro de geolocalização",
        description: "Seu dispositivo não suporta geolocalização.",
        variant: "destructive",
      });
      return;
    }
    
    // Obter a localização atual do usuário
    navigator.geolocation.getCurrentPosition(
      // Sucesso
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setShowLocationDialog(true);
      },
      // Erro
      (error) => {
        toast({
          title: "Erro de geolocalização",
          description: "Não foi possível obter sua localização atual.",
          variant: "destructive",
        });
        console.error("Erro de geolocalização:", error);
      }
    );
  };

  // Function to confirm check-in after verifying location
  const confirmCheckIn = () => {
    if (!userLocation || !selectedCat) return;
    
    // Verificar distância entre localização atual e o CAT selecionado
    const catCoords = catLocations[selectedCat as keyof typeof catLocations];
    const distance = calculateDistance(userLocation.lat, userLocation.lng, catCoords.lat, catCoords.lng);
    
    // Para teste, consideramos válido se estiver dentro de 2km do CAT
    // Em produção, talvez um raio menor seja mais apropriado (ex: 100-500m)
    const isLocationValid = distance <= 2;
    
    if (isLocationValid) {
      // Registra o check-in
      const now = new Date().toISOString();
      const updatedAttendants = attendants.map(attendant => {
        if (attendant.cat === selectedCat) {
          return {
            ...attendant,
            lastCheckIn: now,
            lastCheckOut: null,
            status: "active"
          };
        }
        return attendant;
      });
      
      setAttendants(updatedAttendants);
      
      toast({
        title: "Check-in realizado",
        description: `Check-in no ${selectedCat} registrado com sucesso.`,
      });
    } else {
      toast({
        title: "Localização inválida",
        description: `Você precisa estar no local do ${selectedCat} para fazer check-in.`,
        variant: "destructive",
      });
    }
    
    setShowLocationDialog(false);
    setUserLocation(null);
  };

  return (
    <>
      <Tabs defaultValue="attendants">
        <TabsList className="grid w-full" style={{ 
          gridTemplateColumns: isManager ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr" 
        }}>
          <TabsTrigger value="attendants">Atendentes</TabsTrigger>
          {isAttendant && (
            <TabsTrigger value="ia">IA de Suporte</TabsTrigger>
          )}
          <TabsTrigger value="pending">Perguntas Pendentes</TabsTrigger>
          {isManager && (
            <TabsTrigger value="ai-management">Gestão IA</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="attendants" className="mt-4">
          <AttendantsTab 
            region={region} 
            attendants={attendants} 
            setAttendants={setAttendants}
            initiateCheckIn={initiateCheckIn}
            catLocations={catLocations}
          />
        </TabsContent>
        
        {/* IA Support tab only for attendants */}
        <TabsContent value="ia" className="mt-4">
          <IASupportTab isAttendant={isAttendant} />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          <PendingQuestionsTab questions={mockQuestions} />
        </TabsContent>

        {/* AI Management tab only for managers */}
        {isManager && (
          <TabsContent value="ai-management" className="mt-4">
            <CATAIManagement />
          </TabsContent>
        )}
      </Tabs>

      {/* Location dialog for check-in */}
      <GeoLocationService 
        showLocationDialog={showLocationDialog} 
        setShowLocationDialog={setShowLocationDialog}
        selectedCat={selectedCat}
        userLocation={userLocation}
        confirmCheckIn={confirmCheckIn}
      />
    </>
  );
};

export default CATSystem;
