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
    .max(500, 'Message must be less than 500 characters'),
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

export function getFormData(form: HTMLFormElement): Record<string, string> {
  const formData = new FormData(form);
  const data: Record<string, string> = {};
  formData.forEach((value, key) => {
    data[key] = typeof value === 'string' ? value : String(value);
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
  input.classList.remove('border-accent-green/20', 'border-red-500');
  input.classList.add('border-accent-green', 'focus:border-accent-green');
  input.parentElement?.querySelector('.validation-success')?.remove();

  const successElement = document.createElement('div');
  successElement.className = 'validation-success absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center';
  successElement.innerHTML = `
    <svg class="w-5 h-5 text-accent-green animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
    </svg>
  `;

  const parent = input.parentElement;
  if (parent) {
    if (!parent.style.position) {
      parent.style.position = 'relative';
    }

    if (input.tagName === 'TEXTAREA') {
      successElement.style.top = '50px';
      successElement.style.transform = 'none';
    }

    parent.appendChild(successElement);
  }
}

export function hideFieldSuccess(input: HTMLInputElement | HTMLTextAreaElement) {
  input.classList.remove('border-accent-green');
  input.classList.add('border-accent-green/20');
  input.parentElement?.querySelector('.validation-success')?.remove();
}
