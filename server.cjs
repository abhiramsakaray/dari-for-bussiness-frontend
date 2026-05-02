const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from Vite build with proper content types
app.use(express.static(path.join(__dirname, "dist"), {
  setHeaders: (res, filePath) => {
    // Set proper content type for XML files
    if (filePath.endsWith('.xml')) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    }
    // Set proper content type for text files
    else if (filePath.endsWith('.txt')) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
    // Default for HTML
    else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// SPA fallback (React/Vite routing)
// BUT exclude static files like sitemap.xml, robots.txt, etc.
app.get("*", (req, res) => {
  // Don't redirect if it's a static file request
  if (req.path.match(/\.(xml|txt|json|ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)) {
    return res.status(404).send('File not found');
  }
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Dari frontend running on port ${PORT}`);
});
