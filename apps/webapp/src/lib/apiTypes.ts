import type { Direction, TalentStatus } from "@talantly/shared";

export interface TalentSnapshot {
  status: TalentStatus;
  fullName: string | null;
  birthYear: number | null;
  city: string | null;
  direction: Direction | null;
  education: string | null;
  phone: string | null;
  freeText: string | null;
  portfolioUrl: string | null;
  /** Next wizard step to show (0 = welcome, 1..8 = question screens). */
  registerStep: number;
  verifiedAt: string | null;
  score: number | null;
  interviewAt: string | null;
  rejectedAt: string | null;
  cvAvailable: boolean;
  paymentEnabled: boolean;
}

export interface AuthResponse {
  token: string;
  snapshot: TalentSnapshot;
}

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
