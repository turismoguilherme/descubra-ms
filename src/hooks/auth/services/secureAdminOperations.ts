
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const validateAdminOperation = async (operationType: string): Promise<boolean> => {
  try {
    // Check if user has admin role using existing function
    const { data: userRole, error } = await supabase.rpc('get_user_role', { 
      check_user_id: (await supabase.auth.getUser()).data.user?.id 
    });

    if (error) {
      console.error("Admin validation error:", error);
      await supabase.rpc('log_security_event', {
        event_action: `admin_validation_${operationType}`,
        event_success: false,
        event_error_message: error.message,
      });
      return false;
    }

    // Incluir municipal_manager na validação
    const isAuthorized = ['admin', 'tech', 'municipal', 'municipal_manager', 'gestor'].includes(userRole);
    
    await supabase.rpc('log_security_event', {
      event_action: `admin_validation_${operationType}`,
      event_user_id: (await supabase.auth.getUser()).data.user?.id,
      event_success: isAuthorized,
    });

    console.log("🔍 Validação admin:", { userRole, isAuthorized, operationType });

    return isAuthorized;
  } catch (error: any) {
    console.error("Admin validation exception:", error);
    await supabase.rpc('log_security_event', {
      event_action: `admin_validation_exception_${operationType}`,
      event_success: false,
      event_error_message: error.message,
      
    });
    return false;
  }
};

// Nova função específica para validar operações do passaporte digital
export const validatePassportAdminOperation = async (
  operationType: string, 
  targetRegion?: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, region')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (error) {
      console.error("Passport admin validation error:", error);
      showToast("Erro de autorização", "Falha na validação de permissões.", "destructive");
      return false;
    }

    if (!data) {
      showToast("Acesso negado", "Usuário sem permissões definidas.", "destructive");
      return false;
    }

    // Determinar autorização baseado no papel (incluindo municipal_manager)
    let isAuthorized = false;
    
    if (['admin', 'tech'].includes(data.role)) {
      isAuthorized = true;
    } else if (['gestor', 'municipal', 'municipal_manager'].includes(data.role)) {
      // Gestores podem operar apenas em sua região
      isAuthorized = !targetRegion || data.region === targetRegion;
    }

    if (!isAuthorized) {
      showToast("Acesso negado", "Você não tem permissão para esta operação.", "destructive");
    }

    // Log da operação
    await supabase.rpc('log_security_event', {
      event_action: `passport_${operationType}_validation`,
      event_user_id: (await supabase.auth.getUser()).data.user?.id,
      event_success: isAuthorized
    });

    return isAuthorized;
  } catch (error: any) {
    console.error("Passport admin validation exception:", error);
    showToast("Erro de sistema", "Erro na validação de segurança.", "destructive");
    return false;
  }
};

export const secureCreateUser = async (userData: {
  email: string;
  role: string;
  region?: string;
}) => {
  // Validate admin operation
  const isAuthorized = await validateAdminOperation('create_user');
  if (!isAuthorized) {
    showToast("Erro de autorização", "Você não tem permissão para criar usuários.", "destructive");
    return { error: { message: "Unauthorized" } };
  }

  try {
    // Additional validation for role assignment
    if (['admin', 'tech'].includes(userData.role)) {
      const confirmAdmin = confirm(
        "⚠️ OPERAÇÃO CRÍTICA: Você está criando um usuário com privilégios administrativos. Esta ação será auditada. Confirma?"
      );
      if (!confirmAdmin) {
        return { error: { message: "Operation cancelled" } };
      }
    }

    // Log the user creation attempt with enhanced security logging
    await supabase.rpc('log_security_event', {
      event_action: 'admin_create_user_attempt',
      event_user_id: (await supabase.auth.getUser()).data.user?.id,
      event_success: true
    });

    return { error: null };
  } catch (error: any) {
    console.error("Secure user creation error:", error);
    await supabase.rpc('log_security_event', {
      event_action: 'admin_create_user_error',
      event_user_id: (await supabase.auth.getUser()).data.user?.id,
      event_success: false,
      event_error_message: error.message,
      
    });
    return { error };
  }
};

export const secureDeleteUser = async (userId: string) => {
  const isAuthorized = await validateAdminOperation('delete_user');
  if (!isAuthorized) {
    showToast("Erro de autorização", "Você não tem permissão para deletar usuários.", "destructive");
    return { error: { message: "Unauthorized" } };
  }

  const confirmDelete = confirm(
    "⚠️ AÇÃO IRREVERSÍVEL: Você tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita e será permanentemente auditada."
  );
  if (!confirmDelete) {
    return { error: { message: "Operation cancelled" } };
  }

  try {
    await supabase.rpc('log_security_event', {
      event_action: 'admin_delete_user_attempt',
      event_user_id: (await supabase.auth.getUser()).data.user?.id,
      event_success: true
    });

    return { error: null };
  } catch (error: any) {
    console.error("Secure user deletion error:", error);
    return { error };
  }
};
