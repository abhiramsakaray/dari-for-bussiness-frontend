import { ReactNode } from 'react';
import { LandingNav } from './LandingNav';
import { LandingFooter } from './LandingFooter';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}
