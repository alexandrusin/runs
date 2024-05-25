"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import styles from './Header.module.css';

const Header: React.FC = () => {
  const pathname = usePathname();
  const isActive = (page: string) => page === pathname;
  const [isOpen, setIsOpen] = useState(false);

  // A function to close the dropdown and potentially handle other logic on link click
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Helper function to return the readable name for the active route
  const getActiveRouteName = () => {
    switch (pathname) {
      case '/running': return 'Running';
      case '/cycling': return 'Cycling';
      case '/training': return 'Training';
      case '/growingabeard': return 'Growing A Beard';
      case '/fishkeeping': return 'Fishkeeping';
      default: return 'Menu';
    }
  };

  return (
    <header className={styles.header}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.menuButton}>
        {getActiveRouteName()} ▼
      </button>
      <div className={`${styles.dropdown} ${isOpen ? styles.show : ''}`}>
        <Link href="/running" onClick={handleLinkClick} className={isActive('/running') ? styles.active : ''}>
          Running
        </Link>
        <Link href="/cycling" onClick={handleLinkClick} className={isActive('/cycling') ? styles.active : ''}>
          Cycling
        </Link>
        <Link href="/training" onClick={handleLinkClick} className={isActive('/training') ? styles.active : ''}>
          Training
        </Link>
        <Link href="/growingabeard" onClick={handleLinkClick} className={isActive('/growingabeard') ? styles.active : ''}>
          Growing A Beard
        </Link>
        <Link href="/fishkeeping" onClick={handleLinkClick} className={isActive('/fishkeeping') ? styles.active : ''}>
          Fishkeeping
        </Link>
      </div>
    </header>
  );
};

export default Header;
