import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
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
