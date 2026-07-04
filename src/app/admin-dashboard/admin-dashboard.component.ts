import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { AdminUser } from '../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar / Header area -->
      <header class="app-header glass-panel">
        <div class="header-left">
          <div class="logo">W</div>
          <div>
            <h1>TalentSwipe Admin</h1>
            <p>Administration Platform</p>
          </div>
        </div>
        <div class="header-right">
          <span class="admin-badge">🛡️ Administrateur</span>
          <button (click)="logout()" class="btn btn-secondary">
            Déconnexion <span class="icon">🚪</span>
          </button>
        </div>
      </header>

      <main class="main-content">
        <!-- Search & Filters -->
        <div class="filter-bar glass-panel">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Rechercher par nom, email, entreprise..." 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
            />
          </div>

          <div class="filter-tabs">
            <button 
              [class.active]="selectedFilter() === 'all'" 
              (click)="setFilter('all')" 
              class="filter-tab"
            >
              Tous ({{ totalCount() }})
            </button>
            <button 
              [class.active]="selectedFilter() === 'candidat'" 
              (click)="setFilter('candidat')" 
              class="filter-tab"
            >
              Candidats ({{ candidateCount() }})
            </button>
            <button 
              [class.active]="selectedFilter() === 'rh'" 
              (click)="setFilter('rh')" 
              class="filter-tab"
            >
              Recruteurs RH ({{ rhCount() }})
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="table-container glass-panel">
          <div class="loading-state" *ngIf="isLoading()">
            <span class="spinner"></span>
            <p>Chargement des utilisateurs...</p>
          </div>

          <div class="empty-state" *ngIf="!isLoading() && filteredUsers().length === 0">
            <p>Aucun utilisateur trouvé</p>
          </div>

          <table class="premium-table" *ngIf="!isLoading() && filteredUsers().length > 0">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Mode</th>
                <th>Contact / Email</th>
                <th>Détails Pro</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of filteredUsers()">
                <!-- User profile avatar/name -->
                <td>
                  <div class="user-profile">
                    <img 
                      [src]="u.avatar_url || 'https://api.dicebear.com/7.x/bottts/png?seed=' + u.name" 
                      class="user-avatar" 
                      alt="Avatar"
                    />
                    <div class="user-info">
                      <span class="user-name">{{ u.name }}</span>
                      <span class="user-date">Créé le {{ u.created_at | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </div>
                </td>
                
                <!-- Role / Mode -->
                <td>
                  <span class="role-badge" [class.badge-candidat]="u.mode === 'candidat'" [class.badge-rh]="u.mode === 'rh'">
                    {{ u.mode === 'rh' ? '💼 Recruteur' : '👤 Candidat' }}
                  </span>
                </td>

                <!-- Contact -->
                <td>
                  <div class="contact-info">
                    <span class="email-text">{{ u.email }}</span>
                  </div>
                </td>

                <!-- Pro specs -->
                <td>
                  <div class="pro-details" *ngIf="u.mode === 'rh'">
                    <span class="company-name">🏢 {{ u.company_name }}</span>
                    <a *ngIf="u.linkedin_url" [href]="u.linkedin_url" target="_blank" class="linkedin-link">
                      🔗 LinkedIn Profil
                    </a>
                  </div>
                  <div class="pro-details" *ngIf="u.mode !== 'rh'">
                    <span class="candidate-loc">📍 Tunis, Tunisie</span>
                  </div>
                </td>

                <!-- Approval Status -->
                <td>
                  <span class="status-indicator" [class.status-active]="u.is_approved" [class.status-pending]="!u.is_approved">
                    {{ u.is_approved ? '✔️ Actif' : '⏳ En Attente' }}
                  </span>
                </td>

                <!-- Approval trigger action -->
                <td>
                  <button 
                    *ngIf="u.mode === 'rh' && !u.is_approved" 
                    (click)="approveRecruiter(u.id)" 
                    class="btn btn-primary btn-sm"
                  >
                    Approuver
                  </button>
                  <span *ngIf="u.mode === 'candidat' || u.is_approved" class="check-success">
                    Prêt
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 32px;
      margin-bottom: 32px;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--color-teal), var(--color-purple));
      border-radius: 12px;
      font-size: 24px;
      font-weight: 900;
      color: #fff;
    }
    
    h1 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 2px;
    }
    
    .app-header p {
      color: var(--text-muted);
      font-size: 13px;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .admin-badge {
      background: rgba(0, 242, 254, 0.1);
      border: 1px solid rgba(0, 242, 254, 0.2);
      color: var(--color-teal);
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
    }
    
    .main-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .search-box {
      position: relative;
      flex: 1;
      min-width: 280px;
    }
    
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    
    .search-input {
      width: 100%;
      padding: 10px 16px 10px 40px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      font-family: var(--font-sans);
    }
    
    .search-input:focus {
      outline: none;
      border-color: var(--color-teal);
    }
    
    .filter-tabs {
      display: flex;
      background: rgba(0, 0, 0, 0.2);
      padding: 4px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
    }
    
    .filter-tab {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 13px;
      font-family: var(--font-sans);
      transition: var(--transition-fast);
    }
    
    .filter-tab.active {
      background: var(--bg-surface-hover);
      color: #fff;
    }
    
    .table-container {
      overflow-x: auto;
      padding: 12px;
    }
    
    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1.5px solid var(--border-color);
      background: var(--bg-secondary);
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 700;
      color: #fff;
      font-size: 14.5px;
    }
    
    .user-date {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    
    .role-badge {
      display: inline-flex;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
    }
    
    .badge-candidat {
      background: rgba(0, 242, 254, 0.08);
      color: var(--color-teal);
      border: 1px solid rgba(0, 242, 254, 0.15);
    }
    
    .badge-rh {
      background: rgba(155, 81, 224, 0.08);
      color: #bb86fc;
      border: 1px solid rgba(155, 81, 224, 0.15);
    }
    
    .contact-info {
      display: flex;
      flex-direction: column;
    }
    
    .email-text {
      font-size: 14px;
      color: var(--text-secondary);
    }
    
    .pro-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .company-name {
      font-weight: 600;
      color: #fff;
      font-size: 13.5px;
    }
    
    .linkedin-link {
      color: var(--color-teal);
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
    }
    
    .linkedin-link:hover {
      text-decoration: underline;
    }
    
    .candidate-loc {
      color: var(--text-muted);
      font-size: 13px;
    }
    
    .status-indicator {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
    }
    
    .status-active {
      color: #27AE60;
      background: rgba(39, 174, 96, 0.1);
      border: 1px solid rgba(39, 174, 96, 0.2);
    }
    
    .status-pending {
      color: var(--color-orange);
      background: rgba(255, 126, 64, 0.1);
      border: 1px solid rgba(255, 126, 64, 0.2);
    }
    
    .check-success {
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 600;
    }
    
    .btn-sm {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
    }
    
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      gap: 16px;
      color: var(--text-muted);
    }
    
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid transparent;
      border-top-color: var(--color-teal);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  filteredUsers = signal<AdminUser[]>([]);
  
  isLoading = signal(true);
  selectedFilter = signal<string>('all');
  searchQuery = '';

  // Counters
  totalCount = signal(0);
  candidateCount = signal(0);
  rhCount = signal(0);

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.apiService.getAdminUsers().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.users.set(res.users);
        this.applyFilterAndSearch();
      },
      error: () => {
        this.isLoading.set(false);
        this.logout();
      }
    });
  }

  approveRecruiter(userId: string) {
    this.apiService.approveRecruiter(userId).subscribe({
      next: () => {
        this.users.update(list => list.map(u => u.id === userId ? { ...u, is_approved: true } : u));
        this.applyFilterAndSearch();
      },
      error: (err) => {
        alert('Erreur lors de la validation: ' + (err.error?.message || err.message));
      }
    });
  }

  onSearchChange() {
    this.applyFilterAndSearch();
  }

  setFilter(mode: string) {
    this.selectedFilter.set(mode);
    this.applyFilterAndSearch();
  }

  applyFilterAndSearch() {
    const allUsers = this.users();
    const query = this.searchQuery.toLowerCase().trim();
    const mode = this.selectedFilter();

    this.totalCount.set(allUsers.length);
    this.candidateCount.set(allUsers.filter(u => u.mode === 'candidat').length);
    this.rhCount.set(allUsers.filter(u => u.mode === 'rh').length);

    let filtered = allUsers;

    if (mode !== 'all') {
      filtered = filtered.filter(u => u.mode === mode);
    }

    if (query.length > 0) {
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.first_name && u.first_name.toLowerCase().includes(query)) ||
        (u.last_name && u.last_name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.company_name && u.company_name.toLowerCase().includes(query))
      );
    }

    this.filteredUsers.set(filtered);
  }

  logout() {
    this.authService.logout();
  }
}
