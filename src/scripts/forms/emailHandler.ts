/**
 * EmailJS Integration
 * Handle contact form submissions via EmailJS
 */

import emailjs from '@emailjs/browser';
import { validateContactForm, getFormData, showFieldError, hideFieldError } from './validation';
import { showSuccess, showError } from '../utils/notifications';

/**
 * EmailJS Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template with these variables:
 *    - {{from_name}} - Sender's name
 *    - {{from_email}} - Sender's email
 *    - {{company}} - Company name (optional)
 *    - {{subject}} - Message subject
 *    - {{message}} - Message content
 * 4. Get your credentials from EmailJS dashboard
 * 5. Replace the values below with your actual credentials
 */
const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID', // e.g., 'service_abc123'
  templateId: 'YOUR_TEMPLATE_ID', // e.g., 'template_xyz456'
  publicKey: 'YOUR_PUBLIC_KEY', // e.g., 'user_def789'
};

// Initialize EmailJS
export function initEmailJS() {
  emailjs.init(EMAILJS_CONFIG.publicKey);
  console.log('✓ EmailJS initialized');
}

/**
 * Handle contact form submission
 */
export async function handleContactFormSubmit(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;

  if (!submitButton) return;

  // Get form data
  const formData = getFormData(form);

  // Validate form data
  const validation = validateContactForm(formData);

  if (!validation.success) {
    // Show validation errors
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

  // Clear any previous errors
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach((input) => {
    hideFieldError(input as HTMLInputElement | HTMLTextAreaElement);
  });

  // Disable submit button and show loading state
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  submitButton.classList.add('opacity-75', 'cursor-not-allowed');

  try {
    // Check if EmailJS is configured
    if (
      EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID' ||
      EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID' ||
      EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY'
    ) {
      throw new Error(
        'EmailJS is not configured. Please set up your EmailJS credentials in src/scripts/forms/emailHandler.ts'
      );
    }

    // Send email via EmailJS
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
      // Success
      showSuccess('Message sent successfully! We\'ll get back to you soon.');
      form.reset();

      // Optional: Track form submission with analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submission', {
          event_category: 'Contact',
          event_label: 'Contact Form',
        });
      }
    } else {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    console.error('EmailJS Error:', error);

    if (error instanceof Error && error.message.includes('not configured')) {
      showError(error.message);
    } else {
      showError('Failed to send message. Please try again or contact us directly at hello@auxodata.com');
    }
  } finally {
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
  }
}

/**
 * Add real-time validation to form inputs
 */
export function addRealTimeValidation(form: HTMLFormElement) {
  const inputs = form.querySelectorAll('input, textarea');

  inputs.forEach((input) => {
    const element = input as HTMLInputElement | HTMLTextAreaElement;

    // Validate on blur (when user leaves field)
    element.addEventListener('blur', () => {
      const fieldName = element.name;
      const value = element.value;

      // Skip validation for optional company field if empty
      if (fieldName === 'company' && !value) {
        hideFieldError(element);
        return;
      }

      // Validate individual field
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

    // Clear error on input
    element.addEventListener('input', () => {
      hideFieldError(element);
    });
  });
}
