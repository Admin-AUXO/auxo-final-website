import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { DraftManager } from './draftManager';
import {
  getFormData,
  hideFieldError,
  hideFieldSuccess,
  showFieldError,
  showFieldSuccess,
  validateContactForm,
  validateField,
  type ContactFormData,
} from './validation';

const EMAILJS_CONFIG = env.emailjs;
const FORM_NAME = 'Contact Form';
const FORM_TYPE = 'contact';
const MESSAGE_FIELD_MAX_LENGTH = 500;
const DEFAULT_NOTIFICATION_DURATION = 4000;
const RATE_LIMIT_MS = 60000;
const VALIDATION_DEBOUNCE_MS = 250;

let emailjsInitialized = false;
let emailjsModulePromise: Promise<typeof import('@emailjs/browser')> | null = null;
let ga4ModulePromise: Promise<typeof import('@/scripts/analytics/ga4')> | null = null;
let lastSubmitTime = 0;

function loadEmailjsModule(): Promise<typeof import('@emailjs/browser')> {
  if (!emailjsModulePromise) {
    emailjsModulePromise = import('@emailjs/browser');
  }

  return emailjsModulePromise;
}

function loadGa4Module(): Promise<typeof import('@/scripts/analytics/ga4')> {
  if (!ga4ModulePromise) {
    ga4ModulePromise = import('@/scripts/analytics/ga4');
  }

  return ga4ModulePromise;
}

async function ensureEmailJsInitialized() {
  const emailjsModule = await loadEmailjsModule();
  const emailjs = emailjsModule.default;

  if (!emailjsInitialized && EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    emailjsInitialized = true;
  }

  return emailjs;
}

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

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

function updateMessageCounter(
  messageField: HTMLTextAreaElement,
  messageCounter: HTMLElement,
): void {
  const length = messageField.value.length;
  messageCounter.textContent = `${length}/${MESSAGE_FIELD_MAX_LENGTH}`;

  if (length > MESSAGE_FIELD_MAX_LENGTH * 0.9) {
    messageCounter.classList.add('text-accent-green', 'font-bold');
    messageCounter.classList.remove('text-theme-tertiary');
    return;
  }

  messageCounter.classList.remove('text-accent-green', 'font-bold');
  messageCounter.classList.add('text-theme-tertiary');
}

function trackFormStartAsync(): void {
  void loadGa4Module()
    .then((ga4) => {
      ga4.trackFormStart(FORM_NAME, window.location.pathname);
    })
    .catch((error) => {
      logger.warn('Form start tracking failed:', error);
    });
}

function trackFormSubmissionAsync(): void {
  void loadGa4Module()
    .then((ga4) => {
      ga4.trackFormSubmission({
        formName: FORM_NAME,
        formLocation: window.location.pathname,
        formType: FORM_TYPE,
      });
    })
    .catch((error) => {
      logger.warn('Form submission tracking failed:', error);
    });
}

function trackFormAbandonmentAsync(fieldsFilled: number): void {
  void loadGa4Module()
    .then((ga4) => {
      ga4.trackFormAbandonment(FORM_NAME, fieldsFilled);
    })
    .catch((error) => {
      logger.warn('Form abandonment tracking failed:', error);
    });
}

function validateFormField(
  fieldName: keyof ContactFormData,
  element: HTMLInputElement | HTMLTextAreaElement,
): void {
  const value = element.value.trim();

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

  const validation = validateField(fieldName, value);
  if (!validation.success) {
    showFieldError(element, validation.error);
    hideFieldSuccess(element);
    return;
  }

  hideFieldError(element);
  if (value) {
    showFieldSuccess(element);
  }
}

export function initEmailJS(): void {
  if (!EMAILJS_CONFIG.publicKey || emailjsInitialized) return;

  void ensureEmailJsInitialized().catch((error) => {
    logger.warn('EmailJS preload failed:', error);
  });
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
  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
  if (!submitButton) return;

  const formData = getFormData(form);
  const validation = validateContactForm(formData);

  if (!validation.success) {
    validation.error.issues.forEach((issue) => {
      const fieldName = issue.path[0];
      const input = form.querySelector(`[name="${fieldName}"]`) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;

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

    const emailjs = await ensureEmailJsInitialized();
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        from_name: validation.data.name,
        from_email: validation.data.email,
        company: validation.data.company || 'Not provided',
        subject: validation.data.subject,
        message: validation.data.message,
      },
      EMAILJS_CONFIG.publicKey,
    );

    if (response.status !== 200) {
      throw new Error('Failed to send message');
    }

    lastSubmitTime = now;
    showSuccess("Message sent successfully! We'll get back to you soon.");

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
    const messageField = form.querySelector('#message') as HTMLTextAreaElement | null;
    if (messageCounter && messageField) {
      updateMessageCounter(messageField, messageCounter);
    }

    trackFormSubmissionAsync();
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

export function addRealTimeValidation(form: HTMLFormElement): () => void {
  let formStartTracked = false;
  let formAbandoned = false;
  const completedFields = new Set<string>();
  const controller = new AbortController();

  const draftManager = new DraftManager(form, 'contact-form');
  draftManager.init();
  form._draftManager = draftManager;

  const trackFormInteraction = () => {
    if (formStartTracked) return;
    formStartTracked = true;
    trackFormStartAsync();
  };

  const trackAbandonment = () => {
    if (!formStartTracked || formAbandoned || completedFields.size === 0) return;
    formAbandoned = true;
    trackFormAbandonmentAsync(completedFields.size);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', trackAbandonment, {
      signal: controller.signal,
    });
  }

  const messageField = form.querySelector('#message') as HTMLTextAreaElement | null;
  const messageCounter = document.getElementById('message-counter');

  if (messageField && messageCounter) {
    const handleCounterUpdate = () => {
      updateMessageCounter(messageField, messageCounter);
    };

    handleCounterUpdate();
    messageField.addEventListener('input', handleCounterUpdate, {
      signal: controller.signal,
    });
  }

  form.querySelectorAll('input, textarea').forEach((input) => {
    const element = input as HTMLInputElement | HTMLTextAreaElement;
    const fieldName = element.name as keyof ContactFormData;
    const validateFieldState = debounce(() => {
      validateFormField(fieldName, element);
    }, VALIDATION_DEBOUNCE_MS);

    element.addEventListener('focus', trackFormInteraction, {
      once: true,
      signal: controller.signal,
    });

    element.addEventListener(
      'blur',
      () => {
        validateFieldState();

        if (element.value.trim()) {
          completedFields.add(fieldName);
        } else {
          completedFields.delete(fieldName);
        }
      },
      { signal: controller.signal },
    );

    element.addEventListener(
      'input',
      () => {
        hideFieldError(element);
        validateFieldState();
      },
      { signal: controller.signal },
    );
  });

  return () => {
    trackAbandonment();
    controller.abort();
    draftManager.destroy();
    delete form._draftManager;
  };
}
