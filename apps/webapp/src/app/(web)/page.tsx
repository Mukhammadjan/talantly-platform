import { SiteJsonLd } from "@/components/web/SiteJsonLd";
import { HomeClient } from "./HomeClient";

// Sahifaning o'zi klient (Telegram aniqlash, qidiruv), shuning uchun
// strukturali ma'lumot shu server qobig'ida beriladi.
export default function HomePage(): JSX.Element {
  return (
    <>
      <SiteJsonLd />
      <HomeClient />
    </>
  );
}
