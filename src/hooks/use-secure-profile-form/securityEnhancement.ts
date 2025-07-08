
import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { sanitizeText, sanitizeEmail, validateInput } from "@/utils/sanitization";

export const enhanceProfileFormSecurity = async (formData: any, userEmail?: string) => {
  console.log("🔒 SECURITY: Starting enhanced profile form validation");

  // Rate limiting check
  const rateLimitResult = await enhancedSecurityService.checkRateLimit(
    userEmail || 'anonymous',
    'profile_creation',
    { maxAttempts: 3, windowMinutes: 10, blockDurationMinutes: 20 }
  );

  if (!rateLimitResult.allowed) {
    const error = new Error("Muitas tentativas. Tente novamente mais tarde.");
    await enhancedSecurityService.logSecurityEvent({
      action: 'profile_creation_rate_limited',
      success: false,
      error_message: 'Rate limit exceeded for profile creation',
      metadata: { userEmail, blockExpiry: rateLimitResult.blockExpiry }
    });
    throw error;
  }

  // Validate and sanitize form data
  const validationResult = enhancedSecurityService.validateFormData(formData);
  
  if (!validationResult.isValid) {
    await enhancedSecurityService.logSecurityEvent({
      action: 'profile_creation_validation_failed',
      success: false,
      error_message: 'Form validation failed',
      metadata: { errors: validationResult.errors, userEmail }
    });
    throw new Error("Dados do formulário inválidos: " + Object.values(validationResult.errors).join(', '));
  }

  // Additional specific validations for profile data
  const profileValidations = {
    fullName: validateInput(formData.fullName, { 
      required: true, 
      minLength: 2, 
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ÿ\s]+$/
    }),
    userType: validateInput(formData.userType, {
      required: true,
      customValidator: (value) => ['turista', 'morador'].includes(value)
    })
  };

  const profileErrors: string[] = [];
  for (const [field, validation] of Object.entries(profileValidations)) {
    if (!validation.isValid) {
      profileErrors.push(`${field}: ${validation.error}`);
    }
  }

  if (profileErrors.length > 0) {
    await enhancedSecurityService.logSecurityEvent({
      action: 'profile_creation_specific_validation_failed',
      success: false,
      error_message: 'Profile-specific validation failed',
      metadata: { errors: profileErrors, userEmail }
    });
    throw new Error("Erros de validação: " + profileErrors.join(', '));
  }

  // Log successful validation
  await enhancedSecurityService.logSecurityEvent({
    action: 'profile_creation_validation_success',
    success: true,
    metadata: { 
      userEmail,
      userType: formData.userType,
      hasCollaborationPreference: !!formData.wantsToCollaborate
    }
  });

  console.log("✅ SECURITY: Profile form validation completed successfully");
  return validationResult.sanitizedData;
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
