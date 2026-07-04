/** User returned by login / admin endpoints */
export interface User {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  mode: 'candidat' | 'rh';
  role: 'candidat' | 'rh' | 'admin';
  linkedin_url: string | null;
  company_name: string | null;
  is_approved: boolean;
  is_banned?: boolean;
  ai_score: number;
  talentswipe_credits: number;
  has_video_pitch: boolean;
  video_pitch_url: string | null;
  title: string | null;
  location: string | null;
  skills: string[];
  avatar_url: string | null;
  card_bg_hex: string;
  created_at?: string;
}

/** Login API response */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

/** Job offer as returned by /rh/jobs */
export interface JobOffer {
  id: string;
  company: string;
  role: string;
  description: string;
  salary: string | null;
  location: string | null;
  is_remote: boolean;
  company_logo: string;
  card_bg_hex: string;
  tags: string[];
  views_count: number;
  is_active: boolean;
  created_at?: string;
}

/** Candidate summary in job metrics */
export interface CandidateSummary {
  id: string;
  name: string;
  avatar_url: string | null;
  location: string | null;
  title: string | null;
}

/** Match details in job metrics */
export interface MatchDetail {
  match_id: string;
  matched_at: string;
  candidate: CandidateSummary | null;
  rh: { id: string; name: string } | null;
}

/** Job metrics response from /rh/jobs/:id/metrics */
export interface JobMetrics {
  views: number;
  likes: CandidateSummary[];
  passes: CandidateSummary[];
  matches: MatchDetail[];
}

/** Admin user list item */
export interface AdminUser {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  mode: 'candidat' | 'rh';
  role: string;
  linkedin_url: string | null;
  company_name: string | null;
  is_approved: boolean;
  is_banned: boolean;
  avatar_url: string | null;
  created_at: string;
}
