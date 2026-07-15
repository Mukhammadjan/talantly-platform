import type {
  Archetype,
  CompanyKind,
  Direction,
  NeededLevel,
  PreferredMode,
  TalentLevel,
  TalentStatus,
  Urgency,
  WorkFormat,
} from "@talantly/shared";

export interface PersonalitySummary {
  archetypeCode: Archetype;
  archetypeLabel: string;
  tagline: string;
  traits: string[];
  consistent: boolean;
}

export interface TalentSnapshot {
  preferredMode: PreferredMode | null;
  status: TalentStatus;
  fullName: string | null;
  birthYear: number | null;
  city: string | null;
  direction: Direction | null;
  education: string | null;
  phone: string | null;
  freeText: string | null;
  portfolioUrl: string | null;
  /** Next wizard step to show (0 = welcome, 1..13 = question screens). */
  registerStep: number;
  verifiedAt: string | null;
  score: number | null;
  interviewAt: string | null;
  rejectedAt: string | null;
  cvAvailable: boolean;
  paymentEnabled: boolean;
  level: TalentLevel | null;
  experienceYears: number | null;
  workFormats: WorkFormat[];
  skillTags: string[];
  headline: string | null;
  personality: PersonalitySummary | null;
  salaryFrom: number | null;
  salaryCurrency: string;
}

export interface AuthResponse {
  token: string;
  snapshot: TalentSnapshot;
}

/** Fields a talent may edit on their own profile (Mini App). */
export interface ProfileEditPayload {
  fullName: string;
  city: string;
  direction: Direction;
  level: TalentLevel;
  experienceYears: number | null;
  skillTags: string[];
  workFormats: WorkFormat[];
  headline: string | null;
  freeText: string | null;
  portfolioUrl: string | null;
  salaryFrom: number | null;
  salaryCurrency: string;
}

export const SALARY_CURRENCIES = ["UZS", "USD"] as const;
export type SalaryCurrency = (typeof SALARY_CURRENCIES)[number];

export interface TestQuestionPublic {
  id: string;
  question: string;
  options: string[];
}

export interface TestStartResponse {
  available: boolean;
  questions: TestQuestionPublic[];
  answered: Record<string, number>;
}

export interface TestAnswerResponse {
  done: boolean;
  answeredCount: number;
  total: number;
  score: number | null;
}

export interface SlotPublic {
  id: string;
  startsAt: string;
}

export interface PersonalityQuestionPublic {
  id: string;
  question: string;
  options: string[];
}

export interface PersonalityStartResponse {
  done: boolean;
  result: PersonalitySummary | null;
  questions: PersonalityQuestionPublic[];
  answered: Record<string, number>;
}

export interface PersonalityAnswerResponse {
  done: boolean;
  answeredCount: number;
  total: number;
  result: PersonalitySummary | null;
}

export interface MatchPublic {
  id: string;
  activityType: string | null;
  city: string | null;
  neededLevel: NeededLevel | null;
  urgency: Urgency | null;
  directions: string[];
}

export interface MatchesResponse {
  matches: MatchPublic[];
  interestSent: boolean;
}

export interface CompanySnapshot {
  id: string;
  name: string;
  kind: CompanyKind | null;
  city: string | null;
  activityType: string | null;
  neededLevel: NeededLevel | null;
  urgency: Urgency | null;
}

/** Feed card — NO phone, NO full name, NO full CV (guest-safe payload). */
export interface TalentCardPublic {
  id: string;
  displayName: string;
  photoUrl: string | null;
  direction: Direction | null;
  level: TalentLevel | null;
  city: string | null;
  workFormats: WorkFormat[];
  skillTags: string[];
  headline: string | null;
  archetypeCode: Archetype | null;
  archetypeLabel: string | null;
  score: number | null;
  rating: number | null;
  verifiedAt: string | null;
  isDemo: boolean;
}

export interface FeedResponse {
  company: CompanySnapshot | null;
  talents: TalentCardPublic[];
}

export interface TalentDetailPublic extends TalentCardPublic {
  education: string | null;
  experienceYears: number | null;
  traits: string[];
  summary: string | null;
  aiVerdict: string | null;
  cvSkills: string[];
  requested: boolean;
}
