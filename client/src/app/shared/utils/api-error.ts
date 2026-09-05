import { HttpErrorResponse } from '@angular/common/http';

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Unable to reach ResumeIQ right now. Check your connection and try again.';
    }
    if (error.status === 401) return 'Your session has expired. Please sign in again.';
    if (error.status === 413) return 'Resume files must be 5 MB or smaller.';
    if (error.status === 415) return 'Choose a PDF or DOCX resume.';
    if (error.status >= 500) return 'ResumeIQ could not complete your request. Please try again.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'We could not complete your request. Please try again.';
};
