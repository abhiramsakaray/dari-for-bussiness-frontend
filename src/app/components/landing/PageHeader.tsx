import { Link } from 'react-router-dom';

interface PageHeaderProps {
  label: string;
  title: string;
  subtitle: string;
  path?: string;
}

export function PageHeader({ label, title, subtitle, path }: PageHeaderProps) {
  return (
    <div className="pt-32 pb-16 border-b border-gray-200 bg-white">
      <div className="max-w-[1160px] mx-auto px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <li>
              <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            {label && label !== title && (
              <>
                <li><span>{label}</span></li>
                <li aria-hidden="true">/</li>
              </>
            )}
            <li>
              <span className="text-gray-600" aria-current="page">{title}</span>
            </li>
          </ol>
        </nav>
        <p className="font-mono text-xs text-gray-500 tracking-widest uppercase mb-4">{label}</p>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4 text-black">{title}</h1>
        <p className="text-base text-gray-500 max-w-lg leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}
