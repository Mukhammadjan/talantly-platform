import { PUBLIC_TABLE_NAMES, type PublicTableName } from "@talantly/shared";
import { getSupabase } from "../db/client.js";

type CheckResult = {
  table: PublicTableName;
  ok: boolean;
  count: number | null;
  error?: string;
};

async function checkTable(name: PublicTableName): Promise<CheckResult> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from(name)
    .select("*", { count: "exact" })
    .limit(0);
  if (error) {
    return { table: name, ok: false, count: null, error: error.message };
  }
  return { table: name, ok: true, count: count ?? 0 };
}

async function main(): Promise<void> {
  console.log(
    `Verifying ${PUBLIC_TABLE_NAMES.length} public tables via service client...`,
  );
  const results = await Promise.all(PUBLIC_TABLE_NAMES.map(checkTable));

  const width = Math.max(...results.map((r) => r.table.length));
  for (const r of results) {
    const badge = r.ok ? "OK  " : "FAIL";
    const detail = r.ok
      ? `rows=${r.count}`
      : `error=${r.error ?? "unknown"}`;
    console.log(`  ${badge}  ${r.table.padEnd(width)}  ${detail}`);
  }

  const failed = results.filter((r) => !r.ok);
  const okCount = results.length - failed.length;
  console.log(
    `\nResult: ${okCount}/${results.length} tables reachable from code.`,
  );
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Fatal:", message);
  process.exit(1);
});
