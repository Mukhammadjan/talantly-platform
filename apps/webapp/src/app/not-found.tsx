import Link from "next/link";
import styles from "./not-found.module.css";

// Talantly'da mavjud bo'lmagan manzil — foydalanuvchini asosiy oqimlarga qaytaramiz.
export default function NotFound(): JSX.Element {
  return (
    <main className={styles.wrap}>
      <img
        src="/assets/brand/talantly-wordmark-dark.svg"
        alt="Talantly"
        className={styles.logo}
      />
      <p className={`${styles.code} num`}>404</p>
      <h1 className={styles.title}>Sahifa topilmadi</h1>
      <p className={styles.text}>
        Siz izlagan sahifa o&apos;chirilgan yoki manzil noto&apos;g&apos;ri
        kiritilgan bo&apos;lishi mumkin.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primary}>
          Bosh sahifa
        </Link>
        <Link href="/vakansiyalar" className={styles.ghost}>
          Vakansiyalar
        </Link>
      </div>
    </main>
  );
}
