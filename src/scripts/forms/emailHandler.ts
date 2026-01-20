import emailjs from '@emailjs/browser';
import { env } from '@/config/env';
import { validateContactForm, getFormData, showFieldError, hideFieldError } from './validation';
import { showSuccess, showError } from '@/scripts/utils/notifications';
import { trackFormSubmission, trackFormStart, trackFormAbandonment } from '@/scripts/analytics/ga4';
import { logger } from '@/lib/logger';

const EMAILJS_CONFIG = env.emailjs;

let emailjsInitialized = false;
let lastSubmitTime = 0;
const RATE_LIMIT_MS = 60000;

export function initEmailJS() {
  if (emailjsInitialized) return;
  if (EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    emailjsInitialized = true;
  }
}

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export async function handleContactFormSubmit(event: Event) {
  event.preventDefault();

  const now = Date.now();
  if (now - lastSubmitTime < RATE_LIMIT_MS) {
    const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
    showError(`Please wait ${remainingSeconds} seconds before submitting again.`);
    return;
  }

  const form = event.target as HTMLFormElement;
  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  if (!submitButton) return;

  const formData = getFormData(form);
  const validation = validateContactForm(formData);

  if (!validation.success) {
    validation.error.errors.forEach((error) => {
      const fieldName = error.path[0] as string;
      const input = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLTextAreaElement;
      if (input) {
        showFieldError(input, error.message);
      }
    });
    showError('Please correct the errors in the form');
    return;
  }

  form.querySelectorAll('input, textarea').forEach((input) => {
    hideFieldError(input as HTMLInputElement | HTMLTextAreaElement);
  });

  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  submitButton.classList.add('opacity-75', 'cursor-not-allowed');

  try {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
      throw new Error('EmailJS is not configured. Please check your environment variables.');
    }

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company || 'Not provided',
        subject: formData.subject,
        message: formData.message,
      },
      EMAILJS_CONFIG.publicKey
    );

    if (response.status === 200) {
      lastSubmitTime = now;
      showSuccess('Message sent successfully! We\'ll get back to you soon.');
      form.reset();
      form.querySelectorAll('input, textarea').forEach((input) => {
        hideFieldError(input as HTMLInputElement | HTMLTextAreaElement);
      });

      trackFormSubmission({
        formName: 'Contact Form',
        formLocation: window.location.pathname,
        formType: 'contact',
      });
    } else {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    logger.error('Email send failed:', error);
    if (error instanceof Error && error.message.includes('not configured')) {
      showError(error.message);
    } else {
      showError('Failed to send message. Please try again or contact us directly at hello@auxodata.com');
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
  }
}

export function addRealTimeValidation(form: HTMLFormElement) {
  let formStartTracked = false;
  let fieldsFilled = 0;
  let formAbandoned = false;

  const trackFormInteraction = () => {
    if (!formStartTracked) {
      trackFormStart('Contact Form', window.location.pathname);
      formStartTracked = true;
    }
  };

  const trackAbandonment = () => {
    if (formStartTracked && !formAbandoned && fieldsFilled > 0) {
      trackFormAbandonment('Contact Form', fieldsFilled);
      formAbandoned = true;
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', trackAbandonment);
  }

  form.querySelectorAll('input, textarea').forEach((input) => {
    const element = input as HTMLInputElement | HTMLTextAreaElement;

    const validateField = debounce(() => {
      const fieldName = element.name;
      const value = element.value;

      if (fieldName === 'company' && !value) {
        hideFieldError(element);
        return;
      }

      const formData = getFormData(form);
      const validation = validateContactForm(formData);

      if (!validation.success) {
        const fieldError = validation.error.errors.find((error) => error.path[0] === fieldName);
        if (fieldError) {
          showFieldError(element, fieldError.message);
        } else {
          hideFieldError(element);
        }
      } else {
        hideFieldError(element);
      }
    }, 500);

    element.addEventListener('focus', trackFormInteraction, { once: true });

    element.addEventListener('blur', () => {
      validateField();
      if (element.value.trim()) {
        fieldsFilled++;
      }
    });

    element.addEventListener('input', () => {
      hideFieldError(element);
      validateField();
    });
  });
}
