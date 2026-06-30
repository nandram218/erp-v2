const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname);
const CATEGORIES_DIR = path.join(RULES_DIR, 'categories');

// Generic terms to replace with ERP-v2 equivalents
const replacements = [
  { from: /\bUser\b/gi, to: 'Student/Parent' },
  { from: /\buser\b/gi, to: 'student/parent' },
  { from: /\bAccount\b/gi, to: 'Student Record' },
  { from: /\baccount\b/gi, to: 'student record' },
  { from: /\bOrder\b/gi, to: 'Fee Transaction' },
  { from: /\border\b/gi, to: 'fee transaction' },
  { from: /\bDatabase\b/gi, to: 'Storage Layer' },
  { from: /\bdatabase\b/gi, to: 'storage layer' },
  { from: /\bClient\b/gi, to: 'School/Tenant' },
  { from: /\bclient\b/gi, to: 'school/tenant' },
  { from: /\bCustomer\b/gi, to: 'School/Tenant' },
  { from: /\bcustomer\b/gi, to: 'school/tenant' },
  { from: /\bEmployee\b/gi, to: 'Staff/Teacher' },
  { from: /\bProduct\b/gi, to: 'Inventory Item' },
  { from: /\bproduct\b/gi, to: 'inventory item' },
];

// Files with corruption
const corruptFiles = [
  'RULE-07-ui.md',
  'RULE-09-performance.md', 
  'RULE-14-code-quality.md',
  'RULE-28-feature-development.md'
];

const files = fs.readdirSync(CATEGORIES_DIR)
  .filter(f => f.match(/^RULE-\d{2}-.+\.md$/))
  .sort();

const report = ['# Constitution Repair Report', '', 'Generated: ' + new Date().toISOString(), '', '## Summary', ''];

files.forEach(file => {
  const full = path.join(CATEGORIES_DIR, file);
  let text = fs.readFileSync(full, 'utf8');
  const original = text;
  const changes = [];

  // Remove corruption patterns
  const corruptionPattern = /<parameter[^>]*>|<\/parameter>|<execute_command[^>]*>|<\/execute_command>|<write_to_file[^>]*>|<\/write_to_file>|<read_file[^>]*>|<\/read_file>/gi;
  let corruptionCount = 0;
  text = text.replace(corruptionPattern, (match) => {
    corruptionCount++;
    return '';
  });
  if (corruptionCount > 0) {
    changes.push(`Removed ${corruptionCount} corrupted XML/tool fragments`);
  }

  // Replace generic terms
  replacements.forEach(rule => {
    const matches = text.match(rule.from);
    if (matches && matches.length > 0) {
      changes.push(`Replaced ${matches.length} generic terms (${rule.from.toString().match(/\\b(\w+)\\b/gi)[1]}) with "${rule.to}"`);
      text = text.replace(rule.from, rule.to);
    }
  });

  // Fix metadata header - ensure Authority field exists
  if (text.includes('**Maintained By:**') && !text.includes('**Authority:**')) {
    text = text.replace('**Maintained By:**', '**Maintained By:** \n**Authority:** Architecture Team');
    changes.push('Added Authority field to metadata');
  }

  // Add ownership section if missing
  if (!text.includes('## Ownership') && !text.includes('## Ownership & Authority')) {
    const lastSectionMatch = text.match(/## (?!Ownership)[^\n]+(\n|$)/g);
    if (lastSectionMatch) {
      const lastSection = lastSectionMatch[lastSectionMatch.length - 1];
      text = text.replace(lastSection, lastSection + '\n\n## Ownership & Authority\n\n' +
        '- **Owner**: See "Maintained By" in metadata\n' +
        '- **Authority**: See "Authority" in metadata\n' +
        '- **Who May Modify**: Senior Developers, Tech Leads\n' +
        '- **Who Cannot Modify**: Junior Developers (may propose changes, cannot approve)\n' +
        '- **Breaking Changes**: Require Architecture Team approval\n');
      changes.push('Added Ownership & Authority section');
    }
  }

  // Add Related Rules section if missing
  if (!text.includes('## Related Rules')) {
    const ownershipMatch = text.match(/## Ownership[^\n]*\n[\s\S]*?(?=\n## |$)/);
    if (ownershipMatch) {
      const insertPoint = ownershipMatch[0].length + ownershipMatch.index;
      const relatedSection = '\n\n## Related Rules\n\n' +
        '- **RULE-01**: Architecture Guidelines\n' +
        '- **RULE-03**: Service Layer\n' +
        '- **RULE-04**: SaaS Multi-Tenancy\n';
      text = text.slice(0, insertPoint) + relatedSection + text.slice(insertPoint);
      changes.push('Added Related Rules section');
    }
  }

  // Clean up excessive blank lines (more than 2 in a row)
  text = text.replace(/\n{4,}/g, '\n\n');

  if (text !== original) {
    fs.writeFileSync(full, text);
    report.push(`### ${file}`);
    report.push(`**Status:** REPAIRED`);
    report.push(`**Changes:** ${changes.join('; ')}`);
    report.push('');
    console.log(`✓ Repaired ${file}`);
  } else {
    report.push(`### ${file}`);
    report.push(`**Status:** NO_CHANGES`);
    report.push('');
    console.log(`- No changes needed for ${file}`);
  }
});

// Balance check - ensure lines stay reasonable
files.forEach(file => {
  const full = path.join(CATEGORIES_DIR, file);
  const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/).length;
  console.log(`${file}: ${lines} lines`);
});

fs.writeFileSync(path.join(RULES_DIR, 'REPAIR_REPORT_v1.md'), report.join('\n'));
console.log('\nRepair report written to docs/07-rulebook/REPAIR_REPORT_v1.md');