import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('allows authenticated users', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => true } },
        { provide: Router, useValue: { createUrlTree: jasmine.createSpy() } },
      ],
    });

    expect(TestBed.runInInjectionContext(() => authGuard({} as never, {} as never))).toBeTrue();
  });

  it('redirects unauthenticated users to sign in', () => {
    const urlTree = {};
    const createUrlTree = jasmine.createSpy().and.returnValue(urlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => false } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    expect(TestBed.runInInjectionContext(() => authGuard({} as never, {} as never)) as unknown).toBe(urlTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});
