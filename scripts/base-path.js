// Adjust base path for GitHub Pages
(function() {
  // Check if we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io') || 
                        window.location.hostname.includes('leinss-consulting.de');
  
  // If we're on GitHub Pages, we need to adjust script paths
  if (isGitHubPages) {
    // Add a global variable to indicate we're on GitHub Pages
    window.isGitHubPages = true;
    
    // Add a base element to the head to ensure all relative URLs resolve correctly
    const base = document.createElement('base');
    base.href = window.location.origin + '/';
    document.head.prepend(base);
  }
})();
