import Link from 'next/link';
import React from 'react';
import Logo from '../Logo/Logo';

const Footer: React.FC = () => {

  return (
    <footer className="footer">
      <Link href="/">
        <Logo className="logo" />
      </Link>
    </footer>
  );
};

export default Footer;
