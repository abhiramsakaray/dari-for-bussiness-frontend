import { useState, useEffect } from 'react';
import { GenericPage } from './GenericPage';
import { wordpressService, BlogPost } from '../../../services/wordpress';

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fallback posts if WordPress is not configured
  const fallbackPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Introducing Multi-chain Support',
      date: 'Jan 15, 2024',
      excerpt: 'Accept payments across Ethereum, Solana, Polygon, and more.',
      content: '',
      slug: 'multi-chain-support',
      link: '#',
      categories: [],
    },
    {
      id: 2,
      title: 'How to Integrate Dari in 5 Minutes',
      date: 'Jan 10, 2024',
      excerpt: 'A step-by-step guide to accepting your first stablecoin payment.',
      content: '',
      slug: 'integrate-dari',
      link: '#',
      categories: [],
    },
    {
      id: 3,
      title: 'The Future of Payment Infrastructure',
      date: 'Jan 5, 2024',
      excerpt: 'Why stablecoins are the next evolution in global payments.',
      content: '',
      slug: 'future-of-payments',
      link: '#',
      categories: [],
    },
  ];

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { posts: fetchedPosts, totalPages: total } = await wordpressService.getPosts({
        page,
        perPage: 9,
      });
      setPosts(fetchedPosts);
      setTotalPages(total);
    } catch (err) {
      console.warn('WordPress not configured, using fallback posts');
      setPosts(fallbackPosts);
      setError(null); // Don't show error for missing config
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: BlogPost) => {
    // Open WordPress post in new tab if available, otherwise do nothing
    if (post.link && post.link !== '#') {
      window.open(post.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <GenericPage
      label="Blog"
      title="Latest Updates"
      subtitle="News, guides, and insights from the Dari team."
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 not-prose">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group"
              >
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-xs font-mono text-gray-400 mb-3">{post.date}</p>
                <h3 className="text-lg font-semibold tracking-tight mb-2 text-black group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                {post.author && (
                  <p className="text-xs text-gray-400 mt-3">By {post.author}</p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </GenericPage>
  );
}
