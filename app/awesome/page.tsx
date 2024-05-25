import Logo from "@/components/Logo/Logo";
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.awesome}>
      <Logo />
      Hello, World!
    </main>
  );
}
