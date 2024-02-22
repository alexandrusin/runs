import Link from 'next/link';
import React from 'react';
import Logo from '../Logo/Logo';

const Footer: React.FC = () => {

  return (
    <footer className="footer">
      <Link href="/">
        <Logo className="logo" />
      </Link>
      built to learn
    </footer>
  );
};

export default Footer;
