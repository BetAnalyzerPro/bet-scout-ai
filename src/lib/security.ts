/**
 * Security utilities for Bet Analizer
 * Client-side validation (always complemented by server-side validation)
 */

// File upload security constants
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Prevent XSS in text inputs
  SAFE_TEXT: /^[^<>{}]*$/,
  // UUID format for IDs
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

/**
 * Validate file for upload
 */
export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${UPLOAD_LIMITS.MAX_FILE_SIZE_MB}MB`,
    };
  }

  // Check MIME type
  if (!UPLOAD_LIMITS.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Permitidos: ${UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!UPLOAD_LIMITS.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Extensão de arquivo não permitida. Permitidos: ${UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.EMAIL.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  return VALIDATION_PATTERNS.UUID.test(id);
}

/**
 * Check if text is safe (no potential XSS)
 */
export function isSafeText(text: string): boolean {
  return VALIDATION_PATTERNS.SAFE_TEXT.test(text);
}

/**
 * Rate limit helper for client-side throttling
 */
class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();

  canAttempt(action: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const key = action;
    const attempts = this.attempts.get(key) || [];
    
    // Filter out old attempts
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  getRemainingTime(action: string, windowMs: number): number {
    const attempts = this.attempts.get(action) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const remaining = windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, remaining);
  }
}

export const clientRateLimiter = new ClientRateLimiter();

/**
 * Debounce function for input handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate a simple fingerprint for anti-fraud (not for tracking)
 */
export function getSimpleFingerprint(): string {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|');
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}
