import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { JobOffer, JobMetrics } from '../models/models';

@Component({
  selector: 'app-rh-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rh-layout">
      <!-- App Header -->
      <header class="app-header glass-panel">
        <div class="header-left">
          <div class="logo">W</div>
          <div>
            <h1>TalentSwipe Recruteur</h1>
            <p>Espace Recruteur · {{ companyName() }}</p>
          </div>
        </div>
        <div class="header-right">
          <span class="user-pill">💼 {{ recruiterName() }}</span>
          <button (click)="logout()" class="btn btn-secondary">
            Déconnexion <span class="icon">🚪</span>
          </button>
        </div>
      </header>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Sidebar: Job Offers List -->
        <aside class="sidebar glass-panel">
          <div class="sidebar-header">
            <h2>Nos Offres</h2>
            <button (click)="openPublishModal()" class="btn btn-primary btn-sm">
              + Publier
            </button>
          </div>

          <div class="job-list">
            <div 
              *ngFor="let j of jobs()" 
              [class.active]="selectedJobId() === j.id"
              (click)="selectJob(j.id)"
              class="job-item"
            >
              <span class="job-role">{{ j.role }}</span>
              <span class="job-loc">📍 {{ j.location || 'Tunisie' }}</span>
              <span class="job-views">👀 {{ j.views_count }} vues</span>
            </div>
            
            <div class="no-jobs" *ngIf="jobs().length === 0">
              Aucune offre publiée. Cliquez sur "+ Publier" pour démarrer.
            </div>
          </div>
        </aside>

        <!-- Main Workspace: Metrics & Candidate details -->
        <main class="main-workspace">
          <div *ngIf="!selectedJobId() && jobs().length > 0" class="select-job-hint glass-panel">
            <p>Sélectionnez une offre dans la barre latérale pour afficher les statistiques détaillées.</p>
          </div>

          <div *ngIf="jobs().length === 0" class="select-job-hint glass-panel">
            <p>Commencez par créer votre première offre d'emploi pour voir les statistiques de swipe et de match.</p>
          </div>

          <div *ngIf="selectedJobId() && selectedJobMetrics()" class="metrics-workspace">
            <!-- Stats Grid -->
            <div class="stats-grid">
              <div class="stat-card glass-panel text-teal">
                <span class="stat-label">👀 Vues</span>
                <span class="stat-value">{{ selectedJobMetrics()?.views }}</span>
              </div>
              <div class="stat-card glass-panel text-purple">
                <span class="stat-label">❤️ Swiped Right (Likes)</span>
                <span class="stat-value">{{ selectedJobMetrics()?.likes?.length }}</span>
              </div>
              <div class="stat-card glass-panel text-pink">
                <span class="stat-label">❌ Swiped Left (Passés)</span>
                <span class="stat-value">{{ selectedJobMetrics()?.passes?.length }}</span>
              </div>
              <div class="stat-card glass-panel text-orange">
                <span class="stat-label">🤝 Matches</span>
                <span class="stat-value">{{ selectedJobMetrics()?.matches?.length }}</span>
              </div>
            </div>

            <!-- Tabbed detailed lists -->
            <div class="details-tabs-panel glass-panel">
              <div class="tabs-header">
                <button 
                  [class.active]="activeTab() === 'matches'" 
                  (click)="activeTab.set('matches')" 
                  class="tab-btn"
                >
                  Matches ({{ selectedJobMetrics()?.matches?.length }})
                </button>
                <button 
                  [class.active]="activeTab() === 'likes'" 
                  (click)="activeTab.set('likes')" 
                  class="tab-btn"
                >
                  Likes ({{ selectedJobMetrics()?.likes?.length }})
                </button>
                <button 
                  [class.active]="activeTab() === 'passes'" 
                  (click)="activeTab.set('passes')" 
                  class="tab-btn"
                >
                  Passés ({{ selectedJobMetrics()?.passes?.length }})
                </button>
              </div>

              <!-- Content Lists -->
              <div class="tab-content">
                <!-- Matches List -->
                <div *ngIf="activeTab() === 'matches'">
                  <div class="empty-list" *ngIf="selectedJobMetrics()?.matches?.length === 0">
                    Aucun match pour l'instant. Swipez les candidats dans l'application !
                  </div>
                  <table class="premium-table" *ngIf="(selectedJobMetrics()?.matches?.length ?? 0) > 0">
                    <thead>
                      <tr>
                        <th>Candidat</th>
                        <th>Ville</th>
                        <th>Détails Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let m of selectedJobMetrics()?.matches">
                        <td>
                          <div class="user-profile">
                            <img [src]="m.candidate?.avatar_url || 'https://api.dicebear.com/7.x/bottts/png?seed=' + m.candidate?.name" class="user-avatar" />
                            <div class="user-info">
                              <span class="user-name">{{ m.candidate?.name }}</span>
                              <span class="user-title">{{ m.candidate?.title || 'Candidat' }}</span>
                            </div>
                          </div>
                        </td>
                        <td>{{ m.candidate?.location || 'Tunisie' }}</td>
                        <td>
                          <div class="match-meta">
                            <span class="match-date">Matché le {{ m.matched_at | date:'dd/MM/yyyy' }}</span>
                            <span class="matched-rh">Recruteur: {{ m.rh?.name }}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Likes List -->
                <div *ngIf="activeTab() === 'likes'">
                  <div class="empty-list" *ngIf="selectedJobMetrics()?.likes?.length === 0">
                    Aucun candidat n'a encore aimé cette offre.
                  </div>
                  <table class="premium-table" *ngIf="(selectedJobMetrics()?.likes?.length ?? 0) > 0">
                    <thead>
                      <tr>
                        <th>Candidat</th>
                        <th>Ville</th>
                        <th>Spécialité</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let c of selectedJobMetrics()?.likes">
                        <td>
                          <div class="user-profile">
                            <img [src]="c.avatar_url || 'https://api.dicebear.com/7.x/bottts/png?seed=' + c.name" class="user-avatar" />
                            <span class="user-name">{{ c.name }}</span>
                          </div>
                        </td>
                        <td>{{ c.location || 'Non spécifié' }}</td>
                        <td>{{ c.title || 'Candidat' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Passes List -->
                <div *ngIf="activeTab() === 'passes'">
                  <div class="empty-list" *ngIf="selectedJobMetrics()?.passes?.length === 0">
                    Aucun candidat n'a passé son tour sur cette offre.
                  </div>
                  <table class="premium-table" *ngIf="(selectedJobMetrics()?.passes?.length ?? 0) > 0">
                    <thead>
                      <tr>
                        <th>Candidat</th>
                        <th>Ville</th>
                        <th>Spécialité</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let c of selectedJobMetrics()?.passes">
                        <td>
                          <div class="user-profile">
                            <img [src]="c.avatar_url || 'https://api.dicebear.com/7.x/bottts/png?seed=' + c.name" class="user-avatar" />
                            <span class="user-name">{{ c.name }}</span>
                          </div>
                        </td>
                        <td>{{ c.location || 'Non spécifié' }}</td>
                        <td>{{ c.title || 'Candidat' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Publish Job Modal Dialog -->
      <div class="modal-backdrop" *ngIf="isPublishModalOpen()">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <h3>Publier une Offre d'Emploi</h3>
            <button (click)="closePublishModal()" class="close-btn">✕</button>
          </div>
          <form (ngSubmit)="publishJob()">
            <div class="form-group">
              <label class="form-label" for="role">Titre du poste</label>
              <input type="text" id="role" name="role" [(ngModel)]="newJob.role" class="form-input" placeholder="ex: Développeur Angular Senior" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="description">Description</label>
              <textarea id="description" name="description" [(ngModel)]="newJob.description" class="form-input text-area" placeholder="Détaillez le poste, requis et avantages..." required></textarea>
            </div>

            <div class="row">
              <div class="form-group col">
                <label class="form-label" for="location">Ville</label>
                <input type="text" id="location" name="location" [(ngModel)]="newJob.location" class="form-input" placeholder="ex: Tunis" />
              </div>
              <div class="form-group col">
                <label class="form-label" for="salary">Salaire (Optionnel)</label>
                <input type="text" id="salary" name="salary" [(ngModel)]="newJob.salary" class="form-input" placeholder="ex: 2500 DT" />
              </div>
            </div>

            <div class="form-group check-group">
              <input type="checkbox" id="is_remote" name="is_remote" [(ngModel)]="newJob.is_remote" />
              <label for="is_remote">Télétravail autorisé</label>
            </div>

            <div class="form-group">
              <label class="form-label" for="tags">Tags (séparés par virgules)</label>
              <input type="text" id="tags" name="tags" [(ngModel)]="newJob.tagsInput" class="form-input" placeholder="ex: Angular, TypeScript, Git" />
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closePublishModal()" class="btn btn-secondary">Annuler</button>
              <button type="submit" class="btn btn-primary">Publier l'offre</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rh-layout {
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
    
    .user-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: #fff;
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
    }
    
    .sidebar {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      height: fit-content;
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .sidebar-header h2 {
      font-size: 18px;
      font-weight: 800;
    }
    
    .job-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .job-item {
      display: flex;
      flex-direction: column;
      padding: 12px 16px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: var(--transition-fast);
    }
    
    .job-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.15);
    }
    
    .job-item.active {
      background: rgba(0, 242, 254, 0.08);
      border-color: var(--color-teal);
    }
    
    .job-role {
      font-weight: 700;
      color: #fff;
      font-size: 14.5px;
    }
    
    .job-loc {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    
    .job-views {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 6px;
      font-weight: 600;
    }
    
    .btn-sm {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
    }
    
    .main-workspace {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .select-job-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      color: var(--text-muted);
      font-size: 15px;
      text-align: center;
    }
    
    .metrics-workspace {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }
    
    .stat-card {
      display: flex;
      flex-direction: column;
      padding: 20px 24px;
      gap: 8px;
    }
    
    .stat-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 900;
    }
    
    .text-teal .stat-value { color: var(--color-teal); }
    .text-purple .stat-value { color: var(--color-purple); }
    .text-pink .stat-value { color: var(--color-pink); }
    .text-orange .stat-value { color: var(--color-orange); }
    
    .details-tabs-panel {
      padding: 24px;
    }
    
    .tabs-header {
      display: flex;
      gap: 12px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 20px;
    }
    
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 10px 16px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      font-family: var(--font-sans);
      border-bottom: 2px solid transparent;
      transition: var(--transition-fast);
    }
    
    .tab-btn.active {
      color: var(--color-teal);
      border-bottom-color: var(--color-teal);
    }
    
    .empty-list {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--text-muted);
      font-size: 14px;
    }
    
    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
    }
    
    .user-name {
      font-weight: 700;
      color: #fff;
      font-size: 14px;
    }
    
    .user-title {
      font-size: 11px;
      color: var(--text-muted);
    }
    
    .match-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .match-date {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 600;
    }
    
    .matched-rh {
      font-size: 11px;
      color: var(--color-teal);
      font-weight: 600;
    }
    
    /* Modal styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-card {
      width: 100%;
      max-width: 500px;
      padding: 32px;
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    
    .modal-header h3 {
      font-size: 18px;
      font-weight: 800;
    }
    
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      cursor: pointer;
    }
    
    .text-area {
      height: 100px;
      resize: vertical;
    }
    
    .row {
      display: flex;
      gap: 16px;
    }
    
    .col {
      flex: 1;
    }
    
    .check-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .check-group input {
      width: 16px;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
  `]
})
export class RhDashboardComponent implements OnInit {
  companyName = signal('');
  recruiterName = signal('');
  
  jobs = signal<JobOffer[]>([]);
  selectedJobId = signal<string | null>(null);
  selectedJobMetrics = signal<JobMetrics | null>(null);
  activeTab = signal<string>('matches');

  // Modal form bindings
  isPublishModalOpen = signal(false);
  newJob = {
    role: '',
    description: '',
    location: '',
    salary: '',
    is_remote: false,
    tagsInput: ''
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.companyName.set(user.company_name || '');
      this.recruiterName.set(user.name);
    }
    this.loadJobs();
  }

  loadJobs() {
    this.apiService.getRhJobs().subscribe({
      next: (res) => {
        this.jobs.set(res.jobs);
        if (res.jobs.length > 0 && !this.selectedJobId()) {
          this.selectJob(res.jobs[0].id);
        }
      },
      error: () => {
        this.logout();
      }
    });
  }

  selectJob(jobId: string) {
    this.selectedJobId.set(jobId);
    this.apiService.getJobMetrics(jobId).subscribe({
      next: (res) => {
        this.selectedJobMetrics.set(res);
      },
      error: (err) => {
        alert('Erreur chargement metrics: ' + err.message);
      }
    });
  }

  openPublishModal() {
    this.isPublishModalOpen.set(true);
  }

  closePublishModal() {
    this.isPublishModalOpen.set(false);
    this.newJob = {
      role: '',
      description: '',
      location: '',
      salary: '',
      is_remote: false,
      tagsInput: ''
    };
  }

  publishJob() {
    if (!this.newJob.role || !this.newJob.description) return;

    const tags = this.newJob.tagsInput
      ? this.newJob.tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    const jobPayload = {
      company: this.companyName(),
      role: this.newJob.role,
      description: this.newJob.description,
      location: this.newJob.location || null,
      salary: this.newJob.salary || null,
      is_remote: this.newJob.is_remote,
      tags: tags
    };

    this.apiService.createJob(jobPayload).subscribe({
      next: (res) => {
        this.closePublishModal();
        this.loadJobs();
        if (res.id) {
          this.selectJob(res.id);
        }
      },
      error: (err) => {
        alert('Erreur lors de la publication: ' + (err.error?.message || err.message));
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
