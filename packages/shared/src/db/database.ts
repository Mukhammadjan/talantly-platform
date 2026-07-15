import type {
  CompanyInsert,
  CompanyRow,
  CvProfileInsert,
  CvProfileRow,
  InterviewInsert,
  InterviewRow,
  InterviewSlotInsert,
  InterviewSlotRow,
  PaymentInsert,
  PaymentRow,
  PersonalityQuestionInsert,
  PersonalityQuestionRow,
  PlacementInsert,
  PlacementRow,
  RequestInsert,
  RequestRow,
  SettingInsert,
  SettingRow,
  SkillTestInsert,
  SkillTestRow,
  StatusLogInsert,
  StatusLogRow,
  TalentInsert,
  TalentRow,
  TestQuestionInsert,
  TestQuestionRow,
  UserInsert,
  UserRow,
} from "../types.js";

type TableDef<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: TableDef<UserRow, UserInsert>;
      talents: TableDef<TalentRow, TalentInsert>;
      payments: TableDef<PaymentRow, PaymentInsert>;
      cv_profiles: TableDef<CvProfileRow, CvProfileInsert>;
      skill_tests: TableDef<SkillTestRow, SkillTestInsert>;
      test_questions: TableDef<TestQuestionRow, TestQuestionInsert>;
      interview_slots: TableDef<InterviewSlotRow, InterviewSlotInsert>;
      interviews: TableDef<InterviewRow, InterviewInsert>;
      companies: TableDef<CompanyRow, CompanyInsert>;
      placements: TableDef<PlacementRow, PlacementInsert>;
      status_log: TableDef<StatusLogRow, StatusLogInsert>;
      requests: TableDef<RequestRow, RequestInsert>;
      settings: TableDef<SettingRow, SettingInsert>;
      personality_questions: TableDef<
        PersonalityQuestionRow,
        PersonalityQuestionInsert
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
