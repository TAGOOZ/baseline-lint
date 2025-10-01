// Demo: JavaScript compatibility issues for PR comment testing  

class ModernFeatures {
  constructor() {
    // 🔴 CRITICAL - Very new API, needs polyfill
    this.data = structuredClone({ user: 'test', items: [1, 2, 3] });
  }

  // 🟡 WARNING - Newly available array methods
  processArray(items) {
    // Array.prototype.at() - newly available since 2022
    const lastItem = items.at(-1);
    
    // Array.prototype.findLast() - newly available
    const found = items.findLast(item => item > 5);
    
    return { lastItem, found };
  }

  // 🔴 CRITICAL - String methods with limited support
  cleanText(text) {
    // String.prototype.replaceAll - needs polyfill for older browsers
    return text.replaceAll('bad', 'good');
  }

  // 🟡 WARNING - Modern Promise methods
  async handlePromises(promises) {
    // Promise.allSettled - newly available
    const results = await Promise.allSettled(promises);
    
    return results.filter(r => r.status === 'fulfilled');
  }

  // 🔴 CRITICAL - Object methods with limited support
  checkProperty(obj, prop) {
    // Object.hasOwn - newer alternative to hasOwnProperty
    return Object.hasOwn(obj, prop);
  }

  // ✅ GOOD - Widely supported for comparison
  async fetchData(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Fetch failed:', error);
      return null;
    }
  }
}
