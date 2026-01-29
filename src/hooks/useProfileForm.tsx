import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/hooks/auth/authToast";

export const useProfileForm = () => {
  const [userType, setUserType] = useState<string>("");
  const [occupation, setOccupation] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [sexualityIdentity, setSexualityIdentity] = useState("");
  
  // Tourist fields
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [travelOrganization, setTravelOrganization] = useState("");
  const [customTravelOrganization, setCustomTravelOrganization] = useState("");
  const [stayDuration, setStayDuration] = useState("");
  const [travelMotives, setTravelMotives] = useState<string[]>([]);
  const [otherMotive, setOtherMotive] = useState("");
  
  // Resident fields
  const [residenceCity, setResidenceCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [customNeighborhood, setCustomNeighborhood] = useState("");
  const [timeInCity, setTimeInCity] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { user, session } = useAuth();

  const handleMotiveChange = (motive: string, checked: boolean) => {
    if (checked) {
      setTravelMotives(prev => [...prev, motive]);
    } else {
      setTravelMotives(prev => prev.filter(m => m !== motive));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      showToast("Erro", "Por favor, selecione o tipo de usuário", "destructive");
      return;
    }

    if (!user?.id || !session) {
      showToast("Erro", "Usuário não está autenticado. Tente fazer login novamente.", "destructive");
      return;
    }

    setIsSubmitting(true);

    try {
      const profileData = {
        userType,
        occupation,
        birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
        gender,
        sexualityIdentity,
        ...(userType === "turista" && {
          country,
          state,
          city,
          travelOrganization: travelOrganization === "Outro" ? customTravelOrganization : travelOrganization,
          stayDuration,
          travelMotives: otherMotive ? [...travelMotives, otherMotive] : travelMotives
        }),
        ...(userType === "morador" && {
          residenceCity,
          neighborhood: neighborhood === "Outro" ? customNeighborhood : neighborhood,
          timeInCity
        })
      };

      console.log("Salvando perfil completo:", profileData);
      
      showToast("Perfil criado!", "Bem-vindo ao sistema de turismo de MS!");
      navigate("/");
      
    } catch (error: unknown) {
      console.error("Erro ao salvar perfil:", error);
      showToast("Erro", "Erro ao criar perfil. Tente novamente.", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    userType, setUserType,
    occupation, setOccupation,
    birthDate, setBirthDate,
    gender, setGender,
    sexualityIdentity, setSexualityIdentity,
    // Tourist fields
    country, setCountry,
    state, setState,
    city, setCity,
    travelOrganization, setTravelOrganization,
    customTravelOrganization, setCustomTravelOrganization,
    stayDuration, setStayDuration,
    travelMotives, handleMotiveChange,
    otherMotive, setOtherMotive,
    // Resident fields
    residenceCity, setResidenceCity,
    neighborhood, setNeighborhood,
    customNeighborhood, setCustomNeighborhood,
    timeInCity, setTimeInCity,
    isSubmitting,
    handleSubmit
  };
};
