import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ResumeAnalysis, ResumeService } from '../../shared/services/resume.service';

interface DisplayAnalysis {
  atsScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly resumeService = inject(ResumeService);

  readonly acceptedFileTypes = '.pdf,.docx';
  readonly maxFileSizeBytes = 5 * 1024 * 1024;
  readonly user = this.authService.getCurrentUser();

  selectedFile: File | null = null;
  uploadResult: DisplayAnalysis | null = null;
  isAnalyzing = false;
  isDragActive = false;
  errorMessage = '';
  statusMessage = 'Choose a resume to begin your analysis.';

  get scoreLabel(): string {
    const score = this.uploadResult?.atsScore ?? 0;
    if (score >= 85) return 'Excellent resume quality';
    if (score >= 70) return 'Strong resume foundation';
    if (score >= 50) return 'Good start — room to improve';
    return 'Needs significant improvement';
  }

  get showResult(): boolean {
    return this.uploadResult !== null;
  }

  logout(): void {
    this.authService.logout();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectFile(input.files?.item(0) ?? null);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.isAnalyzing) this.isDragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;
    if (!this.isAnalyzing) this.selectFile(event.dataTransfer?.files.item(0) ?? null);
  }

  onUploadZoneKeydown(event: KeyboardEvent, fileInput: HTMLInputElement): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  }

  removeSelectedFile(event?: Event): void {
    event?.stopPropagation();
    if (this.isAnalyzing) return;
    this.selectedFile = null;
    this.errorMessage = '';
    this.statusMessage = 'Resume selection cleared.';
  }

  uploadResume(): void {
    if (!this.selectedFile || this.isAnalyzing) {
      if (!this.selectedFile) {
        this.errorMessage = 'Choose a PDF or DOCX resume before starting the analysis.';
      }
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'Your session has expired. Please sign in again.';
      this.statusMessage = this.errorMessage;
      return;
    }

    this.errorMessage = '';
    this.uploadResult = null;
    this.isAnalyzing = true;
    this.statusMessage = 'Resume uploaded. AI analysis is in progress.';

    this.resumeService.uploadResume(this.selectedFile, token).subscribe({
      next: (response) => {
        this.uploadResult = this.toDisplayAnalysis(response.data);
        this.isAnalyzing = false;
        this.statusMessage = 'Analysis complete. Your results are ready.';
      },
      error: (error: Error) => {
        this.isAnalyzing = false;
        this.errorMessage = error.message || 'We could not analyze this resume. Please try again.';
        this.statusMessage = 'Analysis failed. You can retry with the selected resume.';
      },
    });
  }

  analyzeAnotherResume(): void {
    this.uploadResult = null;
    this.selectedFile = null;
    this.errorMessage = '';
    this.statusMessage = 'Choose another resume to begin a new analysis.';
  }

  private selectFile(file: File | null): void {
    if (!file) return;

    const validationMessage = this.validateFile(file);
    if (validationMessage) {
      this.errorMessage = validationMessage;
      this.statusMessage = validationMessage;
      return;
    }

    this.selectedFile = file;
    this.uploadResult = null;
    this.errorMessage = '';
    this.statusMessage = `${file.name} is ready for analysis.`;
  }

  private validateFile(file: File): string | null {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['pdf', 'docx'].includes(extension)) {
      return 'Choose a PDF or DOCX resume.';
    }
    if (file.size > this.maxFileSizeBytes) {
      return 'Resume files must be 5 MB or smaller.';
    }
    return null;
  }

  private toDisplayAnalysis(analysis: ResumeAnalysis): DisplayAnalysis {
    const score = Number(analysis?.atsScore);
    return {
      atsScore: Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0,
      summary: analysis?.summary?.trim() || 'A summary was not returned for this resume.',
      matchedSkills: this.cleanList(analysis?.matchedSkills),
      missingSkills: this.cleanList(analysis?.missingSkills),
      suggestions: this.cleanList(analysis?.suggestions),
    };
  }

  private cleanList(values?: string[]): string[] {
    return Array.isArray(values)
      ? values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : [];
  }
}
