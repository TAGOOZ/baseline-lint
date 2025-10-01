# baseline-lint Dashboard 📊

> Beautiful Next.js web interface for interactive baseline compatibility scanning

A modern, responsive dashboard that provides a visual interface for the `baseline-lint` CLI tool, built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

- 🎨 **Modern UI**: Clean, responsive interface with shadcn/ui components
- 🔍 **Interactive Scanning**: Real-time file and directory scanning
- 📊 **Live Results**: Instant baseline compatibility scores and detailed reports
- 🌙 **Dark/Light Mode**: Automatic theme switching support
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- ⚡ **Fast Performance**: Optimized with Next.js App Router
- 🛡️ **Type Safety**: Full TypeScript support throughout

## 🚀 Quick Start

### Prerequisites

Make sure you have the main `baseline-lint` package working:

```bash
cd ../  # Go to main project root
npm install
npm run test:unit  # Ensure CLI is working
```

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Production Build

```bash
npm run build
npm start
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **API**: Next.js API Routes
- **CLI Integration**: Direct integration with `../bin/cli.js`

### Project Structure
```
baseline-dashboard/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # Reusable UI components
│   └── lib/          # Utilities and helpers
├── public/           # Static assets
└── package.json      # Dependencies and scripts
```

## 🔗 CLI Integration

The dashboard seamlessly integrates with the parent `baseline-lint` CLI tool via the `/api/scan` API route.

### API Endpoint

**`GET /api/scan`**

Query Parameters:
- `path` (optional): Target directory or file path
  - Supports absolute paths or relative to project root
  - Defaults to `../src` (parent project source)
  - Examples: `/home/user/project`, `../test-files`, `./sample.css`

- `level` (optional): Baseline compatibility level filter
  - `high` (default): Only widely available features
  - `low`: Newly available features
  - `all`: No filtering, show everything

### Response Format

```json
{
  "success": true,
  "score": "94/100",
  "totalFiles": 12,
  "issues": "2 errors, 14 warnings",
  "details": [
    {
      "file": "src/styles.css",
      "line": 15,
      "feature": "container-queries", 
      "severity": "warning",
      "baseline": "newly-available"
    }
  ]
}
```

### Features & Reliability

- ⚡ **Smart Scanning**: Single file optimization for faster responses
- 🔄 **Fallback Strategy**: Per-file scanning when directory scan fails
- 🛡️ **Error Resilience**: Parse errors don't halt the entire scan
- 📊 **Late Score Calculation**: Calculates scores even when fallbacks are used
- ⏱️ **Timeout Protection**: 30-second timeout prevents hanging
- 🧹 **Clean Exit**: Proper resource cleanup after each scan

## 🎨 UI Components

Built with modern, accessible components:

- **Scanner Interface**: File/directory input with real-time validation
- **Results Display**: Beautiful cards showing scores and issues
- **Progress Indicators**: Loading states and scan progress
- **Error Handling**: Graceful error messages and retry options
- **Responsive Layout**: Mobile-first design that works everywhere

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Environment Setup

The dashboard expects the parent `baseline-lint` CLI to be available at `../bin/cli.js`. Make sure:

1. Parent project is properly installed (`npm install` in root)
2. CLI is working (`node ../bin/cli.js --help`)
3. All recent fixes are applied (timeout protection, cleanup, etc.)

## 📱 Screenshots

### Main Interface
- Clean, modern scanning interface
- Real-time path validation
- Instant compatibility scoring

### Results View  
- Detailed compatibility reports
- Issue breakdown by severity
- File-by-file analysis

### Mobile Experience
- Fully responsive design
- Touch-friendly interactions
- Optimized for small screens

## 🚀 Deployment

The dashboard can be deployed to any Next.js-compatible platform:

- **Vercel**: `vercel deploy`
- **Netlify**: Connect to Git repository
- **Docker**: Build and containerize
- **Static Export**: `npm run build && npm run export`

Note: Ensure the baseline-lint CLI is available in the deployment environment.

## 🔗 Integration Examples
{
	"score": 72,
	"totalFiles": 3,
	"cssFiles": 1,
	"jsFiles": 2,
	"criticalIssues": 0,
	"warnings": 7,
	"infoIssues": 12,
	"cleanFiles": 0,
	"recentFiles": [ { "name": "file.css", "issues": 10, "score": 50 } ]
}
```

### Examples
```bash
curl 'http://localhost:3000/api/scan'
curl 'http://localhost:3000/api/scan?path=../temp-test-dir&level=all'
curl 'http://localhost:3000/api/scan?path=/absolute/path/to/file.js'
```

### POST Variant
`POST /api/scan` body:
```json
{ "path": "../src", "options": { "baselineLevel": "low" } }
```
Returns same structure as GET after running a customized scan.

### Troubleshooting
- If `totalFiles` = 0 but files exist: ensure target path is reachable from repository root.
- If a single problematic file causes parse errors, it will be skipped; remaining files still report.
- Use `level=all` to inspect full issue set without Baseline severity filtering.

### Security & Path Handling
- Absolute paths converted to repository-relative for CLI invocation.
- Only CSS / JS / TS extensions included.
- Path traversal segments sanitized by CLI validator.

### Development
API logic lives in `src/app/api/scan/route.ts`. Adjust fallback or scoring heuristics there.

## Deployment

Use any Node.js hosting, container platform (Docker), or static export target (if applicable). See the official Next.js deployment docs for generic guidance: https://nextjs.org/docs/app/building-your-application/deploying
