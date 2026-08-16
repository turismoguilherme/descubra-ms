/**
 * Security utilities for client-side security measures
 */

// Note: securityAuditService import removed to avoid circular dependency
// Will be added back when needed

export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  maxFileUploadSizeMB: number;
  allowedFileTypes: string[];
}

export const SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  sessionTimeoutMinutes: 30,
  maxFileUploadSizeMB: 10,
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
};

/**
 * Client-side rate limiting (backup only - server-side is primary)
 */
export class ClientRateLimit {
  private attempts: Map<string, number[]> = new Map();

  isRateLimited(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      console.warn('Client-side rate limit exceeded:', { identifier, attempts: validAttempts.length });
      return true;
    }
    
    // Record this attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return false;
  }

  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * File upload security validation
 */
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > SECURITY_CONFIG.maxFileUploadSizeMB * 1024 * 1024) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo permitido: ${SECURITY_CONFIG.maxFileUploadSizeMB}MB`
    };
  }

  // Check file type
  if (!SECURITY_CONFIG.allowedFileTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${SECURITY_CONFIG.allowedFileTypes.join(', ')}`
    };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i,
    /^\./,
    /[<>:"|?*]/,
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    console.warn('Suspicious file upload attempt:', { fileName: file.name, fileType: file.type });
    
    return {
      isValid: false,
      error: 'Nome de arquivo suspeito detectado'
    };
  }

  return { isValid: true };
};

/**
 * URL validation for external links
 */
export const validateExternalUrl = (url: string): { isValid: boolean; error?: string } => {
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'Apenas URLs HTTP/HTTPS são permitidas'
      };
    }

    // Block potentially dangerous domains
    const blockedDomains = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1'
    ];

    if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
      console.warn('Blocked domain access attempt:', { url, hostname: urlObj.hostname });
      
      return {
        isValid: false,
        error: 'URL não permitida por motivos de segurança'
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'URL inválida'
    };
  }
};

/**
 * Content Security Policy violation handler
 */
export const setupCSPViolationReporting = () => {
  if (typeof window !== 'undefined') {
    document.addEventListener('securitypolicyviolation', (event) => {
      console.warn('CSP Violation:', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        referrer: event.referrer
      });
    });
  }
};

/**
 * Input validation helpers for forms
 */
export const secureFormValidation = {
  validateCNPJ: (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    return cleanCNPJ.length === 14 && !/^(\d)\1+$/.test(cleanCNPJ);
  },

  validatePhone: (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  },

  validateBusinessName: (name: string): boolean => {
    // Must be 2-100 chars, no HTML tags, no excessive special chars
    return name.length >= 2 && 
           name.length <= 100 && 
           !/<[^>]*>/g.test(name) &&
           !/[<>{}[\]\\|`~!@#$%^&*()+=?]{3,}/.test(name);
  }
};

/**
 * Initialize client-side security measures
 */
export const initializeClientSecurity = () => {
  setupCSPViolationReporting();
  
  // Detect developer tools in production
  if (import.meta.env.PROD) {
    const devtools = { open: false };
    
    setInterval(() => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          console.warn('Developer tools detected in production');
        }
      } else {
        devtools.open = false;
      }
    }, 1000);
  }
};

export const clientRateLimit = new ClientRateLimit();