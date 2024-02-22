"use client"
import { ReactNode } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const pagename = pathname?.replace(/^\//, '') ? pathname?.replace(/^\//, '') : 'home';

  
  return (
    <div className={`${pagename}-page`}>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;