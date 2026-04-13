import { GenericPage } from './GenericPage';

export function BlogPage() {
  const posts = [
    {
      title: 'Introducing Multi-chain Support',
      date: 'Jan 15, 2024',
      excerpt: 'Accept payments across Ethereum, Solana, Polygon, and more.',
    },
    {
      title: 'How to Integrate Dari in 5 Minutes',
      date: 'Jan 10, 2024',
      excerpt: 'A step-by-step guide to accepting your first stablecoin payment.',
    },
    {
      title: 'The Future of Payment Infrastructure',
      date: 'Jan 5, 2024',
      excerpt: 'Why stablecoins are the next evolution in global payments.',
    },
  ];

  return (
    <GenericPage
      label="Blog"
      title="Latest Updates"
      subtitle="News, guides, and insights from the Dari team."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
        {posts.map((post) => (
          <div
            key={post.title}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer"
          >
            <p className="text-xs font-mono text-gray-400 mb-3">{post.date}</p>
            <h3 className="text-lg font-semibold tracking-tight mb-2 text-black">
              {post.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        ))}
      </div>
    </GenericPage>
  );
}
