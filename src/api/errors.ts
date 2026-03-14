import axios, { AxiosError } from 'axios';

export class AppError extends Error {
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isTimeout?: boolean;

  constructor(message: string, options?: {
    status?: number;
    code?: string;
    isNetworkError?: boolean;
    isTimeout?: boolean;
  }) {
    super(message);
    this.name = 'AppError';
    this.status = options?.status;
    this.code = options?.code;
    this.isNetworkError = options?.isNetworkError;
    this.isTimeout = options?.isTimeout;
  }
}

type ErrorContext = {
  fallback?: string;
  action?: string;
};

export function normalizeApiError(error: unknown, context: ErrorContext = {}) {
  const fallback = context.fallback || 'Something went wrong. Please try again.';
  const action = context.action || 'complete this action';

  if (error instanceof AppError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string; code?: string }>;
    const status = axiosError.response?.status;
    const code = axiosError.code || axiosError.response?.data?.code;
    const serverMessage = axiosError.response?.data?.error || axiosError.response?.data?.message;
    const isTimeout = code === 'ECONNABORTED';
    const isNetworkError = !axiosError.response;

    let message = fallback;

    if (isTimeout) {
      message = 'The server is taking too long to respond. Please try again.';
    } else if (isNetworkError) {
      message = 'Unable to reach the server. Check your connection and try again.';
    } else if (status === 400) {
      message = serverMessage || fallback;
    } else if (status === 401) {
      message = serverMessage || 'Your email or password is incorrect.';
    } else if (status === 403) {
      message = serverMessage || 'You do not have permission to do that.';
    } else if (status === 404) {
      message = serverMessage || 'The requested resource could not be found.';
    } else if (status === 409) {
      message = serverMessage || 'That information is already in use.';
    } else if (status && status >= 500) {
      message = serverMessage || `The server could not ${action}. Please try again soon.`;
    } else if (serverMessage) {
      message = serverMessage;
    }

    return new AppError(message, { status, code, isNetworkError, isTimeout });
  }

  if (error instanceof Error) {
    return new AppError(error.message || fallback);
  }

  return new AppError(fallback);
}

export function getApiErrorMessage(error: unknown, context: ErrorContext = {}) {
  return normalizeApiError(error, context).message;
}
