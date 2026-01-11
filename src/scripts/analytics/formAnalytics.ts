import { trackEvent } from './ga4';
import { logger } from '@/lib/logger';

interface FieldInteraction {
  fieldName: string;
  fieldType: string;
  interactionCount: number;
  timeSpent: number;
  errorCount: number;
  focusTime: number;
  blurTime: number;
  changed: boolean;
}

interface FormMetrics {
  formId: string;
  formName: string;
  startTime: number;
  fields: Map<string, FieldInteraction>;
  currentField: string | null;
  currentFieldFocusTime: number;
}

export class FormAnalytics {
  private forms: Map<HTMLFormElement, FormMetrics> = new Map();
  private cleanupFunctions: Array<() => void> = [];

  constructor() {
    this.initTracking();
  }

  private initTracking(): void {
    if (typeof window === 'undefined') return;

    const forms = document.querySelectorAll('form');
    forms.forEach(form => this.trackForm(form));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLFormElement) {
            this.trackForm(node);
          } else if (node instanceof HTMLElement) {
            const forms = node.querySelectorAll('form');
            forms.forEach(form => this.trackForm(form));
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.cleanupFunctions.push(() => observer.disconnect());
  }

  private trackForm(form: HTMLFormElement): void {
    if (this.forms.has(form)) return;

    const formId = form.id || form.name || `form_${this.forms.size + 1}`;
    const formName = form.getAttribute('data-form-name') || formId;

    const metrics: FormMetrics = {
      formId,
      formName,
      startTime: 0,
      fields: new Map(),
      currentField: null,
      currentFieldFocusTime: 0,
    };

    this.forms.set(form, metrics);

    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => this.trackField(field as HTMLInputElement, form, metrics));

    form.addEventListener('submit', (e) => this.handleFormSubmit(e, form, metrics));

    const formAbandonCheck = () => {
      if (metrics.startTime > 0 && !form.classList.contains('submitted')) {
        this.handleFormAbandonment(form, metrics);
      }
    };

    window.addEventListener('beforeunload', formAbandonCheck);
    this.cleanupFunctions.push(() => window.removeEventListener('beforeunload', formAbandonCheck));
  }

  private trackField(
    field: HTMLInputElement,
    form: HTMLFormElement,
    metrics: FormMetrics
  ): void {
    const fieldName = field.name || field.id || field.placeholder || 'unnamed';
    const fieldType = field.type || field.tagName.toLowerCase();

    if (!metrics.fields.has(fieldName)) {
      metrics.fields.set(fieldName, {
        fieldName,
        fieldType,
        interactionCount: 0,
        timeSpent: 0,
        errorCount: 0,
        focusTime: 0,
        blurTime: 0,
        changed: false,
      });
    }

    const handleFocus = () => {
      if (metrics.startTime === 0) {
        metrics.startTime = Date.now();
        trackEvent('form_start', {
          form_id: metrics.formId,
          form_name: metrics.formName,
          form_location: window.location.pathname,
        });
      }

      metrics.currentField = fieldName;
      metrics.currentFieldFocusTime = Date.now();

      const fieldMetrics = metrics.fields.get(fieldName)!;
      fieldMetrics.interactionCount++;
      fieldMetrics.focusTime = Date.now();
    };

    const handleBlur = () => {
      if (metrics.currentField === fieldName && metrics.currentFieldFocusTime > 0) {
        const timeSpent = Date.now() - metrics.currentFieldFocusTime;
        const fieldMetrics = metrics.fields.get(fieldName)!;
        fieldMetrics.timeSpent += timeSpent;
        fieldMetrics.blurTime = Date.now();

        trackEvent('form_field_interaction', {
          form_id: metrics.formId,
          form_name: metrics.formName,
          field_name: fieldName,
          field_type: fieldType,
          time_spent: Math.round(timeSpent / 1000),
          interaction_count: fieldMetrics.interactionCount,
        });

        metrics.currentField = null;
      }
    };

    const handleChange = () => {
      const fieldMetrics = metrics.fields.get(fieldName)!;
      fieldMetrics.changed = true;
    };

    const handleInvalid = () => {
      const fieldMetrics = metrics.fields.get(fieldName)!;
      fieldMetrics.errorCount++;

      trackEvent('form_field_error', {
        form_id: metrics.formId,
        form_name: metrics.formName,
        field_name: fieldName,
        field_type: fieldType,
        error_type: field.validationMessage || 'validation_error',
      });
    };

    field.addEventListener('focus', handleFocus);
    field.addEventListener('blur', handleBlur);
    field.addEventListener('change', handleChange);
    field.addEventListener('invalid', handleInvalid);

    this.cleanupFunctions.push(() => {
      field.removeEventListener('focus', handleFocus);
      field.removeEventListener('blur', handleBlur);
      field.removeEventListener('change', handleChange);
      field.removeEventListener('invalid', handleInvalid);
    });
  }

  private handleFormSubmit(
    e: Event,
    form: HTMLFormElement,
    metrics: FormMetrics
  ): void {
    const completionTime = metrics.startTime > 0
      ? Date.now() - metrics.startTime
      : 0;

    const filledFields = Array.from(metrics.fields.values()).filter(f => f.changed).length;
    const totalFields = metrics.fields.size;
    const fieldsWithErrors = Array.from(metrics.fields.values()).filter(f => f.errorCount > 0).length;

    trackEvent('form_submit', {
      form_id: metrics.formId,
      form_name: metrics.formName,
      form_location: window.location.pathname,
      completion_time: Math.round(completionTime / 1000),
      filled_fields: filledFields,
      total_fields: totalFields,
      fields_with_errors: fieldsWithErrors,
      completion_rate: totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0,
    });

    form.classList.add('submitted');
  }

  private handleFormAbandonment(form: HTMLFormElement, metrics: FormMetrics): void {
    const filledFields = Array.from(metrics.fields.values()).filter(f => f.changed).length;
    const totalFields = metrics.fields.size;

    if (filledFields > 0) {
      const timeSpent = metrics.startTime > 0 ? Date.now() - metrics.startTime : 0;

      trackEvent('form_abandonment', {
        form_id: metrics.formId,
        form_name: metrics.formName,
        form_location: window.location.pathname,
        filled_fields: filledFields,
        total_fields: totalFields,
        time_spent: Math.round(timeSpent / 1000),
        abandonment_field: metrics.currentField || 'unknown',
      });

      logger.log('[Form] Abandonment detected:', metrics.formName, `${filledFields}/${totalFields} fields`);
    }
  }

  public destroy(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.forms.clear();
  }
}

export function initFormAnalytics(): FormAnalytics {
  return new FormAnalytics();
}
