
import React, { ReactNode } from 'react';
import DOMPurify from 'dompurify';

interface InputValidatorProps {
  children: ReactNode;
  allowHtml?: boolean;
  maxLength?: number;
  pattern?: RegExp;
  onValidationError?: (error: string) => void;
}

// Export standalone sanitize function
export const sanitizeInput = (value: string, allowHtml: boolean = false): string => {
  try {
    if (!allowHtml) {
      return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
    } else {
      return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: []
      });
    }
  } catch (error) {
    console.error('Input sanitization error:', error);
    return '';
  }
};

export const InputValidator: React.FC<InputValidatorProps> = ({
  children,
  allowHtml = false,
  maxLength,
  pattern,
  onValidationError
}) => {
  const validateAndSanitize = (value: string): string => {
    try {
      // Basic length validation
      if (maxLength && value.length > maxLength) {
        onValidationError?.(`Input exceeds maximum length of ${maxLength} characters`);
        return value.substring(0, maxLength);
      }

      // Pattern validation
      if (pattern && !pattern.test(value)) {
        onValidationError?.('Input does not match required pattern');
        return value;
      }

      // XSS protection
      return sanitizeInput(value, allowHtml);
    } catch (error) {
      console.error('Input validation error:', error);
      onValidationError?.('Input validation failed');
      return '';
    }
  };

  // Clone children and add validation props
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.type === 'input' || child.type === 'textarea')) {
          return React.cloneElement(child as any, {
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              const sanitizedValue = validateAndSanitize(e.target.value);
              e.target.value = sanitizedValue;
              child.props.onChange?.(e);
            }
          });
        }
        return child;
      })}
    </>
  );
};

export default InputValidator;
