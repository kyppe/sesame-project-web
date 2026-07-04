import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  /** Save tokens and user after login */
  saveSession(response: LoginResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  /** Get stored access token */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /** Get stored refresh token */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /** Get stored user */
  getUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Check if user is logged in */
  isLoggedIn(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  /** Check if user is admin */
  isAdmin(): boolean {
    const user = this.getUser();
    return !!user && (user.role === 'admin' || user.email === 'admin@talentswipe.com');
  }

  /** Check if user is RH and approved */
  isRhApproved(): boolean {
    const user = this.getUser();
    return !!user && user.mode === 'rh' && user.is_approved;
  }

  /** Clear session and navigate to login */
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /** Update stored tokens (e.g. after refresh) */
  updateTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
}
