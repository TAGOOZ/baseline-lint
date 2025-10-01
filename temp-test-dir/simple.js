// A simple JavaScript file with some modern features
const modernFeatures = {
  // IntersectionObserver - limited browser support
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => console.log(entry.isIntersecting));
    });
    return observer;
  },
  
  // Optional chaining and nullish coalescing
  getConfigValue(config) {
    return config?.settings?.timeout ?? 1000;
  },
  
  // String.prototype.replaceAll
  sanitizeHTML(html) {
    return html.replaceAll('<', '&lt;');
  },
  
  // Array.prototype.at
  getLastElement(array) {
    return array.at(-1);
  }
};

// Export simple module
export { modernFeatures };
