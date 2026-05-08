import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory with proper content types
app.use(express.static(join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    // Set proper content type for XML files (use text/xml for better compatibility)
    if (path.endsWith('.xml')) {
      res.setHeader('Content-Type', 'text/xml; charset=UTF-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    // Set proper content type for text files
    else if (path.endsWith('.txt')) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    // Default for HTML
    else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// Handle React Router - send all requests to index.html
// BUT exclude static files like sitemap.xml, robots.txt, etc.
app.get('*', (req, res) => {
  // Don't redirect if it's a static file request
  if (req.path.match(/\.(xml|txt|json|ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)) {
    return res.status(404).send('File not found');
  }
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

