// Sample JavaScript file for testing
class ModernComponent {
  constructor(options = {}) {
    this.options = options;
    this.element = null;
  }

  async init() {
    // Using async/await
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      this.render(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  render(data) {
    // Using template literals
    const html = `
      <div class="component">
        <h2>${data.title}</h2>
        <p>${data.description}</p>
      </div>
    `;
    
    this.element = document.createElement('div');
    this.element.innerHTML = html;
    
    // Using arrow functions
    this.element.addEventListener('click', (event) => {
      this.handleClick(event);
    });
  }

  handleClick(event) {
    // Using destructuring
    const { target, type } = event;
    console.log(`Clicked ${type} on ${target.tagName}`);
  }

  // Using rest parameters
  processData(...args) {
    return args.map(arg => arg.toString().toUpperCase());
  }
}

// Using modules
export default ModernComponent;
export const VERSION = '1.0.0';
