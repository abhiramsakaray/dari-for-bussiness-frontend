# WordPress Blog Integration Setup

This guide explains how to integrate your WordPress blog with the Dari application.

## Overview

The blog page can fetch posts from a WordPress site using the WordPress REST API. If WordPress is not configured, it will display fallback posts.

## Prerequisites

- A WordPress site with REST API enabled (enabled by default in WordPress 4.7+)
- WordPress site must be accessible via HTTPS
- CORS properly configured on your WordPress site

## Setup Steps

### 1. Configure Environment Variable

Add your WordPress site URL to your `.env` file:

```env
VITE_WORDPRESS_URL=https://your-wordpress-site.com
```

Replace `https://your-wordpress-site.com` with your actual WordPress site URL.

### 2. Enable CORS on WordPress (if needed)

If your WordPress site is on a different domain, you'll need to enable CORS. Add this to your WordPress theme's `functions.php` or create a custom plugin:

```php
<?php
// Enable CORS for WordPress REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
}, 15);
```

### 3. Verify WordPress REST API

Test that your WordPress REST API is accessible:

```bash
curl https://your-wordpress-site.com/wp-json/wp/v2/posts
```

You should receive a JSON response with your posts.

### 4. Restart Development Server

After updating the `.env` file, restart your development server:

```bash
npm run dev
```

## Features

The WordPress integration includes:

- **Automatic post fetching** - Posts are fetched from WordPress REST API
- **Pagination** - Navigate through multiple pages of posts
- **Featured images** - Display post featured images if available
- **Author information** - Show post author names
- **Fallback mode** - Display static posts if WordPress is not configured
- **Error handling** - Graceful degradation if WordPress is unavailable

## API Endpoints Used

The integration uses these WordPress REST API endpoints:

- `GET /wp-json/wp/v2/posts` - Fetch posts
- `GET /wp-json/wp/v2/posts?slug={slug}` - Fetch single post by slug
- `GET /wp-json/wp/v2/categories` - Fetch categories

## Customization

### Adjust Posts Per Page

Edit `src/app/components/landing/BlogPage.tsx`:

```typescript
const { posts: fetchedPosts, totalPages: total } = await wordpressService.getPosts({
  page,
  perPage: 9, // Change this number
});
```

### Filter by Category

```typescript
const { posts } = await wordpressService.getPosts({
  categories: [1, 2, 3], // WordPress category IDs
});
```

### Search Posts

```typescript
const { posts } = await wordpressService.getPosts({
  search: 'payment infrastructure',
});
```

## Troubleshooting

### Posts not loading

1. Check that `VITE_WORDPRESS_URL` is set correctly in `.env`
2. Verify WordPress REST API is accessible
3. Check browser console for CORS errors
4. Ensure WordPress site is using HTTPS

### CORS errors

Add the CORS headers to your WordPress site (see step 2 above).

### Images not displaying

Ensure your WordPress featured images are set and publicly accessible.

## WordPress Plugins (Optional)

Consider these plugins to enhance the integration:

- **WP REST API Controller** - Fine-tune REST API access
- **Better REST API Featured Images** - Enhanced featured image support
- **JWT Authentication for WP REST API** - If you need authenticated requests

## Security Considerations

- The integration only uses public WordPress REST API endpoints
- No authentication is required for reading public posts
- Ensure your WordPress site is kept up to date
- Use HTTPS for your WordPress site

## Next Steps

- Customize the blog post card design in `BlogPage.tsx`
- Add category filtering UI
- Implement search functionality
- Create a single post view page
- Add social sharing buttons
