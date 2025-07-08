import DOMPurify from 'dompurify';

// Configure DOMPurify with strict settings
const configureDOMPurify = () => {
  // Allow only safe HTML tags and attributes
  DOMPurify.setConfig({
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    FORCE_BODY: false,
    SANITIZE_NAMED_PROPS: true,
    KEEP_CONTENT: false
  });
};

// Initialize DOMPurify configuration
configureDOMPurify();

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (dirty: string): string => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(dirty);
};

/**
 * Sanitizes plain text input by removing HTML tags and normalizing whitespace
 * @param input - The input string to sanitize
 * @returns Sanitized plain text string
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove any HTML tags and normalize whitespace
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 1000); // Limit length to prevent abuse
};

/**
 * Sanitizes email input
 * @param email - The email string to sanitize
 * @returns Sanitized email string
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  return email.toLowerCase().trim().substring(0, 254); // RFC 5321 limit
};

/**
 * Sanitizes URL input
 * @param url - The URL string to sanitize
 * @returns Sanitized URL string or empty string if invalid
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};

/**
 * Validates and sanitizes phone number input
 * @param phone - The phone number string to sanitize
 * @returns Sanitized phone number string
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove all non-digit characters except + at the beginning
  return phone.replace(/[^\d+]/g, '').substring(0, 20);
};

/**
 * Generic input validator with configurable rules
 * @param input - The input to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateInput = (
  input: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => boolean;
  } = {}
): { isValid: boolean; error?: string } => {
  if (!input || typeof input !== 'string') {
    if (options.required) {
      return { isValid: false, error: 'Este campo é obrigatório' };
    }
    return { isValid: true };
  }

  const sanitized = sanitizeText(input);
  
  if (options.required && !sanitized) {
    return { isValid: false, error: 'Este campo é obrigatório' };
  }
  
  if (options.minLength && sanitized.length < options.minLength) {
    return { isValid: false, error: `Mínimo de ${options.minLength} caracteres` };
  }
  
  if (options.maxLength && sanitized.length > options.maxLength) {
    return { isValid: false, error: `Máximo de ${options.maxLength} caracteres` };
  }
  
  if (options.pattern && !options.pattern.test(sanitized)) {
    return { isValid: false, error: 'Formato inválido' };
  }
  
  if (options.customValidator && !options.customValidator(sanitized)) {
    return { isValid: false, error: 'Valor inválido' };
  }
  
  return { isValid: true };
};
