import { HttpErrorResponse } from '@angular/common/http';

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Unable to reach ResumeIQ right now. Check your connection and try again.';
    }

    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'We could not analyze this resume. Please try again.';
};
