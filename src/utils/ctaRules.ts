/**
 * Context-based rules for determining when to use Calendly vs Contact page
 * 
 * Rules:
 * - Booking/Scheduling actions → Calendly (direct meeting booking)
 * - Contact/Inquiry actions → Contact page (general inquiries, questions)
 * - Service-specific CTAs → Calendly (action-oriented)
 * - Informational CTAs → Contact page (exploratory)
 */

export interface CtaContext {
  text: string;
  href?: string;
  context?: 'hero' | 'cta-section' | 'service' | 'footer' | 'navigation';
}

/**
 * Determines if a CTA should open Calendly based on button text and context
 */
export function shouldOpenCalendly(context: CtaContext): boolean {
  const { text, href, context: ctx } = context;
  const lowerText = text.toLowerCase();

  // Explicit booking/scheduling keywords → Always Calendly
  const bookingKeywords = [
    'book',
    'schedule',
    'meeting',
    'call',
    'consultation',
    'demo',
    'discovery',
    'get started',
    "let's talk",
    'talk to us',
    'speak with',
    'meet with'
  ];

  // Contact/inquiry keywords → Contact page (unless explicitly booking)
  const contactKeywords = [
    'contact',
    'reach out',
    'get in touch',
    'inquiry',
    'question',
    'learn more',
    'find out',
    'explore'
  ];

  // Check for explicit booking intent
  const hasBookingIntent = bookingKeywords.some(keyword => lowerText.includes(keyword));
  
  // Check for contact intent (but booking takes precedence)
  const hasContactIntent = contactKeywords.some(keyword => lowerText.includes(keyword));

  // Context-based rules
  if (ctx === 'service' || ctx === 'hero') {
    // Service pages and hero sections: prioritize action (Calendly)
    return hasBookingIntent || (!hasContactIntent && !href?.includes('contact'));
  }

  if (ctx === 'cta-section') {
    // CTA sections: booking keywords → Calendly, contact keywords → Contact page
    return hasBookingIntent && !hasContactIntent;
  }

  if (ctx === 'footer' || ctx === 'navigation') {
    // Footer/navigation: "Contact Us" → Contact page, "Book Meeting" → Calendly
    return hasBookingIntent;
  }

  // Default: booking keywords → Calendly, otherwise check href
  if (hasBookingIntent) return true;
  if (hasContactIntent && !hasBookingIntent) return false;
  
  // If href points to contact, use contact page unless explicitly booking
  if (href?.includes('contact') && !hasBookingIntent) return false;

  // Default fallback: if no clear intent, use Calendly for action-oriented CTAs
  return !hasContactIntent;
}

/**
 * Gets the appropriate action for a CTA button
 */
export function getCtaAction(context: CtaContext): {
  type: 'calendly' | 'link';
  href?: string;
} {
  const shouldCalendly = shouldOpenCalendly(context);
  
  if (shouldCalendly) {
    return { type: 'calendly' };
  }
  
  return {
    type: 'link',
    href: context.href
  };
}
