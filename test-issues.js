// Test file with compatibility issues for PR comment demo

// Critical: Array.at() - not supported in older browsers
const items = [1, 2, 3, 4, 5];
const lastItem = items.at(-1);
const secondItem = items.at(1);

// Warning: String.replaceAll() - limited support
const text = "hello world hello";
const replaced = text.replaceAll("hello", "hi");

// Critical: Object.hasOwn() - newer API
const obj = { key: 'value' };
const hasKey = Object.hasOwn(obj, 'key');

// Warning: Array.findLast() - limited support
const numbers = [1, 2, 3, 4, 5];
const lastEven = numbers.findLast(n => n % 2 === 0);

// Export for testing
export { lastItem, replaced, hasKey, lastEven };
