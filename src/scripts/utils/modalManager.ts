import { lockScroll, unlockScroll } from '@/scripts/navigation/utils';
import { logger } from '@/lib/logger';

export interface ModalConfig {
  modalId: string;
  triggerSelector?: string;
  closeSelector?: string;
  overlaySelector?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onBeforeOpen?: () => boolean;
  onBeforeClose?: () => boolean;
  enableKeyboardNavigation?: boolean;
  enableClickOutsideClose?: boolean;
  scrollLock?: boolean;
}

export interface ModalInstance {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
  destroy: () => void;
}

class ModalManager {
  private modals = new Map<string, ModalInstance>();
  private activeModal: ModalInstance | null = null;

  create(config: ModalConfig): ModalInstance {
    if (this.modals.has(config.modalId)) {
      logger.warn(`Modal with id "${config.modalId}" already exists`);
      return this.modals.get(config.modalId)!;
    }

    const instance = new ModalInstanceImpl(config, this);
    this.modals.set(config.modalId, instance);
    return instance;
  }

  get(modalId: string): ModalInstance | undefined {
    return this.modals.get(modalId);
  }

  closeAll(): void {
    this.modals.forEach(modal => {
      if (modal.isOpen()) {
        modal.close();
      }
    });
  }

  destroy(modalId: string): void {
    const modal = this.modals.get(modalId);
    if (modal) {
      modal.destroy();
      this.modals.delete(modalId);
      if (this.activeModal === modal) {
        this.activeModal = null;
      }
    }
  }

  _setActiveModal(modal: ModalInstance | null): void {
    this.activeModal = modal;
  }

  _getActiveModal(): ModalInstance | null {
    return this.activeModal;
  }
}

class ModalInstanceImpl implements ModalInstance {
  private modal: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private closeButtons: NodeListOf<HTMLElement> | null = null;
  private triggers: NodeListOf<HTMLElement> | null = null;
  private eventListeners: Array<{ element: Element | Window | Document; event: string; handler: EventListener; options?: boolean | AddEventListenerOptions }> = [];
  private isDestroyed = false;

  constructor(private config: ModalConfig, private manager: ModalManager) {
    this.initialize();
  }

  private initialize(): void {
    this.modal = document.getElementById(this.config.modalId);
    if (!this.modal) {
      logger.error(`Modal element with id "${this.config.modalId}" not found`);
      return;
    }

    if (this.config.overlaySelector) {
      this.overlay = this.modal.querySelector(this.config.overlaySelector) || document.querySelector(this.config.overlaySelector);
    }

    if (this.config.closeSelector) {
      this.closeButtons = this.modal.querySelectorAll(this.config.closeSelector);
    }

    if (this.config.triggerSelector) {
      this.triggers = document.querySelectorAll(this.config.triggerSelector);
    }

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.modal) return;

    if (this.closeButtons) {
      this.closeButtons.forEach(button => {
        this.addEventListener(button, 'click', this.handleClose);
      });
    }

    if (this.triggers) {
      this.triggers.forEach(trigger => {
        this.addEventListener(trigger, 'click', this.handleOpen);
      });
    }

    if (this.config.enableClickOutsideClose !== false && this.overlay) {
      this.addEventListener(this.overlay, 'click', this.handleClose);
    }

    if (this.config.enableKeyboardNavigation !== false) {
      this.addTypedEventListener(document, 'keydown', this.handleKeydown);
    }
  }

  private addEventListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options);
    this.eventListeners.push({ element, event, handler, options });
  }

  private addTypedEventListener<K extends keyof HTMLElementEventMap>(
    element: Element | Window | Document,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    const eventHandler = handler as EventListener;
    element.addEventListener(event, eventHandler, options);
    this.eventListeners.push({ element, event, handler: eventHandler, options });
  }

  private removeAllEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.eventListeners.length = 0;
  }

  private handleOpen = (e?: Event): void => {
    e?.preventDefault();
    e?.stopPropagation();

    if (this.config.onBeforeOpen && !this.config.onBeforeOpen()) {
      return;
    }

    const activeModal = this.manager._getActiveModal();
    if (activeModal && activeModal !== this) {
      activeModal.close();
    }

    this.open();
  };

  private handleClose = (e?: Event): void => {
    if (!e?.target) return;

    const target = e.target as HTMLElement;

    if (target === this.overlay) {
      e.preventDefault();
      e.stopPropagation();

      if (this.config.onBeforeClose && !this.config.onBeforeClose()) {
        return;
      }

      this.close();
      return;
    }

    if (this.closeButtons) {
      const isCloseButton = Array.from(this.closeButtons).some(button => button === target || button.contains(target));
      if (isCloseButton) {
        e.preventDefault();
        e.stopPropagation();

        if (this.config.onBeforeClose && !this.config.onBeforeClose()) {
          return;
        }

        this.close();
        return;
      }
    }

    if (this.config.enableClickOutsideClose !== false && this.modal) {
      const isDescendant = this.modal.contains(target);
      if (!isDescendant) {
        e.preventDefault();
        e.stopPropagation();

        if (this.config.onBeforeClose && !this.config.onBeforeClose()) {
          return;
        }

        this.close();
      }
    }
  };

  private handleKeydown = (e: KeyboardEvent): void => {
    if (!this.isOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  };

  open(): void {
    if (!this.modal || this.isDestroyed) return;

    this.manager._setActiveModal(this);

    if (this.config.scrollLock !== false) {
      lockScroll();
    }

    this.modal.removeAttribute('hidden');
    this.modal.setAttribute('aria-hidden', 'false');

    const focusableElement = this.modal.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusableElement?.focus();

    this.config.onOpen?.();
  }

  close(): void {
    if (!this.modal || this.isDestroyed) return;

    this.manager._setActiveModal(null);

    if (this.config.scrollLock !== false) {
      unlockScroll();
    }

    this.modal.setAttribute('hidden', '');
    this.modal.setAttribute('aria-hidden', 'true');

    this.config.onClose?.();
  }

  isOpen(): boolean {
    return this.modal ? !this.modal.hasAttribute('hidden') : false;
  }

  destroy(): void {
    this.close();
    this.removeAllEventListeners();
    this.isDestroyed = true;
  }
}

export const modalManager = new ModalManager();

export function createCalendarModal(): ModalInstance {
  return modalManager.create({
    modalId: 'calendar-modal',
    triggerSelector: '[data-google-calendar-open]',
    closeSelector: '[data-calendar-close]',
    overlaySelector: '[data-calendar-overlay]',
    enableKeyboardNavigation: true,
    enableClickOutsideClose: true,
    scrollLock: true,
  });
}

export function createServicesDropdown(dropdownId: string): ModalInstance {
  return modalManager.create({
    modalId: dropdownId,
    enableKeyboardNavigation: true,
    enableClickOutsideClose: true,
    scrollLock: true,
  });
}