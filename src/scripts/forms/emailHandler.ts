import emailjs from '@emailjs/browser';
import { env } from '@/config/env';
import { validateContactForm, getFormData, showFieldError, hideFieldError, showFieldSuccess, hideFieldSuccess } from './validation';
import { showSuccess, showError } from '@/scripts/utils/notifications';
import { trackFormSubmission, trackFormStart, trackFormAbandonment } from '@/scripts/analytics/ga4';
import { logger } from '@/lib/logger';
import { DraftManager } from './draftManager';

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

      // Clear draft after successful submission
      const draftManager = (form as any)._draftManager as DraftManager | undefined;
      if (draftManager) {
        draftManager.clearDraft();
      }

      form.reset();
      form.querySelectorAll('input, textarea').forEach((input) => {
        hideFieldError(input as HTMLInputElement | HTMLTextAreaElement);
        hideFieldSuccess(input as HTMLInputElement | HTMLTextAreaElement);
      });

      // Reset character counter
      const messageCounter = document.getElementById('message-counter');
      if (messageCounter) {
        messageCounter.textContent = '0/500';
      }

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

  // Initialize draft manager
  const draftManager = new DraftManager(form, 'contact-form');
  draftManager.init();

  // Store reference to draft manager on form for cleanup
  (form as any)._draftManager = draftManager;

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

  // Setup character counter for message field
  const messageField = form.querySelector('#message') as HTMLTextAreaElement;
  const messageCounter = document.getElementById('message-counter');

  if (messageField && messageCounter) {
    const updateCounter = () => {
      const length = messageField.value.length;
      const maxLength = 500;
      messageCounter.textContent = `${length}/${maxLength}`;

      // Change color when approaching limit
      if (length > maxLength * 0.9) {
        messageCounter.classList.add('text-accent-green', 'font-bold');
        messageCounter.classList.remove('text-theme-tertiary');
      } else {
        messageCounter.classList.remove('text-accent-green', 'font-bold');
        messageCounter.classList.add('text-theme-tertiary');
      }
    };

    messageField.addEventListener('input', updateCounter);
  }

  form.querySelectorAll('input, textarea').forEach((input) => {
    const element = input as HTMLInputElement | HTMLTextAreaElement;

    const validateField = debounce(() => {
      const fieldName = element.name;
      const value = element.value;

      // Company is optional, don't validate if empty
      if (fieldName === 'company' && !value) {
        hideFieldError(element);
        hideFieldSuccess(element);
        return;
      }

      // Don't validate if field is empty (except on blur)
      if (!value && element !== document.activeElement) {
        hideFieldError(element);
        hideFieldSuccess(element);
        return;
      }

      const formData = getFormData(form);
      const validation = validateContactForm(formData);

      if (!validation.success) {
        const fieldError = validation.error.errors.find((error) => error.path[0] === fieldName);
        if (fieldError) {
          showFieldError(element, fieldError.message);
          hideFieldSuccess(element);
        } else {
          // Field is valid
          hideFieldError(element);
          if (value) {
            showFieldSuccess(element);
          }
        }
      } else {
        // All form is valid, show success for this field if it has a value
        hideFieldError(element);
        if (value) {
          showFieldSuccess(element);
        }
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
      // Remove error immediately on input
      hideFieldError(element);

      // Validate field after debounce
      validateField();
    });
  });
}
