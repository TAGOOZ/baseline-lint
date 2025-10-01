// Test PR JavaScript file with various baseline compatibility issues

// Widely available APIs - should pass
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

// Newly available APIs - should warn
const useModernFeatures = () => {
  // Optional chaining - newly available
  const user = data?.user?.profile;
  
  // Nullish coalescing - newly available
  const name = user?.name ?? 'Anonymous';
  
  // Array.flat() - newly available
  const flattened = nestedArray.flat(2);
  
  return { user, name, flattened };
};

// Limited availability APIs - should error
const useLimitedFeatures = () => {
  // String.prototype.replaceAll - limited availability
  const cleaned = text.replaceAll('old', 'new');
  
  // Promise.allSettled - limited availability
  const results = Promise.allSettled(promises);
  
  // BigInt - limited availability
  const bigNumber = BigInt(12345678901234567890);
  
  return { cleaned, results, bigNumber };
};

// DOM APIs - should warn (unknown baseline status)
const manipulateDOM = () => {
  const element = document.querySelector('.container');
  if (element) {
    element.classList.add('active');
    element.style.display = 'block';
  }
};

// Modern JavaScript features
class ModernComponent {
  #privateField = 'secret';
  
  constructor(options = {}) {
    this.options = { ...options };
  }
  
  async #privateMethod() {
    return await fetchData();
  }
  
  async render() {
    const data = await this.#privateMethod();
    return `<div>${data}</div>`;
  }
}

export { fetchData, useModernFeatures, useLimitedFeatures, manipulateDOM, ModernComponent };
