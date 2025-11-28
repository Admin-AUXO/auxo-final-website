/**
 * Form Validation using Zod
 * Type-safe schema validation with detailed error messages
 */

import { z } from 'zod';

/**
 * Contact Form Validation Schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),

  company: z
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),

  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Validate form data against schema
 */
export function validateContactForm(data: Record<string, any>) {
  return contactFormSchema.safeParse(data);
}

/**
 * Validate a single field
 */
export function validateField(fieldName: keyof ContactFormData, value: any) {
  try {
    const fieldSchema = contactFormSchema.shape[fieldName];
    fieldSchema.parse(value);
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Validation error' };
  }
}

/**
 * Get form data from form element
 */
export function getFormData(form: HTMLFormElement): Record<string, any> {
  const formData = new FormData(form);
  const data: Record<string, any> = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  return data;
}

/**
 * Display validation error on input field
 */
export function showFieldError(input: HTMLInputElement | HTMLTextAreaElement, message: string) {
  // Remove any existing error
  hideFieldError(input);

  // Add error class to input
  input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
  input.classList.remove('border-accent-green/20', 'focus:border-accent-green');

  // Create error message element
  const errorElement = document.createElement('p');
  errorElement.className = 'text-red-500 text-sm mt-1 validation-error';
  errorElement.textContent = message;
  errorElement.setAttribute('role', 'alert');

  // Insert error after input
  input.parentElement?.appendChild(errorElement);
}

/**
 * Hide validation error on input field
 */
export function hideFieldError(input: HTMLInputElement | HTMLTextAreaElement) {
  // Remove error class from input
  input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
  input.classList.add('border-accent-green/20', 'focus:border-accent-green');

  // Remove error message
  const errorElement = input.parentElement?.querySelector('.validation-error');
  errorElement?.remove();
}

/**
 * Show success state on input field
 */
export function showFieldSuccess(input: HTMLInputElement | HTMLTextAreaElement) {
  hideFieldError(input);
  input.classList.add('border-accent-green', 'focus:border-accent-green');
}
