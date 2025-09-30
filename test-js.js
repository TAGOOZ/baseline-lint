// Test JavaScript file for GitHub Actions - Updated to trigger baseline check

// Widely supported features
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2); // Array.map - widely supported
console.log('Doubled:', doubled);

// Newly available features
const lastNumber = numbers.at(-1); // Array.at - newly available
console.log('Last number:', lastNumber);

// Limited support features
const user = { name: 'John', age: 30 };
const cloned = structuredClone(user); // structuredClone - limited support
console.log('Cloned user:', cloned);

// Modern JavaScript features
class ModernComponent {
  constructor(options = {}) {
    this.options = options;
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

export default ModernComponent;
