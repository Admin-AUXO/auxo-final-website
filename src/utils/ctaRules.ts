export interface CtaContext {
  text: string;
  href?: string;
  context?: 'hero' | 'cta-section' | 'service' | 'footer' | 'navigation';
}

const BOOKING_KEYWORDS = [
  'book', 'schedule', 'meeting', 'call', 'consultation',
  'demo', 'discovery', 'get started', "let's talk",
  'talk to us', 'speak with', 'meet with'
];

const CONTACT_KEYWORDS = [
  'contact', 'reach out', 'get in touch', 'inquiry',
  'question', 'learn more', 'find out', 'explore'
];

export function shouldOpenCalendly(context: CtaContext): boolean {
  const { text, href, context: ctx } = context;
  const lowerText = text.toLowerCase();
  const hasBookingIntent = BOOKING_KEYWORDS.some(keyword => lowerText.includes(keyword));
  const hasContactIntent = CONTACT_KEYWORDS.some(keyword => lowerText.includes(keyword));

  if (ctx === 'service' || ctx === 'hero') {
    return hasBookingIntent || (!hasContactIntent && !href?.includes('contact'));
  }

  if (ctx === 'cta-section') {
    return hasBookingIntent && !hasContactIntent;
  }

  if (ctx === 'footer' || ctx === 'navigation') {
    if (lowerText.includes("let's talk") || lowerText.includes("contact")) {
      return false;
    }
    return hasBookingIntent && !lowerText.includes("let's talk");
  }

  if (hasBookingIntent) return true;
  if (hasContactIntent && !hasBookingIntent) return false;
  if (href?.includes('contact') && !hasBookingIntent) return false;

  return !hasContactIntent;
}

export function getCtaAction(context: CtaContext): {
  type: 'calendly' | 'link';
  href?: string;
} {
  return shouldOpenCalendly(context)
    ? { type: 'calendly' }
    : { type: 'link', href: context.href };
}
