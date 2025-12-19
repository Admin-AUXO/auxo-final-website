import { z } from 'zod';

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

export function validateContactForm(data: Record<string, any>) {
  return contactFormSchema.safeParse(data);
}

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

export function getFormData(form: HTMLFormElement): Record<string, any> {
  const formData = new FormData(form);
  const data: Record<string, any> = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  return data;
}

export function showFieldError(input: HTMLInputElement | HTMLTextAreaElement, message: string) {
  hideFieldError(input);

  input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
  input.classList.remove('border-accent-green/20', 'focus:border-accent-green');

  const errorElement = document.createElement('p');
  errorElement.className = 'text-red-500 text-sm mt-1 validation-error';
  errorElement.textContent = message;
  errorElement.setAttribute('role', 'alert');
  input.parentElement?.appendChild(errorElement);
}

export function hideFieldError(input: HTMLInputElement | HTMLTextAreaElement) {
  input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
  input.classList.add('border-accent-green/20', 'focus:border-accent-green');
  input.parentElement?.querySelector('.validation-error')?.remove();
}

export function showFieldSuccess(input: HTMLInputElement | HTMLTextAreaElement) {
  hideFieldError(input);
  input.classList.add('border-accent-green', 'focus:border-accent-green');
}
