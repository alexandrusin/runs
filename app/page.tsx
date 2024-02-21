import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Hi! I am Alex and this is my playground.
        </p>
      </div>
      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/logo.svg"
          alt="AS Logo"
          width={400}
          height={400}
          priority
        />
      </div>
      <div className={styles.grid}>
        <Link href="/running" className={styles.card}>
          <h2>
            Running <span>-&gt;</span>
          </h2>
          <p>Numbers behind running adventures.</p>
        </Link>
        <Link href="/cycling" className={styles.card}>
          <h2>
            Cycling <span>-&gt;</span>
          </h2>
          <p>Data from hill attacks and city escapes.</p>
        </Link>
        <Link href="/active" className={styles.card}>
          <h2>
            Active <span>-&gt;</span>
          </h2>
          <p>Battle of the giants for time and energy.</p>
        </Link>
      </div>
    </main>
  );
}
