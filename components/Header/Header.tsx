"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import Logo from '../Logo/Logo';

const Header: React.FC = () => {
  const pathname = usePathname()
  const isActive = (page: string) => page === pathname;

  return (
    <header className="header">
      <Link href="/running" className={isActive('/running') ? 'active' : ''}>
        Running
      </Link>
      <Link href="/cycling" className={isActive('/cycling') ? 'active' : ''}>
        Cycling
      </Link>
      <Link href="/training" className={isActive('/training') ? 'active' : ''}>
        Training
      </Link>
    </header>
  );
};

export default Header;