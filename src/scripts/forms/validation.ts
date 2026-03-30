export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

export interface ValidationIssue {
  path: [keyof ContactFormData];
  message: string;
}

type FieldValidator = (value: string) => string | null;
type ContactFormValidationResult =
  | { success: true; data: ContactFormData }
  | { success: false; error: { issues: ValidationIssue[] } };

const NAME_PATTERN = /^[a-zA-Z\s'-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_VALIDATORS: Record<keyof ContactFormData, FieldValidator> = {
  name(value) {
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (value.length > 100) return 'Name must be less than 100 characters';
    if (!NAME_PATTERN.test(value)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return null;
  },
  email(value) {
    if (!value) return 'Email is required';
    if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email address';
    if (value.length > 255) return 'Email must be less than 255 characters';
    return null;
  },
  company(value) {
    if (value.length > 100) return 'Company name must be less than 100 characters';
    return null;
  },
  subject(value) {
    if (value.length < 5) return 'Subject must be at least 5 characters';
    if (value.length > 200) return 'Subject must be less than 200 characters';
    return null;
  },
  message(value) {
    if (value.length < 20) return 'Message must be at least 20 characters';
    if (value.length > 500) return 'Message must be less than 500 characters';
    return null;
  },
};

function normalizeFieldValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

function buildIssue(
  fieldName: keyof ContactFormData,
  message: string,
): ValidationIssue {
  return { path: [fieldName], message };
}

export function validateContactForm(
  data: Record<string, unknown>,
): ContactFormValidationResult {
  const normalizedData: ContactFormData = {
    name: normalizeFieldValue(data.name),
    email: normalizeFieldValue(data.email),
    company: normalizeFieldValue(data.company),
    subject: normalizeFieldValue(data.subject),
    message: normalizeFieldValue(data.message),
  };

  const issues = (Object.keys(FIELD_VALIDATORS) as Array<keyof ContactFormData>)
    .map((fieldName) => {
      const message = FIELD_VALIDATORS[fieldName](normalizedData[fieldName]);
      return message ? buildIssue(fieldName, message) : null;
    })
    .filter((issue): issue is ValidationIssue => issue !== null);

  if (issues.length > 0) {
    return { success: false, error: { issues } };
  }

  return { success: true, data: normalizedData };
}

export function validateField(
  fieldName: keyof ContactFormData,
  value: unknown,
): { success: true; error: null } | { success: false; error: string } {
  const validator = FIELD_VALIDATORS[fieldName];
  const message = validator(normalizeFieldValue(value));

  if (message) {
    return { success: false, error: message };
  }

  return { success: true, error: null };
}

export function getFormData(form: HTMLFormElement): Record<string, string> {
  const formData = new FormData(form);
  const data: Record<string, string> = {};

  formData.forEach((value, key) => {
    data[key] = typeof value === 'string' ? value : String(value);
  });

  return data;
}

export function showFieldError(
  input: HTMLInputElement | HTMLTextAreaElement,
  message: string,
): void {
  hideFieldError(input);

  input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
  input.classList.remove('border-accent-green/20', 'focus:border-accent-green');

  const errorElement = document.createElement('p');
  errorElement.className = 'text-red-500 text-sm mt-1 validation-error';
  errorElement.textContent = message;
  errorElement.setAttribute('role', 'alert');
  input.parentElement?.appendChild(errorElement);
}

export function hideFieldError(input: HTMLInputElement | HTMLTextAreaElement): void {
  input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
  input.classList.add('border-accent-green/20', 'focus:border-accent-green');
  input.parentElement?.querySelector('.validation-error')?.remove();
}

export function showFieldSuccess(input: HTMLInputElement | HTMLTextAreaElement): void {
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
  if (!parent) return;

  if (!parent.style.position) {
    parent.style.position = 'relative';
  }

  if (input.tagName === 'TEXTAREA') {
    successElement.style.top = '50px';
    successElement.style.transform = 'none';
  }

  parent.appendChild(successElement);
}

export function hideFieldSuccess(input: HTMLInputElement | HTMLTextAreaElement): void {
  input.classList.remove('border-accent-green');
  input.classList.add('border-accent-green/20');
  input.parentElement?.querySelector('.validation-success')?.remove();
}
