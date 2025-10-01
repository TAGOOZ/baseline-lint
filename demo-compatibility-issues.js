// Test file to demonstrate improved PR comments for JavaScript

// 🟡 Warning: Newly available features
const processArray = (data) => {
  // Array.prototype.at() - newly available since 2022-03
  const lastItem = data.at(-1);
  
  // Array.prototype.findLast() - newly available 
  const found = data.findLast(item => item.active);
  
  return { lastItem, found };
};

// 🔴 Critical: Limited support features
const modernStringOps = (text) => {
  // String.prototype.replaceAll - needs polyfill for older browsers
  const cleaned = text.replaceAll('old', 'new');
  
  return cleaned;
};

// 🟡 Warning: Modern Promise methods
const handleMultiplePromises = async (promises) => {
  // Promise.allSettled - newly available
  const results = await Promise.allSettled(promises);
  
  return results;
};

// 🔴 Critical: Very new APIs
const advancedFeatures = () => {
  // structuredClone - very new, needs polyfill
  const deepCopy = structuredClone(complexObject);
  
  // Object.hasOwn - newer alternative to hasOwnProperty
  if (Object.hasOwn(obj, 'property')) {
    return deepCopy;
  }
};

// ✅ Good: Widely supported
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};
