import { GenericPage } from './GenericPage';

interface SimplePageProps {
  label: string;
  title: string;
  subtitle: string;
  content: string;
  path?: string;
}

export function SimplePage({ label, title, subtitle, content, path }: SimplePageProps) {
  return (
    <GenericPage label={label} title={title} subtitle={subtitle} path={path}>
      <div className="prose prose-sm max-w-none">
        <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
      </div>
    </GenericPage>
  );
}
