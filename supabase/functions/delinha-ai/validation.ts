// Input validation and security utilities for Delinha AI
import { RequestBody } from "./types.ts";

// Rate limiting storage (in-memory for this implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Content validation constants
const MAX_PROMPT_LENGTH = 2000;
const MAX_KNOWLEDGE_BASE_ITEMS = 100;
const RATE_LIMIT_REQUESTS = 50;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Suspicious patterns that might indicate prompt injection
const SUSPICIOUS_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /system\s*:\s*you\s+are/i,
  /forget\s+everything/i,
  /new\s+instructions/i,
  /override\s+your\s+programming/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /developer\s+mode/i,
];

/**
 * Validate and sanitize incoming request data
 */
export function validateRequest(body: any, clientIP: string): { 
  isValid: boolean; 
  sanitizedBody?: RequestBody; 
  error?: string 
} {
  try {
    // Rate limiting check
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return {
        isValid: false,
        error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.resetIn || 60000) / 60000)} minutes.`
      };
    }

    // Validate required fields
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: "Invalid request body" };
    }

    const { prompt, knowledgeBase = [], userInfo, threadId, useOfficialSources = true } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return { isValid: false, error: "Prompt is required and must be a string" };
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return { isValid: false, error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.` };
    }

    // Check for suspicious patterns
    const suspiciousPattern = SUSPICIOUS_PATTERNS.find(pattern => pattern.test(prompt));
    if (suspiciousPattern) {
      console.warn(`Suspicious prompt detected from ${clientIP}: ${prompt.substring(0, 100)}`);
      return { isValid: false, error: "Invalid prompt content detected" };
    }

    // Validate knowledge base
    if (!Array.isArray(knowledgeBase)) {
      return { isValid: false, error: "Knowledge base must be an array" };
    }

    if (knowledgeBase.length > MAX_KNOWLEDGE_BASE_ITEMS) {
      return { isValid: false, error: `Too many knowledge base items. Maximum ${MAX_KNOWLEDGE_BASE_ITEMS} allowed.` };
    }

    // Sanitize prompt
    const sanitizedPrompt = sanitizeText(prompt);

    // Validate user info if provided
    let sanitizedUserInfo = userInfo;
    if (userInfo && typeof userInfo === 'object') {
      sanitizedUserInfo = {
        origem: userInfo.origem ? sanitizeText(userInfo.origem.toString()) : undefined,
        interesses: Array.isArray(userInfo.interesses) 
          ? userInfo.interesses.map((i: any) => sanitizeText(i.toString())).slice(0, 10)
          : undefined,
        visitouAnteriormente: typeof userInfo.visitouAnteriormente === 'boolean' 
          ? userInfo.visitouAnteriormente 
          : undefined
      };
    }

    // Validate thread ID
    const sanitizedThreadId = threadId ? sanitizeText(threadId.toString()) : undefined;

    return {
      isValid: true,
      sanitizedBody: {
        prompt: sanitizedPrompt,
        knowledgeBase: knowledgeBase.slice(0, MAX_KNOWLEDGE_BASE_ITEMS),
        userInfo: sanitizedUserInfo,
        threadId: sanitizedThreadId,
        useOfficialSources: Boolean(useOfficialSources)
      }
    };

  } catch (error) {
    console.error("Request validation error:", error);
    return { isValid: false, error: "Request validation failed" };
  }
}

/**
 * Simple rate limiting implementation
 */
function checkRateLimit(clientIP: string): { allowed: boolean; resetIn?: number } {
  const now = Date.now();
  const key = `rate_limit_${clientIP}`;
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetTime) {
    // Reset or create new rate limit entry
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return { allowed: true };
  }

  if (existing.count >= RATE_LIMIT_REQUESTS) {
    return { 
      allowed: false, 
      resetIn: existing.resetTime - now 
    };
  }

  // Increment counter
  existing.count++;
  rateLimitMap.set(key, existing);
  return { allowed: true };
}

/**
 * Sanitize text input to prevent XSS and injection attacks
 */
function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .substring(0, MAX_PROMPT_LENGTH);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');
  
  return cfIP || realIP || forwarded?.split(',')[0] || 'unknown';
}