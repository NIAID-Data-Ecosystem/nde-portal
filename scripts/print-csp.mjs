// Usage: node scripts/print-csp.mjs <production|staging|dev>
// Prints the policy on one line, for a CloudFront header value.
import { readFileSync } from 'node:fs';

const env = process.argv[2];
const csp = JSON.parse(
  readFileSync(new URL('../configs/csp.json', import.meta.url), 'utf8'),
);
if (!csp[env]) {
  console.error(
    `Unknown environment "${env}". Use one of: ${Object.keys(csp).join(', ')}`,
  );
  process.exit(1);
}
console.log(csp[env].join('; '));
