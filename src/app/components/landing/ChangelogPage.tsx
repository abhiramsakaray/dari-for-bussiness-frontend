import { GenericPage } from './GenericPage';

export function ChangelogPage() {
  const updates = [
    {
      version: 'v2.1.0',
      date: 'January 15, 2024',
      changes: [
        'Added support for Arbitrum and Base networks',
        'Improved webhook delivery reliability',
        'New analytics dashboard with MRR/ARR tracking',
      ],
    },
    {
      version: 'v2.0.0',
      date: 'January 1, 2024',
      changes: [
        'Multi-chain routing with automatic fee optimization',
        'Subscription billing with smart retry logic',
        'Enhanced fraud detection system',
        'New React SDK with drop-in components',
      ],
    },
    {
      version: 'v1.5.0',
      date: 'December 15, 2023',
      changes: [
        'Added Solana network support',
        'Payment links with QR codes',
        'Improved API response times',
      ],
    },
  ];

  return (
    <GenericPage
      label="Changelog"
      title="Product Updates"
      subtitle="Latest features, improvements, and bug fixes."
    >
      <div className="space-y-8">
        {updates.map((update) => (
          <div key={update.version} className="border-l-2 border-gray-200 pl-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-sm font-semibold text-black">
                {update.version}
              </span>
              <span className="text-xs text-gray-400 font-mono">{update.date}</span>
            </div>
            <ul className="space-y-2">
              {update.changes.map((change, idx) => (
                <li key={idx} className="text-sm text-gray-600 leading-relaxed flex gap-2">
                  <span className="text-green-500 flex-shrink-0">✓</span>
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Subscribe to our{' '}
            <a href="https://blog.daripay.xyz" target="_blank" rel="noopener noreferrer" className="text-black underline hover:no-underline">
              blog
            </a>{' '}
            for detailed release notes and product updates.
          </p>
        </div>
      </div>
    </GenericPage>
  );
}
