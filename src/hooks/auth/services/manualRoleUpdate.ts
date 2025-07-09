
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const manuallyUpdateUserRole = async (userId: string, newRole: 'admin' | 'tech' | 'municipal' | 'municipal_manager' | 'gestor' | 'atendente' | 'user') => {
  try {
    console.log(`🔧 MANUAL ROLE UPDATE: Atualizando role para ${newRole} do usuário ${userId}`);
    
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: newRole,
        region: newRole === 'admin' || newRole === 'tech' ? 'all' : null
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error("❌ MANUAL ROLE UPDATE: Erro ao atualizar role:", error);
      showToast("Erro", "Não foi possível atualizar a role do usuário.", "destructive");
      return false;
    }

    console.log("✅ MANUAL ROLE UPDATE: Role atualizada com sucesso:", data);
    showToast("Sucesso", `Role atualizada para: ${newRole}`, "default");
    return true;
  } catch (error: any) {
    console.error("❌ MANUAL ROLE UPDATE: Erro crítico:", error);
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
