// scripts/serve-dashboard.js
// Simple HTTP server for the dashboard

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const HOST = 'localhost';

// Simple rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip);
  // Remove old requests outside the window
  const validRequests = requests.filter(time => time > windowStart);
  requestCounts.set(ip, validRequests);
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  validRequests.push(now);
  return true;
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

async function serveFile(filePath, res) {
  try {
    // Security: Validate file path
    if (filePath.includes('..') || filePath.includes('~')) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid file path');
      return;
    }
    
    // Security: Check file size limit (10MB)
    const stats = await fs.stat(filePath);
    if (stats.size > 10 * 1024 * 1024) {
      res.writeHead(413, { 'Content-Type': 'text/plain' });
      res.end('File too large');
      return;
    }
    
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600' // 1 hour cache
    });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else if (error.code === 'EACCES') {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  }
}

const server = http.createServer(async (req, res) => {
  // Get client IP for rate limiting
  const clientIP = req.connection.remoteAddress || 
                   req.socket.remoteAddress || 
                   (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                   'unknown';
  
  // Rate limiting check
  if (!checkRateLimit(clientIP)) {
    res.writeHead(429, { 'Content-Type': 'text/plain' });
    res.end('Too Many Requests');
    return;
  }
  
  // Validate request method
  if (!['GET', 'OPTIONS'].includes(req.method)) {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }
  
  // Validate URL length
  if (req.url.length > 2048) {
    res.writeHead(414, { 'Content-Type': 'text/plain' });
    res.end('URI Too Long');
    return;
  }
  
  // Secure CORS configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve dashboard HTML
  if (req.url === '/' || req.url === '/index.html') {
    const dashboardPath = path.join(__dirname, '..', 'dashboard', 'index.html');
    await serveFile(dashboardPath, res);
    return;
  }

  // API endpoint to get baseline data
  if (req.url === '/api/data') {
    // In production, this would read actual baseline-report.json
    const sampleData = {
      currentScore: 87,
      previousScore: 84,
      timestamp: new Date().toISOString(),
      history: [],
      distribution: [],
      fileIssues: [],
      recentIssues: []
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sampleData));
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(chalk.bold.green('\n✅ Dashboard server started!\n'));
  console.log(chalk.cyan(`📊 Dashboard: ${chalk.bold(`http://${HOST}:${PORT}`)}`));
  console.log(chalk.gray('\nPress Ctrl+C to stop\n'));
});