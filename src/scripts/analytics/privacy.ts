import { logger } from '@/lib/logger';

const EMAIL_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
const PHONE_REGEX = /(\+?\d{1,4}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?)?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g;
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const CREDIT_CARD_REGEX = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
const POSTAL_CODE_REGEX = /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/gi;

const REDACTED_EMAIL = '[email]';
const REDACTED_PHONE = '[phone]';
const REDACTED_IP = '[ip]';
const REDACTED_CC = '[card]';
const REDACTED_SSN = '[ssn]';
const REDACTED_POSTAL = '[postal]';

export function redactPII(text: string): string {
  if (!text || typeof text !== 'string') return text;

  let redacted = text;

  redacted = redacted.replace(EMAIL_REGEX, REDACTED_EMAIL);
  redacted = redacted.replace(PHONE_REGEX, REDACTED_PHONE);
  redacted = redacted.replace(IP_REGEX, REDACTED_IP);
  redacted = redacted.replace(CREDIT_CARD_REGEX, REDACTED_CC);
  redacted = redacted.replace(SSN_REGEX, REDACTED_SSN);
  redacted = redacted.replace(POSTAL_CODE_REGEX, REDACTED_POSTAL);

  return redacted;
}

export function redactURL(url: string): string {
  if (!url || typeof url !== 'string') return url;

  try {
    const urlObj = new URL(url);

    urlObj.pathname = redactPII(urlObj.pathname);
    urlObj.search = redactPII(urlObj.search);
    urlObj.hash = redactPII(urlObj.hash);

    return urlObj.toString();
  } catch {
    return redactPII(url);
  }
}

export function redactObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      redacted[key] = redactPII(value);
    } else if (Array.isArray(value)) {
      redacted[key] = value.map(item =>
        typeof item === 'string' ? redactPII(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactObject(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }

  return redacted as T;
}

export function sanitizeForGA4(params: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    'password', 'pwd', 'pass', 'secret', 'token', 'api_key', 'apikey',
    'credit_card', 'cc', 'cvv', 'ssn', 'social_security',
  ];

  const sanitized = redactObject(params);

  sensitiveKeys.forEach(key => {
    if (key in sanitized) {
      delete sanitized[key];
      logger.warn(`[Privacy] Removed sensitive key from analytics: ${key}`);
    }
  });

  return sanitized;
}

export function hashValue(value: string): string {
  if (typeof window === 'undefined' || !value) return '';

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function anonymizeIP(ip: string): string {
  if (!ip) return '';

  const parts = ip.split('.');
  if (parts.length === 4) {
    parts[3] = '0';
    return parts.join('.');
  }

  const ipv6Parts = ip.split(':');
  if (ipv6Parts.length > 4) {
    return ipv6Parts.slice(0, 4).join(':') + '::';
  }

  return ip;
}
