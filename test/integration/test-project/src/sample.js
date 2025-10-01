// Sample JavaScript file for testing
class ModernComponent {
  #privateField = 'This is a private field'; // Private class fields (not fully supported)
  static staticField = 'Static field'; // Static class fields

  constructor(options = {}) {
    this.options = options;
    this.element = null;
    // Adding a non-baseline feature
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => console.log(entry));
    });
    
    // Using ResizeObserver (limited browser support)
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        console.log(entry.contentRect);
      }
    });

  async init() {
    // Using async/await
    try {
      // AbortController for fetch (not supported in some browsers)
      const controller = new AbortController();
      const signal = controller.signal;
      
      // Using Promise.allSettled (not supported in older browsers)
      const [response] = await Promise.allSettled([
        fetch('/api/data', { signal }),
        fetch('/api/metadata', { signal })
      ]);
      
      // Using optional chaining and nullish coalescing
      const data = (await response?.value?.json()) ?? { title: 'Default', description: 'Failed to load' };
      
      // Using structuredClone for deep copying (limited support)
      const dataCopy = structuredClone(data);
      
      this.render(dataCopy);
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
    
    // Using CSS properties with a CSSStyleSheet (limited browser support)
    if ('adoptedStyleSheets' in document) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(`
        .component { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          container-type: inline-size; /* Container queries - modern feature */
        }
        @container (min-width: 400px) {
          .component { padding: 2rem; }
        }
      `);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }
    
    // Using arrow functions
    this.element.addEventListener('click', (event) => {
      this.handleClick(event);
    });
    
    // Using replaceAll string method (not in older browsers)
    const sanitizedTitle = data.title.replaceAll('<', '&lt;');
    
    // Using at() array method (very new)
    const lastChild = this.element.querySelectorAll('*').at(-1);
    if (lastChild) {
      lastChild.textContent = sanitizedTitle;
    }
  }

  handleClick(event) {
    // Using destructuring
    const { target, type } = event;
    console.log(`Clicked ${type} on ${target.tagName}`);
    
    // Using Object.hasOwn (very new, not in older browsers)
    if (Object.hasOwn(this.options, 'onClick')) {
      this.options.onClick(event);
    }
    
    // Using Array.findLast (very new feature)
    const elements = Array.from(document.querySelectorAll('*'));
    const lastDiv = elements.findLast(el => el.tagName === 'DIV');
    console.log('Last div found:', lastDiv);
  }

  // Using rest parameters
  processData(...args) {
    // Using logical assignment operators (new feature)
    let result ||= [];
    
    // Using numeric separators
    const bigNumber = 1_000_000;
    
    // Using BigInt (not supported in older browsers)
    const hugeNumber = 9007199254740991n;
    
    // Using array methods with arrow functions
    return args.map(arg => arg.toString().toUpperCase())
               .flatMap(str => [...str])
               .toSorted(); // Very new array method
  }
  
  // Using class fields with functions
  cleanup = () => {
    // WeakRef - very modern feature
    const weakRef = new WeakRef(this.element);
    
    // Using FinalizationRegistry - very modern feature
    const registry = new FinalizationRegistry(name => {
      console.log(`${name} has been garbage collected`);
    });
    
    registry.register(this.element, "Component Element");
    
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }
}

// Using Top-level await (very modern feature)
await import('./dynamicImport.js').catch(err => console.error('Dynamic import failed'));

// Using Temporal API (very modern, still in proposal)
try {
  const now = Temporal.Now.instant();
  console.log(`Current time: ${now}`);
} catch (e) {
  console.log('Temporal API not supported');
}

// Using modules
export default ModernComponent;
export const VERSION = '1.0.0';
export const FEATURES = Object.freeze({
  supportsPrivateFields: true,
  supportsTopLevelAwait: true
});
