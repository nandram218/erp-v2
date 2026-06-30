const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname, 'categories');
const OUTPUT = path.join(__dirname, 'AUDIT_REPORT_v1.md');

const files = fs.readdirSync(RULES_DIR)
  .filter(f => f.match(/^RULE-\d{2}-.+\.md$/))
  .sort();

const genericTerms = /\b(User|Account|Database|Shopping Cart|Order|Product|Customer|Client|Employee)\b/gi;
const corruptionPatterns = /<parameter|<execute_command|<write_to_file|<read_file|<\/\w+>/g;

const report = ['# Constitution Audit Report v1.0', '', 'Generated: ' + new Date().toISOString(), '', '## Summary', ''];
const details = [];

files.forEach(file => {
  const full = path.join(RULES_DIR, file);
  const text = fs.readFileSync(full, 'utf8');
  const lines = text.split(/\r?\n/).length;
  const issues = [];
  const changes = [];

  // Check corruption
  const corruptionMatches = text.match(corruptionPatterns);
  if (corruptionMatches) {
    issues.push(`Corruption detected: ${corruptionMatches.length} XML/tool tag fragments`);
    changes.push('Remove corrupted XML/tool fragments');
  }

  // Check metadata
  const requiredMeta = ['Version', 'Status', 'Maintained By', 'Severity'];
  requiredMeta.forEach(meta => {
    if (!text.includes(meta)) {
      issues.push(`Missing metadata: ${meta}`);
      changes.push(`Add ${meta} to header`);
    } else if (!text.includes('Authority') && !text.includes('Maintained By:')) {
      issues.push('Missing Authority field');
      changes.push('Add Authority field');
    }
  });

  // Check ERP-v2 specificity
  const genericMatches = text.match(genericTerms);
  if (genericMatches) {
    issues.push(`Generic examples found: ${[...new Set(genericMatches)].join(', ')} (${genericMatches.length} occurrences)`);
    changes.push('Replace generic examples with ERP-v2 domain terms (Student, Admission, Fee Engine, Transport, Hostel, Attendance, Exam, Payroll, Inventory, Library)');
  }

  // Check sections
  const sections = ['WHY', 'WHEN', 'WHERE', 'HOW', 'VALIDATION', 'COMMON VIOLATION', 'AUTO FIX', 'MANUAL FIX'];
  const missingSections = sections.filter(s => !text.includes(s));
  if (missingSections.length > 0) {
    issues.push(`Missing sections: ${missingSections.join(', ')}`);
    changes.push(`Add missing sections: ${missingSections.join(', ')}`);
  }

  // Check related rules references
  if (!text.includes('Related Rules') && !text.includes('Related Rules')) {
    issues.push('Missing Related Rules references');
    changes.push('Add Related Rules cross-reference section');
  }

  // Check severity
  if (!text.includes('Severity:')) {
    issues.push('Missing Severity declaration');
    changes.push('Add Severity field');
  }

  // Check ownership
  if (!text.includes('Who May Modify')) {
    issues.push('Missing ownership fields');
    changes.push('Add Who May Modify / Who Cannot Modify');
  }

  // Check line count
  if (lines > 1200) {
    issues.push(`File too large: ${lines} lines (target ~700-1200)`);
    changes.push('Reduce verbosity, move examples/tables to references');
  }

  // Check decision references
  if (!text.includes('ADR-') && !text.includes('Decision')) {
    issues.push('No related ADR references');
    changes.push('Add related ADR references if applicable');
  }

  // Overall status
  const status = issues.length === 0 ? 'PASS' : 'NEEDS_REPAIR';
  details.push(`### ${file}`, `**Status:** ${status}`, `**Lines:** ${lines}`, `**Issues:** ${issues.length > 0 ? issues.join('; ') : 'None'}`, `**Changes:** ${changes.length > 0 ? changes.join('; ') : 'None'}`, '');
});

report.push('## Rule-by-Rule Audit', '');
report.push(...details);

fs.writeFileSync(OUTPUT, report.join('\n'));
console.log('Audit report written to', OUTPUT);