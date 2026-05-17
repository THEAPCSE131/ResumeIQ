import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../..//environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  private readonly apiUrl = `${environment.apiBaseUrl}`;
  constructor(private http: HttpClient) {}

  uploadResume(file: File, token: string) {
    const formData = new FormData();
    formData.append('resume', file);
    return this.http.post(`${this.apiUrl}/resume/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
