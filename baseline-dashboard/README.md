This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load system and custom fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Baseline Lint Integration

This dashboard consumes the local `baseline-lint` CLI via an API route at `/api/scan`.

### Endpoint
`GET /api/scan?path=<target>&level=<level>`

Parameters:
- `path` (optional) Directory or single file. Absolute or repo-relative. Defaults to `../src`.
- `level` (optional) `high | low | all` (default `high`). Use `all` to disable filtering.

Features:
- Single file short‑circuit for faster responses.
- Fallback per‑file scanning when initial directory scan returns zero results.
- Parse-error files skipped (not fatal) with remaining results still aggregated.
- Late score calculation if fallback produced results but initial score was absent.

Response shape (fields may be subset depending on results):
```json
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
