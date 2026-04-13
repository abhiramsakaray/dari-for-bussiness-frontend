import { LandingLayout } from './LandingLayout';
import { PageHeader } from './PageHeader';
import { ReactNode } from 'react';

interface GenericPageProps {
  label: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function GenericPage({ label, title, subtitle, children }: GenericPageProps) {
  return (
    <LandingLayout>
      <PageHeader label={label} title={title} subtitle={subtitle} />
      <section className="py-20 bg-white">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
