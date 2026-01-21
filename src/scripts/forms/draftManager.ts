interface FormDraft {
  formId: string;
  data: Record<string, string>;
  timestamp: number;
  expiresAt: number;
}

const DRAFT_KEY_PREFIX = 'form_draft_';
const AUTO_SAVE_INTERVAL = 5000;
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000;

export class DraftManager {
  private form: HTMLFormElement;
  private formId: string;
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private isDraftRestored = false;

  constructor(form: HTMLFormElement, formId: string = 'contact-form') {
    this.form = form;
    this.formId = formId;
  }

  public init(): void {
    this.cleanExpiredDrafts();
    this.attemptDraftRestore();
    this.startAutoSave();
    console.log('[DraftManager] Initialized for form:', this.formId);
  }

  private startAutoSave(): void {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    this.autoSaveTimer = setInterval(() => this.saveDraft(), AUTO_SAVE_INTERVAL);
    console.log('[DraftManager] Auto-save started (every 5 seconds)');
  }

  private saveDraft(): void {
    const formData = this.getFormData();
    if (!this.hasAnyValue(formData)) return;

    const draft: FormDraft = {
      formId: this.formId,
      data: formData,
      timestamp: Date.now(),
      expiresAt: Date.now() + DRAFT_EXPIRY_MS,
    };

    try {
      localStorage.setItem(this.getDraftKey(), JSON.stringify(draft));
      console.log('[DraftManager] Draft saved:', Object.keys(formData).length, 'fields');
    } catch (error) {
      console.error('[DraftManager] Failed to save draft:', error);
    }
  }

  private attemptDraftRestore(): void {
    const draft = this.loadDraft();
    if (!draft) return;

    if (Date.now() > draft.expiresAt) {
      console.log('[DraftManager] Draft expired, removing...');
      this.clearDraft();
      return;
    }

    const ageMinutes = Math.floor((Date.now() - draft.timestamp) / 60000);
    const ageHours = Math.floor(ageMinutes / 60);
    const ageText = ageHours > 0
      ? `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`
      : `${ageMinutes} minute${ageMinutes !== 1 ? 's' : ''} ago`;

    const shouldRestore = confirm(`We found a draft from ${ageText}. Would you like to restore it?`);

    if (shouldRestore) {
      this.restoreDraft(draft);
    } else {
      this.clearDraft();
    }
  }

  private restoreDraft(draft: FormDraft): void {
    Object.entries(draft.data).forEach(([fieldName, value]) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLTextAreaElement;
      if (field) {
        field.value = value;
        if (fieldName === 'message') {
          field.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    this.isDraftRestored = true;
    console.log('[DraftManager] Draft restored');
    this.showNotification('Draft restored successfully!', 'success');
  }

  private loadDraft(): FormDraft | null {
    try {
      const draftJson = localStorage.getItem(this.getDraftKey());
      if (!draftJson) return null;
      return JSON.parse(draftJson) as FormDraft;
    } catch (error) {
      console.error('[DraftManager] Failed to load draft:', error);
      return null;
    }
  }

  public clearDraft(): void {
    try {
      localStorage.removeItem(this.getDraftKey());
      console.log('[DraftManager] Draft cleared');
    } catch (error) {
      console.error('[DraftManager] Failed to clear draft:', error);
    }
  }

  private cleanExpiredDrafts(): void {
    try {
      const keysToRemove: string[] = [];
      const now = Date.now();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DRAFT_KEY_PREFIX)) {
          const draftJson = localStorage.getItem(key);
          if (draftJson) {
            try {
              const draft = JSON.parse(draftJson) as FormDraft;
              if (now > draft.expiresAt) keysToRemove.push(key);
            } catch {
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      if (keysToRemove.length > 0) {
        console.log(`[DraftManager] Cleaned ${keysToRemove.length} expired draft(s)`);
      }
    } catch (error) {
      console.error('[DraftManager] Failed to clean expired drafts:', error);
    }
  }

  private getFormData(): Record<string, string> {
    const formData = new FormData(this.form);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = typeof value === 'string' ? value.trim() : String(value).trim();
    });
    return data;
  }

  private hasAnyValue(data: Record<string, string>): boolean {
    return Object.values(data).some(value => value.length > 0);
  }

  private getDraftKey(): string {
    return `${DRAFT_KEY_PREFIX}${this.formId}`;
  }

  private showNotification(message: string, type: 'success' | 'info' | 'error'): void {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in-bottom ${
      type === 'success' ? 'bg-accent-green text-on-accent' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-theme-card text-theme-primary border border-accent-green/20'
    }`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  public destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    console.log('[DraftManager] Destroyed');
  }
}

export function initDraftManager(form: HTMLFormElement, formId?: string): DraftManager {
  const manager = new DraftManager(form, formId);
  manager.init();
  return manager;
}
