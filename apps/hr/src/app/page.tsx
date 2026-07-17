import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export default async function IndexPage(): Promise<never> {
  const session = await getSession();
  redirect(session ? "/nomzodlar" : "/login");
}
