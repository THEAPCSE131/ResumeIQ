import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ResumeService } from '../../shared/services/resume.service';

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
  selectedFile: File | null = null;
  uploadResult: any = null;

  isAnalyzing = false;
  showResult = false;

  groqData: any = null;

  startAnalysis() {
    if (!this.selectedFile) return;

    this.showResult = false;
    this.isAnalyzing = true;

    setTimeout(() => {
      this.isAnalyzing = false;

      this.groqData = {
        data: {
          atsScore: 92,

          summary:
            'Highly skilled Senior Software Developer with experience in scalable enterprise applications, Angular, Node.js and AI integrations.',

          matchedSkills: [
            'Angular',
            'Node.js',
            'TypeScript',
            'MongoDB',
            'REST APIs',
            'AI Integration',
          ],

          missingSkills: ['AWS', 'Docker', 'DevOps'],

          suggestions: [
            'Add cloud technologies like AWS to improve backend opportunities.',

            'Mention deployment and DevOps experience for better ATS ranking.',

            'Highlight measurable project impact and achievements.',
          ],
        },
      };

      this.showResult = true;
    }, 1000);
  }

  readonly user = this.authService.getCurrentUser();

  logout(): void {
    this.authService.logout();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadResume() {
    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }
    this.isAnalyzing = true;
    const token = localStorage.getItem('resumeai_token') || '';

    this.resumeService.uploadResume(this.selectedFile, token).subscribe({
      next: (res: any) => {
        console.log('Upload success:', res);
        this.uploadResult = res.data;
        console.log('Upload result:', this.uploadResult);
        this.isAnalyzing = false;
        this.showResult = true;
      },
      error: (err) => {
        this.isAnalyzing = false;
        this.showResult = false;
        console.error(err);
        this.selectedFile = null;
        alert('Upload failed');
      },
    });
  }
}
