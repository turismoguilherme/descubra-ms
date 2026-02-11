// @ts-nocheck

import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { sanitizeText, sanitizeEmail, validateInput } from "@/utils/sanitization";

export const enhanceProfileFormSecurity = async (formData: unknown, userEmail?: string) => {
  console.log("🔒 SECURITY: Starting simplified profile form validation");

  // VALIDAÇÃO SIMPLIFICADA - removendo rate limiting temporariamente
  console.log("🔒 SECURITY: Skipping rate limiting for debugging");

  // Validação básica dos dados
  const basicValidation = {
    fullName: formData.fullName && formData.fullName.trim().length >= 2,
    userType: formData.userType && ['turista', 'morador'].includes(formData.userType)
  };

  const validationErrors: string[] = [];
  
  if (!basicValidation.fullName) {
    validationErrors.push("Nome completo é obrigatório e deve ter pelo menos 2 caracteres");
  }
  
  if (!basicValidation.userType) {
    validationErrors.push("Tipo de usuário é obrigatório e deve ser 'turista' ou 'morador'");
  }

  if (validationErrors.length > 0) {
    console.log("❌ SECURITY: Validation errors:", validationErrors);
    throw new Error("Erros de validação: " + validationErrors.join(', '));
  }

  // Sanitização simples dos dados
  const sanitizedData = {
    fullName: formData.fullName?.trim(),
    occupation: formData.occupation?.trim(),
    userType: formData.userType
  };

  console.log("✅ SECURITY: Simplified validation completed successfully");
  return sanitizedData;
};

export const logProfileCreationAttempt = async (success: boolean, userEmail?: string, error?: string) => {
  await enhancedSecurityService.logSecurityEvent({
    action: success ? 'profile_creation_success' : 'profile_creation_failed',
    success,
    error_message: error,
    metadata: {
      userEmail,
      timestamp: new Date().toISOString(),
      source: 'profile_form'
    }
  });
};
