/**
 * WordPress REST API Integration
 * 
 * Configure your WordPress site URL in .env:
 * VITE_WORDPRESS_URL=https://your-wordpress-site.com
 */

export interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: Array<{
      name: string;
      avatar_urls: Record<string, string>;
    }>;
  };
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  slug: string;
  link: string;
  featuredImage?: string;
  author?: string;
  categories: number[];
}

class WordPressService {
  private baseUrl: string;
  private apiUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_WORDPRESS_URL || '';
    this.apiUrl = `${this.baseUrl}/wp-json/wp/v2`;
  }

  /**
   * Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Format WordPress post to simplified BlogPost
   */
  private formatPost(post: WordPressPost): BlogPost {
    return {
      id: post.id,
      title: this.stripHtml(post.title.rendered),
      excerpt: this.stripHtml(post.excerpt.rendered),
      content: post.content.rendered,
      date: new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      slug: post.slug,
      link: post.link,
      featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
      author: post._embedded?.author?.[0]?.name,
      categories: post.categories,
    };
  }

  /**
   * Fetch posts from WordPress
   */
  async getPosts(params?: {
    page?: number;
    perPage?: number;
    categories?: number[];
    search?: string;
  }): Promise<{ posts: BlogPost[]; total: number; totalPages: number }> {
    if (!this.baseUrl) {
      throw new Error('WordPress URL not configured. Set VITE_WORDPRESS_URL in .env');
    }

    const queryParams = new URLSearchParams({
      _embed: 'true',
      per_page: String(params?.perPage || 10),
      page: String(params?.page || 1),
    });

    if (params?.categories?.length) {
      queryParams.append('categories', params.categories.join(','));
    }

    if (params?.search) {
      queryParams.append('search', params.search);
    }

    try {
      const response = await fetch(`${this.apiUrl}/posts?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.statusText}`);
      }

      const posts: WordPressPost[] = await response.json();
      const total = parseInt(response.headers.get('X-WP-Total') || '0');
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

      return {
        posts: posts.map((post) => this.formatPost(post)),
        total,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching WordPress posts:', error);
      throw error;
    }
  }

  /**
   * Fetch a single post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!this.baseUrl) {
      throw new Error('WordPress URL not configured. Set VITE_WORDPRESS_URL in .env');
    }

    try {
      const response = await fetch(`${this.apiUrl}/posts?slug=${slug}&_embed=true`);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.statusText}`);
      }

      const posts: WordPressPost[] = await response.json();
      
      if (posts.length === 0) {
        return null;
      }

      return this.formatPost(posts[0]);
    } catch (error) {
      console.error('Error fetching WordPress post:', error);
      throw error;
    }
  }

  /**
   * Fetch categories
   */
  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    if (!this.baseUrl) {
      throw new Error('WordPress URL not configured. Set VITE_WORDPRESS_URL in .env');
    }

    try {
      const response = await fetch(`${this.apiUrl}/categories?per_page=100`);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching WordPress categories:', error);
      throw error;
    }
  }
}

export const wordpressService = new WordPressService();
