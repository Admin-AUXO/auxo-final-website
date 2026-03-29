import emailjs from '@emailjs/browser';
import { env } from '@/config/env';
import { validateContactForm, getFormData, showFieldError, hideFieldError, showFieldSuccess, hideFieldSuccess } from './validation';
import { trackFormSubmission, trackFormStart, trackFormAbandonment } from '@/scripts/analytics/ga4';
import { logger } from '@/lib/logger';
import { DraftManager } from './draftManager';

const EMAILJS_CONFIG = env.emailjs;

let emailjsInitialized = false;
let lastSubmitTime = 0;
const RATE_LIMIT_MS = 60000;
const DEFAULT_NOTIFICATION_DURATION = 4000;

function getNotificationColor(type: 'success' | 'error'): string {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  if (type === 'success') {
    return computedStyle.getPropertyValue('--accent-green').trim() || '#A3E635';
  }

  return computedStyle.getPropertyValue('--error-color').trim() || '#EF4444';
}

function showNotification(
  message: string,
  type: 'success' | 'error',
  duration: number = DEFAULT_NOTIFICATION_DURATION,
): void {
  const toast = document.createElement('div');
  toast.className = [
    'fixed bottom-6 right-6 z-[200]',
    'min-w-[280px] max-w-[400px]',
    'px-6 py-4 rounded-lg shadow-xl',
    'text-white font-medium text-base',
    'transition-all duration-300 ease-out',
    'cursor-pointer',
  ].join(' ');
  toast.style.backgroundColor = getNotificationColor(type);
  toast.style.transform = 'translateX(500px)';
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const closeButton = document.createElement('button');
  closeButton.className = 'ml-3 opacity-70 hover:opacity-100 transition-opacity';
  closeButton.textContent = '×';
  closeButton.style.cssText =
    'float: right; font-size: 24px; line-height: 1; background: none; border: none; color: white; cursor: pointer; padding: 0; margin: -4px 0 0 12px;';
  closeButton.setAttribute('aria-label', 'Close notification');
  toast.appendChild(closeButton);

  const removeToast = () => {
    toast.style.transform = 'translateX(500px)';
    toast.style.opacity = '0';
    window.setTimeout(() => {
      toast.remove();
    }, 300);
  };

  toast.addEventListener('click', removeToast);
  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    removeToast();
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });

  window.setTimeout(removeToast, duration);
}

function showSuccess(message: string): void {
  showNotification(message, 'success');
}

function showError(message: string): void {
  showNotification(message, 'error');
}

export function initEmailJS(): void {
  if (emailjsInitialized) return;
  if (EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    emailjsInitialized = true;
  }
}

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
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
    validation.error.issues.forEach((issue) => {
      const fieldName = issue.path[0] as string;
      const input = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLTextAreaElement;
      if (input) {
        showFieldError(input, issue.message);
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


      const draftManager = form._draftManager;
      if (draftManager) {
        draftManager.clearDraft();
      }

      form.reset();
      form.querySelectorAll('input, textarea').forEach((input) => {
        hideFieldError(input as HTMLInputElement | HTMLTextAreaElement);
        hideFieldSuccess(input as HTMLInputElement | HTMLTextAreaElement);
      });


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

export function addRealTimeValidation(form: HTMLFormElement): void {
  let formStartTracked = false;
  let fieldsFilled = 0;
  let formAbandoned = false;


  const draftManager = new DraftManager(form, 'contact-form');
  draftManager.init();


  form._draftManager = draftManager;

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


  const messageField = form.querySelector('#message') as HTMLTextAreaElement;
  const messageCounter = document.getElementById('message-counter');

  if (messageField && messageCounter) {
    const updateCounter = () => {
      const length = messageField.value.length;
      const maxLength = 500;
      messageCounter.textContent = `${length}/${maxLength}`;


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


      if (fieldName === 'company' && !value) {
        hideFieldError(element);
        hideFieldSuccess(element);
        return;
      }


      if (!value && element !== document.activeElement) {
        hideFieldError(element);
        hideFieldSuccess(element);
        return;
      }

      const formData = getFormData(form);
      const validation = validateContactForm(formData);

      if (!validation.success) {
        const fieldError = validation.error.issues.find((issue) => issue.path[0] === fieldName);
        if (fieldError) {
          showFieldError(element, fieldError.message);
          hideFieldSuccess(element);
        } else {

          hideFieldError(element);
          if (value) {
            showFieldSuccess(element);
          }
        }
      } else {

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

      hideFieldError(element);


      validateField();
    });
  });
}
