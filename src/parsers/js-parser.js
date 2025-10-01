// src/parsers/js-parser.js
// Parse JavaScript files and check Baseline compatibility

import { parse } from '@babel/parser';
import traverseDefault from '@babel/traverse';
import { checkJavaScriptAPI, generateReport } from '../core/checker.js';
import { ParseError, FileError, handleError, safeAsync } from '../utils/error-handler.js';
import { readFileWithCleanup } from '../utils/file-handler.js';

// @babel/traverse exports a default object, need to get the actual function
const traverse = traverseDefault.default || traverseDefault;

/**
 * JavaScript APIs to check (comprehensive modern features)
 */
const JS_APIS = {
  // Array methods
  'Array.prototype.at': 'at',
  'Array.prototype.findLast': 'findLast',
  'Array.prototype.findLastIndex': 'findLastIndex',
  'Array.prototype.toReversed': 'toReversed',
  'Array.prototype.toSorted': 'toSorted',
  'Array.prototype.toSpliced': 'toSpliced',
  'Array.prototype.with': 'with',
  'Array.prototype.flatMap': 'flatMap',
  'Array.prototype.flat': 'flat',
  'Array.prototype.includes': 'includes',
  'Array.prototype.find': 'find',
  'Array.prototype.findIndex': 'findIndex',
  'Array.prototype.fill': 'fill',
  'Array.prototype.copyWithin': 'copyWithin',
  'Array.prototype.keys': 'keys',
  'Array.prototype.values': 'values',
  'Array.prototype.entries': 'entries',
  'Array.prototype.from': 'from',
  'Array.prototype.of': 'of',
  'Array.prototype.isArray': 'isArray',
  'Array.prototype.forEach': 'forEach',
  'Array.prototype.map': 'map',
  'Array.prototype.filter': 'filter',
  'Array.prototype.reduce': 'reduce',
  'Array.prototype.reduceRight': 'reduceRight',
  'Array.prototype.some': 'some',
  'Array.prototype.every': 'every',
  'Array.prototype.sort': 'sort',
  'Array.prototype.reverse': 'reverse',
  'Array.prototype.concat': 'concat',
  'Array.prototype.join': 'join',
  'Array.prototype.slice': 'slice',
  'Array.prototype.splice': 'splice',
  'Array.prototype.push': 'push',
  'Array.prototype.pop': 'pop',
  'Array.prototype.shift': 'shift',
  'Array.prototype.unshift': 'unshift',
  'Array.prototype.indexOf': 'indexOf',
  'Array.prototype.lastIndexOf': 'lastIndexOf',
  
  // Promise methods
  'Promise.try': 'try',
  'Promise.allSettled': 'allSettled',
  'Promise.any': 'any',
  'Promise.all': 'all',
  'Promise.race': 'race',
  'Promise.resolve': 'resolve',
  'Promise.reject': 'reject',
  
  // String methods
  'String.prototype.replaceAll': 'replaceAll',
  'String.prototype.at': 'at',
  'String.prototype.padStart': 'padStart',
  'String.prototype.padEnd': 'padEnd',
  'String.prototype.trimStart': 'trimStart',
  'String.prototype.trimEnd': 'trimEnd',
  'String.prototype.startsWith': 'startsWith',
  'String.prototype.endsWith': 'endsWith',
  'String.prototype.includes': 'includes',
  'String.prototype.repeat': 'repeat',
  'String.prototype.codePointAt': 'codePointAt',
  'String.prototype.normalize': 'normalize',
  'String.prototype.matchAll': 'matchAll',
  'String.prototype.replace': 'replace',
  'String.prototype.search': 'search',
  'String.prototype.split': 'split',
  'String.prototype.substring': 'substring',
  'String.prototype.substr': 'substr',
  'String.prototype.slice': 'slice',
  'String.prototype.indexOf': 'indexOf',
  'String.prototype.lastIndexOf': 'lastIndexOf',
  'String.prototype.charCodeAt': 'charCodeAt',
  'String.prototype.fromCharCode': 'fromCharCode',
  'String.prototype.fromCodePoint': 'fromCodePoint',
  'String.prototype.raw': 'raw',
  
  // Object methods
  'Object.hasOwn': 'hasOwn',
  'Object.groupBy': 'groupBy',
  'Object.fromEntries': 'fromEntries',
  'Object.assign': 'assign',
  'Object.create': 'create',
  'Object.defineProperty': 'defineProperty',
  'Object.defineProperties': 'defineProperties',
  'Object.freeze': 'freeze',
  'Object.seal': 'seal',
  'Object.preventExtensions': 'preventExtensions',
  'Object.isFrozen': 'isFrozen',
  'Object.isSealed': 'isSealed',
  'Object.isExtensible': 'isExtensible',
  'Object.keys': 'keys',
  'Object.values': 'values',
  'Object.entries': 'entries',
  'Object.getOwnPropertyNames': 'getOwnPropertyNames',
  'Object.getOwnPropertySymbols': 'getOwnPropertySymbols',
  'Object.getOwnPropertyDescriptor': 'getOwnPropertyDescriptor',
  'Object.getOwnPropertyDescriptors': 'getOwnPropertyDescriptors',
  'Object.getPrototypeOf': 'getPrototypeOf',
  'Object.setPrototypeOf': 'setPrototypeOf',
  'Object.is': 'is',
  
  // Number methods
  'Number.isFinite': 'isFinite',
  'Number.isInteger': 'isInteger',
  'Number.isNaN': 'isNaN',
  'Number.isSafeInteger': 'isSafeInteger',
  'Number.parseFloat': 'parseFloat',
  'Number.parseInt': 'parseInt',
  'Number.EPSILON': 'EPSILON',
  'Number.MAX_SAFE_INTEGER': 'MAX_SAFE_INTEGER',
  'Number.MIN_SAFE_INTEGER': 'MIN_SAFE_INTEGER',
  'Number.MAX_VALUE': 'MAX_VALUE',
  'Number.MIN_VALUE': 'MIN_VALUE',
  'Number.POSITIVE_INFINITY': 'POSITIVE_INFINITY',
  'Number.NEGATIVE_INFINITY': 'NEGATIVE_INFINITY',
  
  // Math methods
  'Math.trunc': 'trunc',
  'Math.sign': 'sign',
  'Math.cbrt': 'cbrt',
  'Math.log2': 'log2',
  'Math.log10': 'log10',
  'Math.fround': 'fround',
  'Math.imul': 'imul',
  'Math.clz32': 'clz32',
  'Math.hypot': 'hypot',
  'Math.acosh': 'acosh',
  'Math.asinh': 'asinh',
  'Math.atanh': 'atanh',
  'Math.sinh': 'sinh',
  'Math.cosh': 'cosh',
  'Math.tanh': 'tanh',
  
  // RegExp methods
  'RegExp.prototype.hasIndices': 'hasIndices',
  'RegExp.prototype.dotAll': 'dotAll',
  'RegExp.prototype.global': 'global',
  'RegExp.prototype.ignoreCase': 'ignoreCase',
  'RegExp.prototype.multiline': 'multiline',
  'RegExp.prototype.sticky': 'sticky',
  'RegExp.prototype.unicode': 'unicode',
  'RegExp.prototype.flags': 'flags',
  'RegExp.prototype.test': 'test',
  'RegExp.prototype.exec': 'exec',
  'RegExp.prototype.toString': 'toString',
  
  // Map methods
  'Map.prototype.has': 'has',
  'Map.prototype.get': 'get',
  'Map.prototype.set': 'set',
  'Map.prototype.delete': 'delete',
  'Map.prototype.clear': 'clear',
  'Map.prototype.keys': 'keys',
  'Map.prototype.values': 'values',
  'Map.prototype.entries': 'entries',
  'Map.prototype.forEach': 'forEach',
  'Map.prototype.size': 'size',
  
  // Set methods
  'Set.prototype.has': 'has',
  'Set.prototype.add': 'add',
  'Set.prototype.delete': 'delete',
  'Set.prototype.clear': 'clear',
  'Set.prototype.keys': 'keys',
  'Set.prototype.values': 'values',
  'Set.prototype.entries': 'entries',
  'Set.prototype.forEach': 'forEach',
  'Set.prototype.size': 'size',
  
  // WeakMap methods
  'WeakMap.prototype.has': 'has',
  'WeakMap.prototype.get': 'get',
  'WeakMap.prototype.set': 'set',
  'WeakMap.prototype.delete': 'delete',
  
  // WeakSet methods
  'WeakSet.prototype.has': 'has',
  'WeakSet.prototype.add': 'add',
  'WeakSet.prototype.delete': 'delete',
  
  // Symbol methods
  'Symbol.for': 'for',
  'Symbol.keyFor': 'keyFor',
  'Symbol.hasInstance': 'hasInstance',
  'Symbol.isConcatSpreadable': 'isConcatSpreadable',
  'Symbol.iterator': 'iterator',
  'Symbol.match': 'match',
  'Symbol.replace': 'replace',
  'Symbol.search': 'search',
  'Symbol.species': 'species',
  'Symbol.split': 'split',
  'Symbol.toPrimitive': 'toPrimitive',
  'Symbol.toStringTag': 'toStringTag',
  'Symbol.unscopables': 'unscopables',
  
  // Proxy methods
  'Proxy.revocable': 'revocable',
  
  // Reflect methods
  'Reflect.apply': 'apply',
  'Reflect.construct': 'construct',
  'Reflect.defineProperty': 'defineProperty',
  'Reflect.deleteProperty': 'deleteProperty',
  'Reflect.get': 'get',
  'Reflect.getOwnPropertyDescriptor': 'getOwnPropertyDescriptor',
  'Reflect.getPrototypeOf': 'getPrototypeOf',
  'Reflect.has': 'has',
  'Reflect.isExtensible': 'isExtensible',
  'Reflect.ownKeys': 'ownKeys',
  'Reflect.preventExtensions': 'preventExtensions',
  'Reflect.set': 'set',
  'Reflect.setPrototypeOf': 'setPrototypeOf',
  
  // Global functions
  'structuredClone': 'structuredClone',
  'queueMicrotask': 'queueMicrotask',
  'requestIdleCallback': 'requestIdleCallback',
  'cancelIdleCallback': 'cancelIdleCallback',
  'requestAnimationFrame': 'requestAnimationFrame',
  'cancelAnimationFrame': 'cancelAnimationFrame',
  'setTimeout': 'setTimeout',
  'clearTimeout': 'clearTimeout',
  'setInterval': 'setInterval',
  'clearInterval': 'clearInterval',
  'setImmediate': 'setImmediate',
  'clearImmediate': 'clearImmediate',
  'fetch': 'fetch',
  'BigInt': 'BigInt',
  'globalThis': 'globalThis',
  'atob': 'atob',
  'btoa': 'btoa',
  'encodeURI': 'encodeURI',
  'decodeURI': 'decodeURI',
  'encodeURIComponent': 'encodeURIComponent',
  'decodeURIComponent': 'decodeURIComponent',
  'escape': 'escape',
  'unescape': 'unescape',
  'isNaN': 'isNaN',
  'isFinite': 'isFinite',
  'parseInt': 'parseInt',
  'parseFloat': 'parseFloat',
  'eval': 'eval',
  'Function': 'Function',
  'Array': 'Array',
  'Object': 'Object',
  'String': 'String',
  'Number': 'Number',
  'Boolean': 'Boolean',
  'Date': 'Date',
  'RegExp': 'RegExp',
  'Error': 'Error',
  'TypeError': 'TypeError',
  'ReferenceError': 'ReferenceError',
  'SyntaxError': 'SyntaxError',
  'RangeError': 'RangeError',
  'EvalError': 'EvalError',
  'URIError': 'URIError',
  'Map': 'Map',
  'Set': 'Set',
  'WeakMap': 'WeakMap',
  'WeakSet': 'WeakSet',
  'Symbol': 'Symbol',
  'Proxy': 'Proxy',
  'Reflect': 'Reflect',
  'Promise': 'Promise',
  'Generator': 'Generator',
  'GeneratorFunction': 'GeneratorFunction',
  'AsyncFunction': 'AsyncFunction',
  'AsyncGenerator': 'AsyncGenerator',
  'AsyncGeneratorFunction': 'AsyncGeneratorFunction',
  'Intl': 'Intl',
  'JSON': 'JSON',
  'Math': 'Math',
  'console': 'console',
  'performance': 'performance',
  'crypto': 'crypto',
  'location': 'location',
  'history': 'history',
  'navigator': 'navigator',
  'screen': 'screen',
  'document': 'document',
  'window': 'window',
  'global': 'global',
  'globalThis': 'globalThis',
  'self': 'self',
  'top': 'top',
  'parent': 'parent',
  'frames': 'frames',
  'length': 'length',
  'name': 'name',
  'status': 'status',
  'opener': 'opener',
  'closed': 'closed',
  'innerWidth': 'innerWidth',
  'innerHeight': 'innerHeight',
  'outerWidth': 'outerWidth',
  'outerHeight': 'outerHeight',
  'screenX': 'screenX',
  'screenY': 'screenY',
  'screenLeft': 'screenLeft',
  'screenTop': 'screenTop',
  'scrollX': 'scrollX',
  'scrollY': 'scrollY',
  'pageXOffset': 'pageXOffset',
  'pageYOffset': 'pageYOffset',
  'devicePixelRatio': 'devicePixelRatio',
  'orientation': 'orientation',
  'onload': 'onload',
  'onunload': 'onunload',
  'onbeforeunload': 'onbeforeunload',
  'onresize': 'onresize',
  'onscroll': 'onscroll',
  'onfocus': 'onfocus',
  'onblur': 'onblur',
  'onerror': 'onerror',
  'onabort': 'onabort',
  'onbeforeprint': 'onbeforeprint',
  'onafterprint': 'onafterprint',
  'onhashchange': 'onhashchange',
  'onlanguagechange': 'onlanguagechange',
  'onmessage': 'onmessage',
  'onmessageerror': 'onmessageerror',
  'onoffline': 'onoffline',
  'ononline': 'ononline',
  'onpagehide': 'onpagehide',
  'onpageshow': 'onpageshow',
  'onpopstate': 'onpopstate',
  'onrejectionhandled': 'onrejectionhandled',
  'onstorage': 'onstorage',
  'onunhandledrejection': 'onunhandledrejection',
  'onvisibilitychange': 'onvisibilitychange'
};

/**
 * Analyze JavaScript content
 */
export function analyzeJSContent(jsContent, options = {}) {
  const { requiredLevel = 'low' } = options;
  const issues = [];
  const foundAPIs = new Set();

  try {
    const ast = parse(jsContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true
    });

    traverse(ast, {
      // Check for .at() usage and other method calls
      MemberExpression(path) {
        const { object, property } = path.node;
        
        if (property.type === 'Identifier') {
          const methodName = property.name;
          
          // Check if it's an Array method we care about
          if (JS_APIS[`Array.prototype.${methodName}`]) {
            const apiPath = `Array.prototype.${methodName}`;
            if (!foundAPIs.has(apiPath)) {
              foundAPIs.add(apiPath);
              checkAPI(apiPath, path, issues, requiredLevel);
            }
          }
          
          // Check for String methods
          if (JS_APIS[`String.prototype.${methodName}`]) {
            const apiPath = `String.prototype.${methodName}`;
            if (!foundAPIs.has(apiPath)) {
              foundAPIs.add(apiPath);
              checkAPI(apiPath, path, issues, requiredLevel);
            }
          }
          
          // Check for Promise methods
          if (object.type === 'Identifier' && object.name === 'Promise') {
            const apiPath = `Promise.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for Object methods
          if (object.type === 'Identifier' && object.name === 'Object') {
            const apiPath = `Object.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for Number methods
          if (object.type === 'Identifier' && object.name === 'Number') {
            const apiPath = `Number.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for Math methods
          if (object.type === 'Identifier' && object.name === 'Math') {
            const apiPath = `Math.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for RegExp methods
          if (object.type === 'Identifier' && object.name === 'RegExp') {
            const apiPath = `RegExp.prototype.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for Map methods
          if (object.type === 'Identifier' && object.name === 'Map') {
            const apiPath = `Map.prototype.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for Set methods
          if (object.type === 'Identifier' && object.name === 'Set') {
            const apiPath = `Set.prototype.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for WeakMap methods
          if (object.type === 'Identifier' && object.name === 'WeakMap') {
            const apiPath = `WeakMap.prototype.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for WeakSet methods
          if (object.type === 'Identifier' && object.name === 'WeakSet') {
            const apiPath = `WeakSet.prototype.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for Symbol methods
          if (object.type === 'Identifier' && object.name === 'Symbol') {
            const apiPath = `Symbol.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for Proxy methods
          if (object.type === 'Identifier' && object.name === 'Proxy') {
            const apiPath = `Proxy.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
          
          // Check for Reflect methods
          if (object.type === 'Identifier' && object.name === 'Reflect') {
            const apiPath = `Reflect.${methodName}`;
            if (JS_APIS[apiPath]) {
              if (!foundAPIs.has(apiPath)) {
                foundAPIs.add(apiPath);
                checkAPI(apiPath, path, issues, requiredLevel);
              }
            }
          }
        }
      },
      
      // Check for global functions like structuredClone
      CallExpression(path) {
        const { callee } = path.node;
        
        if (callee.type === 'Identifier') {
          const functionName = callee.name;
          
          if (JS_APIS[functionName]) {
            if (!foundAPIs.has(functionName)) {
              foundAPIs.add(functionName);
              checkAPI(functionName, path, issues, requiredLevel);
            }
          }
        }
      },
      
      // Check for constructor calls
      NewExpression(path) {
        const { callee } = path.node;
        
        if (callee.type === 'Identifier') {
          const constructorName = callee.name;
          
          // Check for constructor usage
          if (JS_APIS[constructorName]) {
            if (!foundAPIs.has(constructorName)) {
              foundAPIs.add(constructorName);
              checkAPI(constructorName, path, issues, requiredLevel);
            }
          }
        }
      },
      
      // Check for property access on global objects
      Identifier(path) {
        const { name } = path.node;
        
        // Check for global object properties
        if (JS_APIS[name] && path.isReferencedIdentifier()) {
          const parent = path.parent;
          
          // Only check if it's not a method call (handled by MemberExpression)
          if (parent.type !== 'MemberExpression' || parent.property !== path.node) {
            if (!foundAPIs.has(name)) {
              foundAPIs.add(name);
              checkAPI(name, path, issues, requiredLevel);
            }
          }
        }
      }
    });

  } catch (error) {
    const errorInfo = handleError(error, { 
      type: 'js_parse',
      contentLength: jsContent?.length || 0 
    });
    
    // Extract line/column from Babel error if available
    let line = null, column = null;
    if (error.loc) {
      line = error.loc.line;
      column = error.loc.column;
    }
    
    throw new ParseError(
      `JavaScript parsing failed: ${error.message}`,
      null,
      line,
      column
    );
  }

  return {
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length
    }
  };
}

/**
 * Check a JavaScript API
 */
function checkAPI(apiPath, path, issues, requiredLevel) {
  const result = checkJavaScriptAPI(apiPath);
  const report = generateReport(result, requiredLevel);
  
  // Include all features for baseline scoring (info, warning, error)
  const loc = path.node.loc;
  
  issues.push({
    line: loc?.start.line,
    column: loc?.start.column,
    api: apiPath,
    severity: report.severity,
    message: report.message,
    baseline: report.baseline,
    support: report.support,
    bcdKey: report.bcdKey,
    compatible: report.compatible
  });
}

/**
 * Analyze a JavaScript file
 */
export const analyzeJSFile = safeAsync(async (filePath, options = {}) => {
  try {
    const content = await readFileWithCleanup(filePath, { 
      encoding: 'utf-8',
      maxSize: options.maxFileSize || 50 * 1024 * 1024
    });
    const result = analyzeJSContent(content, options);
    
    return {
      file: filePath,
      ...result
    };
  } catch (error) {
    // FileError is already properly formatted by readFileWithCleanup
    throw error;
  }
}, { operation: 'analyzeJSFile' });

/**
 * Format JavaScript issues
 */
export function formatJSIssues(issues) {
  return issues.map(issue => {
    const location = issue.line ? `${issue.line}:${issue.column}` : 'unknown';
    
    let icon = '';
    if (issue.severity === 'error') icon = '❌';
    else if (issue.severity === 'warning') icon = '⚠️';
    else icon = 'ℹ️';
    
    let supportInfo = '';
    if (issue.support) {
      const browsers = Object.entries(issue.support)
        .slice(0, 3)
        .map(([browser, version]) => `${browser} ${version}`)
        .join(', ');
      supportInfo = `\n    Support: ${browsers}`;
    }
    
    return `  ${icon} ${location} - ${issue.api}
    ${issue.message}${supportInfo}`;
  }).join('\n\n');
}