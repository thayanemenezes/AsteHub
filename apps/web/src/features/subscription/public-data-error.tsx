import Link from "next/link";
import styles from "./public-site.module.css";

export function PublicDataError({ href }: { href: string }) {
  return (
    <main className={styles.page}>
      <div className={styles.error} role="alert">
        <p>Não foi possível carregar as informações agora.</p>
        <Link href={href}>Tentar novamente</Link>
      </div>
    </main>
  );
}
