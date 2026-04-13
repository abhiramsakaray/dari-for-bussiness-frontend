interface PageHeaderProps {
  label: string;
  title: string;
  subtitle: string;
}

export function PageHeader({ label, title, subtitle }: PageHeaderProps) {
  return (
    <div className="pt-32 pb-16 border-b border-gray-200 bg-white">
      <div className="max-w-[1160px] mx-auto px-6">
        <p className="font-mono text-xs text-gray-500 tracking-widest uppercase mb-4">
          {label}
        </p>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4 text-black">
          {title}
        </h1>
        <p className="text-base text-gray-500 max-w-lg leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
