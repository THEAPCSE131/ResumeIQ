import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ResumeService } from '../../shared/services/resume.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let resumeService: jasmine.SpyObj<ResumeService>;

  beforeEach(async () => {
    resumeService = jasmine.createSpyObj<ResumeService>('ResumeService', ['uploadResume']);
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({ id: 'user-1', name: 'Taylor', email: 'taylor@example.com' }),
            getToken: () => 'test-token',
            logout: () => undefined,
          },
        },
        { provide: ResumeService, useValue: resumeService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('shows client-side validation for an unsupported upload', () => {
    const file = new File(['text'], 'resume.txt', { type: 'text/plain' });
    component.onFileSelected({ target: { files: { item: () => file }, value: '' } } as unknown as Event);

    expect(component.selectedFile).toBeNull();
    expect(component.errorMessage).toBe('Choose a PDF or DOCX resume.');
  });

  it('renders normalized analysis results from the API', () => {
    resumeService.uploadResume.and.returnValue(of({
      success: true,
      message: 'Complete',
      originalname: 'resume.pdf',
      data: { atsScore: 88, summary: 'Clear and targeted.', matchedSkills: ['Angular'], missingSkills: [], suggestions: [] },
    }));
    component.selectedFile = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    component.uploadResume();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('88%');
    expect(fixture.nativeElement.textContent).toContain('Excellent resume quality');
    expect(fixture.nativeElement.textContent).toContain('No missing skills were identified.');
  });

  it('keeps the selected file and displays a retryable API error', () => {
    resumeService.uploadResume.and.returnValue(throwError(() => new Error('Service temporarily unavailable.')));
    component.selectedFile = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    component.uploadResume();

    expect(component.isAnalyzing).toBeFalse();
    expect(component.selectedFile?.name).toBe('resume.pdf');
    expect(component.errorMessage).toBe('Service temporarily unavailable.');
  });
});
