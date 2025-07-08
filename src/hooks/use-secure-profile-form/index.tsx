
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FieldErrors, ProfileFormData } from "./types";
import { validateProfileForm } from "./validation";

export const useSecureProfileForm = () => {
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<string>("");
  const [occupation, setOccupation] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [sexualityIdentity, setSexualityIdentity] = useState("");
  const [wantsToCollaborate, setWantsToCollaborate] = useState<boolean | null>(null);

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleMotiveChange = (motive: string, checked: boolean) => {
    if (checked) {
      setTravelMotives(prev => [...prev, motive]);
    } else {
      setTravelMotives(prev => prev.filter(m => m !== motive));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 PERFIL: Iniciando processo de criação do perfil com validação de segurança aprimorada");
    
    setFieldErrors({});

    const formData: ProfileFormData = {
      fullName, userType, occupation, birthDate, gender, sexualityIdentity,
      wantsToCollaborate, country, state, city, travelOrganization,
      customTravelOrganization, stayDuration, travelMotives, otherMotive,
      residenceCity, neighborhood, customNeighborhood, timeInCity
    };

    console.log("📝 PERFIL: Dados do formulário:", formData);

    try {
      // Enhanced security validation
      const { enhanceProfileFormSecurity, logProfileCreationAttempt } = await import('./securityEnhancement');
      const sanitizedData = await enhanceProfileFormSecurity(formData, user?.email);
      
      console.log("🔒 PERFIL: Validação de segurança aprovada");

      // Original validation logic
      const errors = validateProfileForm(formData);
      console.log("✅ PERFIL: Resultado da validação:", errors);

      if (Object.keys(errors).length > 0) {
        console.log("❌ PERFIL: Erros de validação encontrados:", errors);
        setFieldErrors(errors);
        await logProfileCreationAttempt(false, user?.email, "Validation errors");
        toast({
          title: "Erro",
          description: "Por favor, preencha os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      if (!user?.id || !session) {
        console.log("❌ PERFIL: Usuário não autenticado", { userId: user?.id, hasSession: !!session });
        await logProfileCreationAttempt(false, user?.email, "User not authenticated");
        toast({
          title: "Erro",
          description: "Usuário não está autenticado. Tente fazer login novamente.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      console.log("💾 PERFIL: Preparando dados para salvar no Supabase");
      
      const profileData: any = {
        user_id: user.id,
        user_type: userType,
        full_name: sanitizedData.fullName || fullName, // Use sanitized data when available
        occupation: sanitizedData.occupation || occupation,
        birth_date: birthDate || null,
        gender: gender || null,
        sexuality_identity: sexualityIdentity || null,
        accessibility_preference: 'nenhuma',
      };

      // Adicionar campos específicos do morador
      if (userType === "morador") {
        profileData.wants_to_collaborate = wantsToCollaborate;
        profileData.residence_city = residenceCity || null;
        profileData.neighborhood = (neighborhood === "Outro" ? customNeighborhood : neighborhood) || null;
        profileData.time_in_city = timeInCity || null;
      }

      // Adicionar campos específicos do turista
      if (userType === "turista") {
        profileData.country = country || null;
        profileData.state = state || null;
        profileData.city = city || null;
        profileData.travel_organization = (travelOrganization === "Outro" ? customTravelOrganization : travelOrganization) || null;
        profileData.stay_duration = stayDuration || null;
        profileData.travel_motives = otherMotive ? [...travelMotives, otherMotive] : travelMotives;
        profileData.other_motive = otherMotive || null;
      }

      // Limpar campos undefined
      Object.keys(profileData).forEach(
        (key) => profileData[key] === undefined && delete profileData[key]
      );

      console.log("💾 PERFIL: Dados finais para inserção:", profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) {
        console.error("❌ PERFIL: Erro do Supabase ao salvar perfil:", error);
        throw error;
      }

      console.log("✅ PERFIL: Perfil salvo com sucesso:", data);
      
      // Atualizar metadata do usuário
      console.log("🔄 PERFIL: Atualizando metadata do usuário");
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { user_type: userType, full_name: fullName }
      });

      if (updateUserError) {
        console.error("❌ PERFIL: Erro ao atualizar metadata:", updateUserError);
        throw updateUserError;
      }

      console.log("🔄 PERFIL: Atualizando sessão");
      await supabase.auth.refreshSession();

      console.log("🎉 PERFIL: Processo concluído com sucesso");
      await logProfileCreationAttempt(true, user?.email);
      toast({
        title: "Perfil criado!",
        description: "Seu perfil foi salvo com segurança no sistema.",
      });

      navigate("/");

    } catch (error: any) {
      console.error("❌ PERFIL: Erro geral no processo:", error);
      
      const { logProfileCreationAttempt } = await import('./securityEnhancement');
      await logProfileCreationAttempt(false, user?.email, error.message);
      
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      
      // Tratamento específico de erros do Supabase
      if (error.code) {
        switch (error.code) {
          case '23505':
            errorMessage = "Este perfil já existe. Tente fazer login.";
            break;
          case '23502':
            errorMessage = "Campo obrigatório não preenchido.";
            break;
          case 'PGRST116':
            errorMessage = "Erro de permissão. Entre em contato com o suporte.";
            break;
          default:
            errorMessage = `Erro do banco de dados: ${error.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro ao salvar perfil",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fullName, setFullName,
    userType, setUserType,
    occupation, setOccupation,
    birthDate, setBirthDate,
    gender, setGender,
    sexualityIdentity, setSexualityIdentity,
    wantsToCollaborate, setWantsToCollaborate,
    country, setCountry,
    state, setState,
    city, setCity,
    travelOrganization, setTravelOrganization,
    customTravelOrganization, setCustomTravelOrganization,
    stayDuration, setStayDuration,
    travelMotives, handleMotiveChange,
    otherMotive, setOtherMotive,
    residenceCity, setResidenceCity,
    neighborhood, setNeighborhood,
    customNeighborhood, setCustomNeighborhood,
    timeInCity, setTimeInCity,
    isSubmitting,
    fieldErrors,
    handleSubmit
  };
};
