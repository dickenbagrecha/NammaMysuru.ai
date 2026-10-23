/**
 * Frontend API client configuration and URL builder.
 * Resolves API endpoints against VITE_API_BASE_URL (or falls back to relative /api paths).
 */

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}
