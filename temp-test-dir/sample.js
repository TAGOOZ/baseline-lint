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

  // Sample JavaScript file with modern features that might trigger baseline-lint warnings

// Non-baseline features
const modernFeatures = {
  // IntersectionObserver - limited browser support
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => console.log(entry.isIntersecting));
    });
    return observer;
  },
  
  // ResizeObserver - limited browser support
  setupResizeObserver() {
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => console.log(entry.contentRect));
    });
    return observer;
  },
  
  // AbortController - limited browser support
  fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const signal = controller.signal;
    
    setTimeout(() => controller.abort(), timeout);
    return fetch(url, { signal });
  },
  
  // Promise.allSettled - modern promise method
  async fetchMultipleApis() {
    const results = await Promise.allSettled([
      fetch('/api/data1'),
      fetch('/api/data2')
    ]);
    return results;
  },
  
  // Optional chaining and nullish coalescing
  getConfigValue(config) {
    return config?.settings?.timeout ?? 1000;
  },
  
  // String.prototype.replaceAll
  sanitizeHTML(html) {
    return html.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  },
  
  // Array.prototype.at
  getLastElement(array) {
    return array.at(-1);
  },
  
  // Object.hasOwn
  checkProperty(obj, prop) {
    return Object.hasOwn(obj, prop);
  },
  
  // BigInt
  calculateLargeNumber() {
    return 9007199254740991n + 1n;
  },
  
  // Numeric separators
  getBigNumber() {
    return 1_000_000_000;
  },
  
  // structuredClone
  deepCopyObject(obj) {
    return structuredClone(obj);
  }
};

// Class with modern features
class ModernComponent {
  // Private field - modern feature
  #state = { initialized: false };
  
  constructor(config = {}) {
    this.config = config;
    
    // WeakRef and FinalizationRegistry
    this.elementRef = new WeakRef(document.createElement('div'));
    
    this.registry = new FinalizationRegistry(name => {
      console.log(`${name} has been garbage collected`);
    });
  }
  
  // Class field with arrow function
  initialize = () => {
    const element = this.elementRef.deref();
    if (element) {
      this.#state.initialized = true;
    }
  };
}

// Export modern module features
const VERSION = '1.0.0';

export { ModernComponent, modernFeatures, VERSION };

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
    let result = result || [];
    
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

// Modern dynamic import (but not using top-level await)
import('./dynamicImport.js').catch(err => console.error('Dynamic import failed'));

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
