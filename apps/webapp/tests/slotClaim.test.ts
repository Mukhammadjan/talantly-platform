import { interviewSlotsRepo } from "@talantly/shared";
import type { TalantlyClient } from "@talantly/shared";
import { describe, expect, it } from "vitest";

interface SlotState {
  id: string;
  starts_at: string;
  is_taken: boolean;
  created_by: string | null;
}

/**
 * In-memory stand-in for the interview_slots table that mimics PostgREST's
 * conditional UPDATE semantics: `.eq("is_taken", false)` matches zero rows
 * once the slot is taken, exactly like the cloud DB under concurrency.
 */
function fakeClient(slot: SlotState): TalantlyClient {
  return {
    from(table: string) {
      if (table !== "interview_slots") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        update(values: { is_taken: boolean }) {
          const filters: Array<[string, unknown]> = [];
          const builder = {
            eq(column: string, value: unknown) {
              filters.push([column, value]);
              return builder;
            },
            select() {
              const matches = filters.every(
                ([column, value]) =>
                  slot[column as keyof SlotState] === value,
              );
              if (!matches) {
                return Promise.resolve({ data: [], error: null });
              }
              slot.is_taken = values.is_taken;
              return Promise.resolve({ data: [{ ...slot }], error: null });
            },
          };
          return builder;
        },
      };
    },
  } as unknown as TalantlyClient;
}

describe("interviewSlotsRepo.claim — double-booking race", () => {
  it("first claim wins, second claim on the same slot returns null", async () => {
    const slot: SlotState = {
      id: "slot-1",
      starts_at: "2026-07-15T10:00:00Z",
      is_taken: false,
      created_by: null,
    };
    const client = fakeClient(slot);

    const [first, second] = await Promise.all([
      interviewSlotsRepo.claim(client, "slot-1"),
      interviewSlotsRepo.claim(client, "slot-1"),
    ]);

    const winners = [first, second].filter((r) => r !== null);
    const losers = [first, second].filter((r) => r === null);
    expect(winners).toHaveLength(1);
    expect(losers).toHaveLength(1);
    expect(winners[0]?.is_taken).toBe(true);
    expect(slot.is_taken).toBe(true);
  });

  it("claim on an already-taken slot returns null", async () => {
    const slot: SlotState = {
      id: "slot-2",
      starts_at: "2026-07-15T11:00:00Z",
      is_taken: true,
      created_by: null,
    };
    const result = await interviewSlotsRepo.claim(fakeClient(slot), "slot-2");
    expect(result).toBeNull();
  });
});
