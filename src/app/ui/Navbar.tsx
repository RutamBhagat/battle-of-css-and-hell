import Link from "next/link";
import ClaudeAI from "./claude";
import styles from "./Navbar.module.css";

type NavLink = { href: string; label: string };

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/css_battle_1", label: "CSS Battle 1" },
  { href: "/css_battle_2", label: "CSS Battle 2" },
];

export default function Navbar() {
  return (
    <div className={styles.navPillWrap}>
      <nav className={styles.navPill} aria-label="Main">
        <ClaudeAI className={styles.navPillIconSvg} aria-hidden="true" />
        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} className={styles.navPillLink} href={href}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
