// Typed frontend interfeys. v2 file-1 da mock qaytaradi (tarmoq YO'Q).
// Backend 2-faylda shu imzolarni saqlab, real chaqiruvga almashtiriladi.

import { APPLICATIONS, CANDIDATES, TALENT, ZONES } from "@/mock/data";
import type {
  Application,
  Candidate,
  TalentSnapshot,
  Zone,
} from "@/lib/types";

function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const api = {
  getTalent(): Promise<TalentSnapshot> {
    return delay(TALENT);
  },
  getApplications(): Promise<Application[]> {
    return delay(APPLICATIONS);
  },
  getCandidates(): Promise<Candidate[]> {
    return delay(CANDIDATES);
  },
  getCandidate(id: string): Promise<Candidate | null> {
    return delay(CANDIDATES.find((c) => c.id === id) ?? null);
  },
  getZones(): Promise<Zone[]> {
    return delay(ZONES);
  },
};
