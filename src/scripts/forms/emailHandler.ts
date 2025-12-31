import emailjs from '@emailjs/browser';
import { validateContactForm, getFormData, showFieldError, hideFieldError } from './validation';
import { showSuccess, showError } from '@/scripts/utils/notifications';

const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',
  templateId: 'YOUR_TEMPLATE_ID',
  publicKey: 'YOUR_PUBLIC_KEY',
};

let emailjsInitialized = false;

export function initEmailJS() {
  if (emailjsInitialized) return;
  emailjs.init(EMAILJS_CONFIG.publicKey);
  emailjsInitialized = true;
}

export async function handleContactFormSubmit(event: Event) {
  event.preventDefault();

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
    if (
      EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID' ||
      EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID' ||
      EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY'
    ) {
      throw new Error('EmailJS is not configured. Please set up your EmailJS credentials in src/scripts/forms/emailHandler.ts');
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
      showSuccess('Message sent successfully! We\'ll get back to you soon.');
      form.reset();

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'form_submission', {
          event_category: 'Contact',
          event_label: 'Contact Form',
        });
      }
    } else {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('.local')) {
      if (import.meta.env.DEV) console.error('Email send failed:', error);
    }
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
  form.querySelectorAll('input, textarea').forEach((input) => {
    const element = input as HTMLInputElement | HTMLTextAreaElement;

    element.addEventListener('blur', () => {
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
    });

    element.addEventListener('input', () => hideFieldError(element));
  });
}
