export type Uuid = string;
export type IsoTimestamp = string;
export type IsoDate = string;

export type UserRole = "talent" | "moderator" | "admin";

export type PreferredMode = "talant" | "izlovchi";

export interface UserRow {
  id: Uuid;
  tg_id: number | null;
  auth_uid: Uuid | null;
  phone: string | null;
  role: UserRole;
  created_at: IsoTimestamp;
  tg_username: string | null;
  preferred_mode: PreferredMode | null;
}

export interface UserInsert {
  id?: Uuid;
  tg_id?: number | null;
  auth_uid?: Uuid | null;
  phone?: string | null;
  role?: UserRole;
  created_at?: IsoTimestamp;
  tg_username?: string | null;
  preferred_mode?: PreferredMode | null;
}

export type Direction =
  | "dasturlash"
  | "dizayn"
  | "marketing"
  | "sotuv"
  | "data"
  | "boshqa";

export type TalentStatus =
  | "yangi"
  | "malumot_toldirilgan"
  | "tolov_kutilmoqda"
  | "tolov_tasdiqlangan"
  | "cv_tayyor"
  | "test_otgan"
  | "suhbat_belgilangan"
  | "tekshirilgan"
  | "rad_etilgan";

export type BotState = {
  step?: string;
  data?: Record<string, unknown>;
  updated_at?: IsoTimestamp;
};

export type TalentLevel = "intern" | "mutaxassis";

export type WorkFormat = "ofis" | "masofaviy" | "aralash";

export type Archetype =
  | "yaratuvchi"
  | "tahlilchi"
  | "yetakchi"
  | "aloqachi"
  | "ijrochi"
  | "kashfiyotchi";

export interface PersonalityResult {
  archetype?: Archetype;
  archetype_code?: Archetype;
  archetype_label?: string;
  tagline?: string;
  traits?: string[];
  strengths?: string[];
  weaknesses?: string[];
  scores?: Partial<Record<Archetype, number>>;
  consistent?: boolean;
  completed_at?: IsoTimestamp;
}

export interface TalentRow {
  id: Uuid;
  user_id: Uuid | null;
  full_name: string | null;
  birth_year: number | null;
  city: string | null;
  direction: Direction | null;
  education: string | null;
  free_text: string | null;
  portfolio_url: string | null;
  status: TalentStatus;
  bot_state: BotState;
  verified_at: IsoTimestamp | null;
  created_at: IsoTimestamp;
  photo_url: string | null;
  is_demo: boolean;
  level: TalentLevel | null;
  experience_years: number | null;
  work_formats: WorkFormat[] | null;
  skill_tags: string[] | null;
  headline: string | null;
  personality: PersonalityResult | null;
}

export interface TalentInsert {
  id?: Uuid;
  user_id?: Uuid | null;
  full_name?: string | null;
  birth_year?: number | null;
  city?: string | null;
  direction?: Direction | null;
  education?: string | null;
  free_text?: string | null;
  portfolio_url?: string | null;
  status?: TalentStatus;
  bot_state?: BotState;
  verified_at?: IsoTimestamp | null;
  created_at?: IsoTimestamp;
  photo_url?: string | null;
  is_demo?: boolean;
  level?: TalentLevel | null;
  experience_years?: number | null;
  work_formats?: WorkFormat[] | null;
  skill_tags?: string[] | null;
  headline?: string | null;
  personality?: PersonalityResult | null;
}

export type PaymentStatus = "kutilmoqda" | "tasdiqlangan" | "rad";

export interface PaymentRow {
  id: Uuid;
  talent_id: Uuid | null;
  amount: number;
  screenshot_path: string | null;
  status: PaymentStatus;
  confirmed_by: Uuid | null;
  confirmed_at: IsoTimestamp | null;
  created_at: IsoTimestamp;
}

export interface PaymentInsert {
  id?: Uuid;
  talent_id?: Uuid | null;
  amount?: number;
  screenshot_path?: string | null;
  status?: PaymentStatus;
  confirmed_by?: Uuid | null;
  confirmed_at?: IsoTimestamp | null;
  created_at?: IsoTimestamp;
}

export interface CvExperienceItem {
  title: string;
  org: string;
  period: string;
  bullets: string[];
}

export interface CvProfileRow {
  id: Uuid;
  talent_id: Uuid | null;
  summary: string | null;
  skills: string[] | null;
  experience: CvExperienceItem[] | null;
  ai_verdict: string | null;
  pdf_path: string | null;
  generated_at: IsoTimestamp | null;
}

export interface CvProfileInsert {
  id?: Uuid;
  talent_id?: Uuid | null;
  summary?: string | null;
  skills?: string[] | null;
  experience?: CvExperienceItem[] | null;
  ai_verdict?: string | null;
  pdf_path?: string | null;
  generated_at?: IsoTimestamp | null;
}

export interface SkillTestRow {
  id: Uuid;
  talent_id: Uuid | null;
  direction: Direction | null;
  score: number | null;
  answers: Record<string, unknown> | null;
  passed_at: IsoTimestamp | null;
}

export interface SkillTestInsert {
  id?: Uuid;
  talent_id?: Uuid | null;
  direction?: Direction | null;
  score?: number | null;
  answers?: Record<string, unknown> | null;
  passed_at?: IsoTimestamp | null;
}

export interface TestQuestionRow {
  id: Uuid;
  direction: Direction;
  question: string;
  options: string[];
  correct_index: number;
  is_active: boolean;
}

export interface TestQuestionInsert {
  id?: Uuid;
  direction: Direction;
  question: string;
  options: string[];
  correct_index: number;
  is_active?: boolean;
}

export interface InterviewSlotRow {
  id: Uuid;
  starts_at: IsoTimestamp;
  is_taken: boolean;
  created_by: Uuid | null;
}

export interface InterviewSlotInsert {
  id?: Uuid;
  starts_at: IsoTimestamp;
  is_taken?: boolean;
  created_by?: Uuid | null;
}

export type InterviewDecision = "approved" | "rejected";

export interface InterviewRow {
  id: Uuid;
  talent_id: Uuid | null;
  moderator_id: Uuid | null;
  scheduled_at: IsoTimestamp | null;
  rating: number | null;
  notes: string | null;
  decision: InterviewDecision | null;
  decided_at: IsoTimestamp | null;
  created_at: IsoTimestamp;
}

export interface InterviewInsert {
  id?: Uuid;
  talent_id?: Uuid | null;
  moderator_id?: Uuid | null;
  scheduled_at?: IsoTimestamp | null;
  rating?: number | null;
  notes?: string | null;
  decision?: InterviewDecision | null;
  decided_at?: IsoTimestamp | null;
  created_at?: IsoTimestamp;
}

export type CompanyStatus =
  | "yangi"
  | "boglanildi"
  | "nomzod_yuborildi"
  | "joylashuv"
  | "tolov_olindi";

export type CompanyKind = "kompaniya" | "tashkilot" | "startup" | "shaxsiy";

export type NeededLevel = "intern" | "mutaxassis" | "ikkalasi";

export type Urgency = "hoziroq" | "oy_ichida" | "korib_turibman";

export interface CompanyRow {
  id: Uuid;
  name: string;
  contact_name: string | null;
  phone_tg: string | null;
  direction_needed: string | null;
  status: CompanyStatus;
  notes: string | null;
  created_at: IsoTimestamp;
  logo_url: string | null;
  is_demo: boolean;
  description: string | null;
  user_id: Uuid | null;
  kind: CompanyKind | null;
  city: string | null;
  activity_type: string | null;
  directions_needed: string[] | null;
  needed_level: NeededLevel | null;
  urgency: Urgency | null;
}

export interface CompanyInsert {
  id?: Uuid;
  name: string;
  contact_name?: string | null;
  phone_tg?: string | null;
  direction_needed?: string | null;
  status?: CompanyStatus;
  notes?: string | null;
  created_at?: IsoTimestamp;
  logo_url?: string | null;
  is_demo?: boolean;
  description?: string | null;
  user_id?: Uuid | null;
  kind?: CompanyKind | null;
  city?: string | null;
  activity_type?: string | null;
  directions_needed?: string[] | null;
  needed_level?: NeededLevel | null;
  urgency?: Urgency | null;
}

export type RequestKind = "kompaniya_sorovi" | "talant_qiziqishi";

export type RequestStatus = "yangi" | "korildi" | "boglanildi" | "yopildi";

export interface RequestRow {
  id: Uuid;
  kind: RequestKind;
  company_id: Uuid | null;
  talent_id: Uuid | null;
  direction: string | null;
  note: string | null;
  status: RequestStatus;
  created_at: IsoTimestamp;
}

export interface RequestInsert {
  id?: Uuid;
  kind: RequestKind;
  company_id?: Uuid | null;
  talent_id?: Uuid | null;
  direction?: string | null;
  note?: string | null;
  status?: RequestStatus;
  created_at?: IsoTimestamp;
}

export interface PersonalityOption {
  label: string;
  weights: Partial<Record<Archetype, number>>;
}

export interface PersonalityQuestionRow {
  id: Uuid;
  question: string;
  options: PersonalityOption[];
  is_active: boolean;
  ord: number | null;
}

export interface PersonalityQuestionInsert {
  id?: Uuid;
  question: string;
  options: PersonalityOption[];
  is_active?: boolean;
  ord?: number | null;
}

export type PlacementFeeStatus = "pending" | "paid";

export interface PlacementRow {
  id: Uuid;
  company_id: Uuid | null;
  talent_id: Uuid | null;
  placed_at: IsoDate | null;
  trial_ends_at: IsoDate | null;
  fee_amount: number | null;
  fee_status: PlacementFeeStatus;
}

export interface PlacementInsert {
  id?: Uuid;
  company_id?: Uuid | null;
  talent_id?: Uuid | null;
  placed_at?: IsoDate | null;
  trial_ends_at?: IsoDate | null;
  fee_amount?: number | null;
  fee_status?: PlacementFeeStatus;
}

export type StatusLogEntity =
  | "talent"
  | "payment"
  | "interview"
  | "company"
  | "placement"
  | "request";

export interface StatusLogRow {
  id: Uuid;
  entity: StatusLogEntity | string;
  entity_id: Uuid;
  old_status: string | null;
  new_status: string | null;
  changed_by: string | null;
  created_at: IsoTimestamp;
}

export interface StatusLogInsert {
  id?: Uuid;
  entity: StatusLogEntity | string;
  entity_id: Uuid;
  old_status?: string | null;
  new_status?: string | null;
  changed_by?: string | null;
  created_at?: IsoTimestamp;
}

/** Key/value config table — both columns are TEXT (parse numbers/bools). */
export interface SettingRow {
  key: string;
  value: string;
}

export interface SettingInsert {
  key: string;
  value: string;
}
