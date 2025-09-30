// Test JavaScript file with actual baseline compatibility issues

// WIDELY SUPPORTED FEATURES - Should pass
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2); // Array.map - widely supported
console.log('Doubled:', doubled);

// NEWLY AVAILABLE FEATURES - Should show warnings
const lastNumber = numbers.at(-1); // Array.at - newly available (baseline: low)
console.log('Last number:', lastNumber);

const firstNumber = numbers.at(0); // Array.at - newly available
console.log('First number:', firstNumber);

// Array methods - newly available
const hasEven = numbers.some(n => n % 2 === 0);
const allPositive = numbers.every(n => n > 0);

// Optional chaining - newly available (baseline: low)
const userData = {
  profile: {
    name: 'John',
    address: {
      city: 'New York'
    }
  }
};

const city = userData.profile?.address?.city; // Should show warning
const zip = userData.profile?.address?.zip; // Should show warning

// Nullish coalescing - newly available
const username = userData.profile?.name ?? 'Anonymous'; // Should show warning
const age = userData.profile?.age ?? 18; // Should show warning

// Modern JavaScript features with limited support
class ModernComponent {
  constructor(options = {}) {
    this.options = options;
    // Private fields - limited support
    this.#privateField = 'secret';
  }

  // Private methods - limited support
  #privateMethod() {
    return 'private';
  }

  async init() {
    // Async/await - widely supported
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      this.render(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  render(data) {
    // Template literals - widely supported
    const html = `
      <div class="component">
        <h2>${data.title}</h2>
        <p>${data.description}</p>
      </div>
    `;
    
    // Arrow functions - widely supported
    this.element.addEventListener('click', (event) => {
      this.handleClick(event);
    });
  }

  handleClick(event) {
    // Destructuring - widely supported
    const { target, type } = event;
    console.log(`Clicked ${type} on ${target.tagName}`);
  }
}

// LIMITED SUPPORT FEATURES - Should show errors
const user = { name: 'John', age: 30 };
const cloned = structuredClone(user); // structuredClone - limited support (baseline: false)
console.log('Cloned user:', cloned);

// BigInt - limited support (baseline: false)
const bigNumber = BigInt(9007199254740991); // Should show error
console.log('Big number:', bigNumber);

// Dynamic imports - limited support
// import('./module.js').then(module => {
//   console.log('Dynamic import loaded');
// });

export default ModernComponent;
