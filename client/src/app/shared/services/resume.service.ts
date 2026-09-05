import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { getApiErrorMessage } from '../utils/api-error';

export interface ResumeAnalysis {
  atsScore?: number;
  summary?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  suggestions?: string[];
}

export interface ResumeUploadResponse {
  success: boolean;
  message: string;
  originalname: string;
  data: ResumeAnalysis;
}

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  private readonly apiUrl = `${environment.apiBaseUrl}`;
  constructor(private http: HttpClient) {}

  uploadResume(file: File, token: string): Observable<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('resume', file);
    return this.http
      .post<ResumeUploadResponse>(`${this.apiUrl}/resume/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        catchError((error: unknown) =>
          throwError(() => new Error(getApiErrorMessage(error))),
        ),
      );
  }
}
