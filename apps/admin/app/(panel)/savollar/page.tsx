import Link from "next/link";
import type { Direction } from "@talantly/shared";
import { personalityQuestionsRepo, testQuestionsRepo } from "@talantly/shared";
import { DIRECTION_LABELS } from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";
import { PersonalityManager } from "./PersonalityManager";
import { TestManager } from "./TestManager";

export const dynamic = "force-dynamic";

export default async function SavollarPage({
  searchParams,
}: {
  searchParams: { bolim?: string };
}) {
  const tab = searchParams.bolim === "bilim" ? "bilim" : "arxetip";
  const client = getServiceClient();
  const [personalityQuestions, testQuestions] = await Promise.all([
    personalityQuestionsRepo.listAll(client),
    testQuestionsRepo.listAll(client),
  ]);

  const directions = Object.entries(DIRECTION_LABELS).map(
    ([value, label]) => ({ value: value as Direction, label }),
  );

  return (
    <div className="mx-auto max-w-[900px]">
      <h1 className="mb-6 text-[24px] font-bold text-ink">Savollar</h1>

      <div className="mb-6 flex gap-1.5">
        <Link
          href="/savollar"
          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
            tab === "arxetip"
              ? "bg-orange text-white"
              : "border border-line bg-surface text-ink-soft hover:border-orange hover:text-orange"
          }`}
        >
          Arxetip testi · {personalityQuestions.length}
        </Link>
        <Link
          href="/savollar?bolim=bilim"
          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
            tab === "bilim"
              ? "bg-orange text-white"
              : "border border-line bg-surface text-ink-soft hover:border-orange hover:text-orange"
          }`}
        >
          Bilim testi · {testQuestions.length}
        </Link>
      </div>

      {tab === "arxetip" ? (
        <PersonalityManager questions={personalityQuestions} />
      ) : (
        <TestManager questions={testQuestions} directions={directions} />
      )}
    </div>
  );
}
