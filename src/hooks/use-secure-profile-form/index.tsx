
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
    console.log("🚀 PERFIL: Iniciando processo de criação do perfil com validação aprimorada");
    
    setFieldErrors({});

    const formData: ProfileFormData = {
      fullName, userType, occupation, birthDate, gender, sexualityIdentity,
      wantsToCollaborate, country, state, city, travelOrganization,
      customTravelOrganization, stayDuration, travelMotives, otherMotive,
      residenceCity, neighborhood, customNeighborhood, timeInCity
    };

    console.log("📝 PERFIL: Dados do formulário:", formData);

    // Função de retry com delay
    const retryWithDelay = async (fn: () => Promise<any>, retries = 3, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (error) {
          console.log(`⏳ PERFIL: Tentativa ${i + 1} falhou, tentando novamente...`);
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    try {
      // FASE 1: Validação básica primeiro
      console.log("🔍 PERFIL: Iniciando validação básica");
      
      if (!user?.id || !session) {
        console.log("❌ PERFIL: Usuário não autenticado", { userId: user?.id, hasSession: !!session });
        toast({
          title: "Erro",
          description: "Usuário não está autenticado. Tente fazer login novamente.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      // FASE 1.5: Validação de segurança opcional
      console.log("🔒 PERFIL: Iniciando validação de segurança");
      try {
        const { enhanceProfileFormSecurity, logProfileCreationAttempt } = await import('./securityEnhancement');
        const sanitizedData = await enhanceProfileFormSecurity(formData, user?.email);
        console.log("✅ PERFIL: Validação de segurança concluída");
        
        // Use dados sanitizados se disponíveis
        if (sanitizedData.fullName) formData.fullName = sanitizedData.fullName;
        if (sanitizedData.occupation) formData.occupation = sanitizedData.occupation;
        
      } catch (securityError) {
        console.warn("⚠️ PERFIL: Erro na validação de segurança, continuando sem ela:", securityError);
        // Continuar sem validação de segurança em caso de erro
      }

      // FASE 1.6: Validação de formulário básica
      console.log("📝 PERFIL: Iniciando validação de formulário");
      const errors = validateProfileForm(formData);
      console.log("✅ PERFIL: Resultado da validação:", errors);

      if (Object.keys(errors).length > 0) {
        console.log("❌ PERFIL: Erros de validação encontrados:", errors);
        setFieldErrors(errors);
        toast({
          title: "Erro",
          description: "Por favor, preencha os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      // FASE 2: Mapeamento e validação do tipo de usuário
      console.log("🔄 PERFIL: Validando e mapeando tipo de usuário");
      
      const mapUserType = (type: string) => {
        const mapping: { [key: string]: string } = {
          'turista': 'tourist',
          'morador': 'resident'
        };
        console.log("🔄 PERFIL: Mapeamento:", { input: type, mapping });
        return mapping[type] || type;
      };
      
      const mappedUserType = mapUserType(userType);
      console.log("🔄 PERFIL: Tipo de usuário mapeado:", { original: userType, mapped: mappedUserType });
      
      // Validar se o tipo mapeado é válido
      const validTypes = ['tourist', 'resident', 'collaborator', 'guide'];
      if (!validTypes.includes(mappedUserType)) {
        console.error("❌ PERFIL: Tipo de usuário inválido:", mappedUserType);
        toast({
          title: "Erro",
          description: `Tipo de usuário inválido: ${mappedUserType}. Tipos válidos: ${validTypes.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // FASE 3: Preparar dados do perfil
      console.log("💾 PERFIL: Preparando dados para salvar no Supabase");
      
      const profileData: any = {
        user_id: user.id,
        user_type: mappedUserType,
        full_name: fullName,
        occupation: occupation || null,
        birth_date: birthDate || null,
        gender: gender || null,
        sexuality_identity: sexualityIdentity || null,
        accessibility_preference: 'nenhuma',
      };

      // Adicionar campos específicos do morador
      if (userType === "morador") {
        console.log("👥 PERFIL: Adicionando campos específicos do morador");
        profileData.wants_to_collaborate = wantsToCollaborate;
        profileData.residence_city = residenceCity || null;
        profileData.neighborhood = (neighborhood === "Outro" ? customNeighborhood : neighborhood) || null;
        profileData.custom_neighborhood = customNeighborhood || null;
        profileData.time_in_city = timeInCity || null;
      }

      // Adicionar campos específicos do turista
      if (userType === "turista") {
        console.log("🧳 PERFIL: Adicionando campos específicos do turista");
        profileData.country = country || null;
        profileData.state = state || null;
        profileData.city = city || null;
        profileData.travel_organization = (travelOrganization === "Outro" ? customTravelOrganization : travelOrganization) || null;
        profileData.custom_travel_organization = customTravelOrganization || null;
        profileData.stay_duration = stayDuration || null;
        profileData.travel_motives = otherMotive ? [...travelMotives, otherMotive] : travelMotives;
        profileData.other_motive = otherMotive || null;
      }

      // Limpar campos undefined
      Object.keys(profileData).forEach(
        (key) => profileData[key] === undefined && delete profileData[key]
      );

      console.log("💾 PERFIL: Dados finais para inserção:", profileData);

      // FASE 4: Tentativa de salvamento com retry
      console.log("💾 PERFIL: Iniciando salvamento com retry automático");
      
      const saveProfile = async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .upsert(profileData, { onConflict: 'user_id' });

        if (error) {
          console.error("❌ PERFIL: Erro do Supabase ao salvar perfil:", error);
          throw error;
        }

        console.log("✅ PERFIL: Perfil salvo com sucesso:", data);
        return data;
      };

      await retryWithDelay(saveProfile, 3, 2000);

      // FASE 5: Atualização do metadata do usuário
      console.log("🔄 PERFIL: Atualizando metadata do usuário");
      
      const updateUserMetadata = async () => {
        const { error } = await supabase.auth.updateUser({
          data: { user_type: mappedUserType, full_name: fullName }
        });

        if (error) {
          console.error("❌ PERFIL: Erro ao atualizar metadata:", error);
          throw error;
        }
      };

      await retryWithDelay(updateUserMetadata, 2, 1000);

      // FASE 6: Finalização
      console.log("🔄 PERFIL: Atualizando sessão");
      await supabase.auth.refreshSession();

      console.log("🎉 PERFIL: Processo concluído com sucesso");
      
      // Limpar cache de rate limiting após sucesso
      try {
        const key = `rate_limit_${user?.email || 'anonymous'}_profile_creation`;
        localStorage.removeItem(key);
        console.log("🧹 PERFIL: Cache de rate limiting limpo após sucesso");
      } catch (error) {
        console.error("Erro ao limpar cache de rate limiting:", error);
      }
      
      toast({
        title: "Perfil criado!",
        description: "Seu perfil foi salvo com segurança no sistema.",
      });

      navigate("/");

    } catch (error: any) {
      console.error("❌ PERFIL: Erro geral no processo:", error);
      
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      
      // Tratamento específico de erros do Supabase
      if (error.code) {
        console.log("🔍 PERFIL: Analisando código de erro:", error.code);
        switch (error.code) {
          case '23505':
            errorMessage = "Este perfil já existe. Tente fazer login.";
            break;
          case '23502':
            errorMessage = "Campo obrigatório não preenchido.";
            break;
          case '23514':
            errorMessage = "Tipo de usuário inválido. Verifique os dados e tente novamente.";
            break;
          case 'PGRST116':
            errorMessage = "Erro de permissão. Entre em contato com o suporte.";
            break;
          default:
            errorMessage = `Erro do banco de dados (${error.code}): ${error.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log("📢 PERFIL: Exibindo erro para o usuário:", errorMessage);
      
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
