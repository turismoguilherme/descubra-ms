
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const manuallyUpdateUserRole = async (userId: string, newRole: 'admin' | 'tech' | 'municipal' | 'municipal_manager' | 'gestor' | 'atendente' | 'user') => {
  try {
    console.log(`🔧 SECURE ROLE UPDATE: Atualizando role para ${newRole} do usuário ${userId}`);
    
    // Use the secure role update function instead of direct table manipulation
    const { data, error } = await supabase.rpc('secure_update_user_role', {
      target_user_id: userId,
      new_role: newRole
    });

    if (error) {
      console.error("❌ SECURE ROLE UPDATE: Erro ao atualizar role:", error);
      showToast("Erro", `Não foi possível atualizar a role: ${error.message}`, "destructive");
      return false;
    }

    if (!data) {
      console.error("❌ SECURE ROLE UPDATE: Operação negada por política de segurança");
      showToast("Erro", "Operação negada: verificações de segurança falharam.", "destructive");
      return false;
    }

    console.log("✅ SECURE ROLE UPDATE: Role atualizada com sucesso");
    showToast("Sucesso", `Role atualizada para: ${newRole}`, "default");
    return true;
  } catch (error: any) {
    console.error("❌ SECURE ROLE UPDATE: Erro crítico:", error);
    showToast("Erro", "Erro crítico ao atualizar role.", "destructive");
    return false;
  }
};

export const checkUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, region')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("❌ CHECK ROLE: Erro ao verificar role:", error);
      return null;
    }

    console.log("✅ CHECK ROLE: Role encontrada:", data);
    return data;
  } catch (error) {
    console.error("❌ CHECK ROLE: Erro crítico:", error);
    return null;
  }
};
