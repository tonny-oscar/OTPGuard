/**
 * sanitize.js — Frontend XSS prevention helpers
 * Used wherever user-supplied content is rendered.
 */

// Characters that must be escaped in HTML context
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

/**
 * Escape a string for safe HTML rendering.
 * Use this instead of dangerouslySetInnerHTML.
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '')
  return str.replace(/[&<>"'/]/g, c => HTML_ESCAPE_MAP[c])
}

/**
 * Strip all HTML tags from a string (plain text only).
 */
export function stripTags(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').trim()
}

/**
 * Validate an email address format.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

/**
 * Validate a phone number (E.164 or local format).
 */
export function isValidPhone(phone) {
  return /^[\d\+\-\s]{7,20}$/.test(String(phone || '').trim())
}

/**
 * Sanitize a plain text input — strip tags, trim, limit length.
 */
export function sanitizeInput(value, maxLen = 255) {
  return stripTags(String(value ?? '')).slice(0, maxLen)
}
