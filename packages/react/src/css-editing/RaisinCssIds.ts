export const RAISIN_CSS_ATTR = 'data-raisin-css';
export const RAISIN_ID_ATTR = 'data-raisin-id';
export const RAISIN_DOCUMENT_CSS_ATTR = 'data-raisin-document-css';

export function generateId(): string {
  return 'r' + Math.random().toString(36).slice(2, 10);
}