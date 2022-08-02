import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header>
      <Link href="/">
        <img
          className={styles.headerLogo}
          src="/images/spacetraveling.svg"
          alt="logo"
        />
      </Link>
    </header>
  );
}
