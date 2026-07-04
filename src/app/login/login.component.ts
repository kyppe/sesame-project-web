import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card glass-panel">
        <div class="logo-area">
          <div class="logo">W</div>
          <h1>TalentSwipe Dashboard</h1>
          <p>Swipe. Match. Réussis.</p>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="email">Adresse Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="recruteur@entreprise.com" 
              [(ngModel)]="email" 
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input" 
              placeholder="••••••••" 
              [(ngModel)]="password" 
              required
            />
          </div>

          <div class="error-banner" *ngIf="errorMessage()">
            <span class="error-icon">⚠️</span>
            <p>{{ errorMessage() }}</p>
          </div>

          <div class="success-banner" *ngIf="pendingMessage()">
            <span class="pending-icon">⏳</span>
            <p>{{ pendingMessage() }}</p>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading()">
            <span *ngIf="isLoading()" class="spinner"></span>
            {{ isLoading() ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    
    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 40px;
    }
    
    .logo-area {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--color-teal), #0D2040);
      border-radius: 16px;
      font-size: 32px;
      font-weight: 900;
      color: #fff;
      margin-bottom: 16px;
      box-shadow: 0 4px 15px rgba(var(--color-teal-rgb), 0.3);
    }
    
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    
    p {
      color: var(--text-muted);
      font-size: 14px;
    }
    
    .btn-block {
      width: 100%;
      margin-top: 10px;
    }
    
    .error-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(255, 73, 219, 0.1);
      border: 1px solid rgba(255, 73, 219, 0.2);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 20px;
    }
    
    .error-banner p {
      color: var(--color-pink);
      font-size: 13.5px;
      font-weight: 600;
    }
    
    .success-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(255, 126, 64, 0.1);
      border: 1px solid rgba(255, 126, 64, 0.2);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 20px;
    }
    
    .success-banner p {
      color: var(--color-orange);
      font-size: 13.5px;
      font-weight: 600;
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  pendingMessage = signal<string | null>(null);

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
  ) {}

  onLogin() {
    this.errorMessage.set(null);
    this.pendingMessage.set(null);
    
    if (!this.email || !this.password) return;

    this.isLoading.set(true);
    
    this.apiService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const user = res.user;
        
        // Save session via AuthService
        this.authService.saveSession(res);

        // Route based on role field (not hardcoded email)
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
          return;
        }

        if (user.mode !== 'rh') {
          this.errorMessage.set('Ce tableau de bord est réservé aux recruteurs. Veuillez utiliser l\'application mobile.');
          this.authService.logout();
          return;
        }

        if (!user.is_approved) {
          this.pendingMessage.set('Votre inscription a été reçue ! En attente de validation par un administrateur.');
          this.authService.logout();
          return;
        }

        this.router.navigate(['/rh']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Identifiants incorrects ou erreur de serveur.';
        this.errorMessage.set(msg);
      }
    });
  }
}
