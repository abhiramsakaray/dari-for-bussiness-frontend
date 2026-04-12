import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  error_code?: string;
  required_permission?: string;
  user_permissions?: string[];
}

export const handleTeamApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ApiError>;

    switch (axiosError.response?.status) {
      case 401:
        return 'Authentication failed. Please log in again.';

      case 403: {
        const detail = axiosError.response.data;
        if (detail?.error_code === 'PERMISSION_DENIED') {
          return `Access denied. Required permission: ${detail.required_permission}`;
        }
        return 'You do not have permission to perform this action.';
      }

      case 423:
        return axiosError.response.data?.message || 'Account is locked. Please try again later.';

      case 400:
        return axiosError.response.data?.message || 'Invalid request.';

      case 404:
        return 'Resource not found.';

      case 409:
        return axiosError.response.data?.message || 'Conflict: Resource already exists.';

      case 422:
        return axiosError.response.data?.message || 'Validation error.';

      case 500:
        return 'Server error. Please try again later.';

      default:
        return axiosError.response?.data?.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

export const getPermissionErrorDetails = (error: unknown): {
  isPermissionError: boolean;
  requiredPermission?: string;
  userPermissions?: string[];
} => {
  if (error instanceof AxiosError) {
    const detail = error.response?.data as ApiError;
    if (detail?.error_code === 'PERMISSION_DENIED') {
      return {
        isPermissionError: true,
        requiredPermission: detail.required_permission,
        userPermissions: detail.user_permissions,
      };
    }
  }

  return { isPermissionError: false };
};
