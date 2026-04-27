import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return formatDate(dateString);
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for older browsers
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      resolve();
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Payment statuses
    completed: 'green',
    confirmed: 'green',
    paid: 'green',
    active: 'green',
    // Warning statuses
    pending: 'yellow',
    processing: 'yellow',
    trialing: 'yellow',
    past_due: 'orange',
    overdue: 'red',
    // Error statuses
    failed: 'red',
    cancelled: 'gray',
    expired: 'gray',
    paused: 'blue',
    // Default
    draft: 'gray',
    sent: 'blue',
    viewed: 'purple',
  };

  return statusColors[status.toLowerCase()] || 'gray';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ============================================================================
// LOCAL CURRENCY UTILITIES
// ============================================================================

export interface LocalCurrencyAmount {
  amount_usdc: number;
  amount_local: number;
  local_currency: string;
  local_symbol: string;
  exchange_rate: number;
  display_local: string;
}

/**
 * Display amount, preferring local currency if available
 * @param amountUsd - Amount in USD
 * @param localAmount - LocalCurrencyAmount object (null for USD merchants)
 * @returns Formatted amount string
 */
export function displayAmount(
  amountUsd: number,
  localAmount: LocalCurrencyAmount | null | undefined
): string {
  if (localAmount) {
    return localAmount.display_local;
  }
  return formatCurrency(amountUsd, 'USD');
}

/**
 * Display amount with both local and USDC (dual display)
 * @param amountUsdc - Amount in USDC
 * @param localAmount - LocalCurrencyAmount object (null for USD merchants)
 * @returns Object with primary and secondary display strings
 */
export function displayDualAmount(
  amountUsdc: number | string,
  localAmount: LocalCurrencyAmount | null | undefined
): { primary: string; secondary: string | null } {
  // Convert to number if string
  const usdc = typeof amountUsdc === 'string' ? parseFloat(amountUsdc) : amountUsdc;
  
  if (localAmount) {
    return {
      primary: localAmount.display_local,
      secondary: `$${usdc.toFixed(2)}`,
    };
  }
  return {
    primary: `$${usdc.toFixed(2)}`,
    secondary: null,
  };
}

/**
 * Get currency symbol from LocalCurrencyAmount or default to $
 */
export function getCurrencySymbol(
  localAmount: LocalCurrencyAmount | null | undefined
): string {
  return localAmount?.local_symbol || '$';
}

/**
 * Check if merchant has local currency (non-USD)
 */
export function hasLocalCurrency(
  localAmount: LocalCurrencyAmount | null | undefined
): boolean {
  return localAmount !== null && localAmount !== undefined;
}
/**
 * Safely extract a human-readable error message from an API error response.
 * Handles both string 'detail' and FastAPI/Pydantic validation error arrays.
 */
export function extractErrorMessage(error: any, fallback = 'An unexpected error occurred'): string {
  if (!error) return fallback;

  // Handle Axios/Fetch error response objects
  const data = error.response?.data;
  const detail = data?.detail || data?.message;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    // Detect backend route wrapper misconfiguration where FastAPI expects
    // query params "args" and "kwargs" instead of the intended request body.
    const isWrappedRouteSchemaBug = detail.every((e: any) => {
      const loc = e?.loc;
      return Array.isArray(loc)
        && loc[0] === 'query'
        && (loc[1] === 'args' || loc[1] === 'kwargs');
    });

    if (isWrappedRouteSchemaBug) {
      return 'Login endpoint is misconfigured on the backend (unexpected args/kwargs validation). Please fix backend auth route decorators or use a healthy API environment.';
    }

    // Handle Pydantic validation errors: [{type, loc, msg, input}, ...]
    return detail
      .map((e: any) => {
        if (typeof e === 'string') return e;
        if (e.msg) return e.msg;
        return JSON.stringify(e);
      })
      .join('; ');
  }

  return error.message || fallback;
}
