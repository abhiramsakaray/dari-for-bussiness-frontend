import { LandingLayout } from './LandingLayout';
import { PageHeader } from './PageHeader';
import { ReactNode } from 'react';
import { SEO } from '../../../components/SEO';

interface GenericPageProps {
  label: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  path?: string;
}

export function GenericPage({ label, title, subtitle, children, path }: GenericPageProps) {
  // Construct clean page URL
  const slug = path || label.toLowerCase().replace(/\s+/g, '-');
  const url = `https://daripay.xyz/${slug}`;

  return (
    <>
      <SEO 
        title={title} 
        description={subtitle}
        url={url}
      />
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
    </>
  );
}
