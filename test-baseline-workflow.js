// Test JavaScript file for GitHub Actions workflow

// This should trigger a baseline compatibility warning
const testArray = [1, 2, 3, 4, 5];
const lastItem = testArray.at(-1); // Newly available: Array.prototype.at

// This should trigger an error
const testObject = {
  // Limited availability feature
  [Symbol.dispose]: () => console.log('Disposing') // Limited availability
};

// This should pass - widely supported
const testFunction = () => {
  console.log('Hello World');
  return 'success';
};

// This should trigger a warning
const testAsync = async () => {
  const response = await fetch('/api/test'); // Newly available in some contexts
  return response.json();
};

// This should pass
const testPromise = new Promise((resolve) => {
  setTimeout(() => resolve('done'), 1000);
});

// This should trigger a warning
const testOptionalChaining = testObject?.property?.nested; // Newly available

// This should pass
const testDestructuring = ({ name, age }) => {
  return `${name} is ${age} years old`;
};

// This should trigger a warning
const testNullishCoalescing = testObject?.value ?? 'default'; // Newly available

export { testFunction, testPromise, testDestructuring };
