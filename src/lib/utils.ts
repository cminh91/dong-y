import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the full base URL with protocol
 * Ensures the URL has http:// or https:// protocol
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
}

/**
 * Create a full URL with proper base URL
 */
export function createUrl(path: string, baseUrl?: string): URL {
  const fullBaseUrl = baseUrl || getBaseUrl();
  return new URL(path, fullBaseUrl);
}
