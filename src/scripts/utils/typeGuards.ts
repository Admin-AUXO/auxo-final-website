export function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

export function isHTMLButtonElement(value: unknown): value is HTMLButtonElement {
  return value instanceof HTMLButtonElement;
}

export function isHTMLAnchorElement(value: unknown): value is HTMLAnchorElement {
  return value instanceof HTMLAnchorElement;
}

export function isHTMLInputElement(value: unknown): value is HTMLInputElement {
  return value instanceof HTMLInputElement;
}

export function isHTMLFormElement(value: unknown): value is HTMLFormElement {
  return value instanceof HTMLFormElement;
}

export function isHTMLTextAreaElement(value: unknown): value is HTMLTextAreaElement {
  return value instanceof HTMLTextAreaElement;
}

export function getHTMLElementTarget(event: Event): HTMLElement | null {
  return isHTMLElement(event.target) ? event.target : null;
}

export function closestHTMLElement<T extends HTMLElement = HTMLElement>(
  element: Element | null,
  selector: string
): T | null {
  if (!element) return null;
  const closest = element.closest(selector);
  return isHTMLElement(closest) ? (closest as T) : null;
}

export function querySelector<T extends HTMLElement = HTMLElement>(
  parent: ParentNode,
  selector: string
): T | null {
  const element = parent.querySelector(selector);
  return isHTMLElement(element) ? (element as T) : null;
}

export function querySelectorAll<T extends HTMLElement = HTMLElement>(
  parent: ParentNode,
  selector: string
): T[] {
  const elements = Array.from(parent.querySelectorAll(selector));
  return elements.filter(isHTMLElement) as T[];
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}
