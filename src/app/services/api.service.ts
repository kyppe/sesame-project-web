import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { LoginResponse, User, AdminUser, JobOffer, JobMetrics } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private headers(): HttpHeaders {
    const token = this.auth.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ── Auth ──────────────────────────────────────────────────────────

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  refreshToken(refreshToken: string): Observable<{ access_token: string; refresh_token: string }> {
    return this.http.post<{ access_token: string; refresh_token: string }>(
      `${this.baseUrl}/auth/refresh`,
      { refresh_token: refreshToken }
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────

  getAdminUsers(search?: string, mode?: string): Observable<{ users: AdminUser[] }> {
    const params: any = {};
    if (search) params.search = search;
    if (mode && mode !== 'all') params.mode = mode;
    return this.http.get<{ users: AdminUser[] }>(`${this.baseUrl}/admin/users`, {
      headers: this.headers(),
      params,
    });
  }

  approveRecruiter(userId: string): Observable<{ success: boolean; user: any }> {
    return this.http.patch<{ success: boolean; user: any }>(
      `${this.baseUrl}/admin/users/${userId}/approve`,
      {},
      { headers: this.headers() }
    );
  }

  banUser(userId: string, isBanned: boolean): Observable<{ success: boolean; user: any }> {
    return this.http.patch<{ success: boolean; user: any }>(
      `${this.baseUrl}/admin/users/${userId}/ban`,
      { is_banned: isBanned },
      { headers: this.headers() }
    );
  }

  getAdminJobs(): Observable<{ jobs: any[] }> {
    return this.http.get<{ jobs: any[] }>(`${this.baseUrl}/admin/jobs`, {
      headers: this.headers(),
    });
  }

  deleteAdminJob(jobId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/admin/jobs/${jobId}`, {
      headers: this.headers(),
    });
  }

  // ── RH ────────────────────────────────────────────────────────────

  getRhJobs(): Observable<{ jobs: JobOffer[] }> {
    return this.http.get<{ jobs: JobOffer[] }>(`${this.baseUrl}/rh/jobs`, {
      headers: this.headers(),
    });
  }

  getJobMetrics(jobId: string): Observable<JobMetrics> {
    return this.http.get<JobMetrics>(`${this.baseUrl}/rh/jobs/${jobId}/metrics`, {
      headers: this.headers(),
    });
  }

  createJob(payload: any): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.baseUrl}/jobs`, payload, {
      headers: this.headers(),
    });
  }

  updateJob(jobId: string, payload: any): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.baseUrl}/jobs/${jobId}`, payload, {
      headers: this.headers(),
    });
  }

  deleteJob(jobId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/jobs/${jobId}`, {
      headers: this.headers(),
    });
  }
}
