# ERP-v2 Knowledge Governance Engine

**Version:** 1.0.0  
**Status:** ACTIVE  
**Last Updated:** 2026-07-02  
**Maintenance:** Incremental updates (no full rescan required)

---

## Overview

This engine replaces the static document audit with a living governance system. It maintains:

| Component | File | Purpose |
|-----------|------|---------|
| Knowledge Graph | `knowledge-graph.json` | Every document, its relationships, and metadata |
| Authority Graph | `authority-graph.json` | Which documents govern which other documents |
| Lifecycle Graph | `lifecycle-graph.json` | Current, future, historical states |
| Dependency Graph | `dependency-graph.json` | What breaks if something changes |
| Conflict Graph | `conflict-graph.json` | All contradictions between documents |
| AI Routing Index | `ai-routing-index.json` | What every future AI should read, ignore, archive, or upgrade |
| Future Upgrade Queue | `future-upgrade-queue.json` | Documents marked "future-upgrade" surfaced before active docs |

---

## Incremental Update Protocol

When adding/modifying a document:

1. Add/update entry in `knowledge-graph.json`
2. Update authority edges in `authority-graph.json`
3. Check for new conflicts in `conflict-graph.json`
4. Update dependencies in `dependency-graph.json`
5. Update lifecycle state in `lifecycle-graph.json`
6. Rebuild `ai-routing-index.json` (auto-generated)
7. Process `future-upgrade-queue.json` for pending upgrades

Full rescans are NEVER required — only incremental updates.

---

## Entry Point for AI Agents

Any AI agent entering the repository MUST:

1. Read `ai-routing-index.json` -> identify authoritative docs for the task
2. Read `conflict-graph.json` -> be aware of contradictions
3. Read `future-upgrade-queue.json` -> check if any upgrades affect the task
4. Read `authority-graph.json` -> understand governance hierarchy
5. Proceed to read only documents marked `MUST_READ` or `READ_IF_RELEVANT`

Documents marked `MUST_IGNORE` or `SAFE_TO_ARCHIVE` should NEVER be read.

---

## Graph Schema

### Document Node
```json
{
  "id": "doc-XXX",
  "name": "FOUNDATION-BASELINE.md",
  "path": "docs/FOUNDATION-BASELINE.md",
  "authorityScore": 100,
  "category": "MASTER_AUTHORITY",
  "tags": ["permanent", "baseline", "contracts", "governance"],
  "created": "2026-06-25",
  "effective": "2026-06-25",
  "deprecated": null,
  "supersededBy": null,
  "archived": false,
  "permanent": true
}
```

### Authority Edge
```json
{
  "source": "FOUNDATION-BASELINE.md",
  "target": "PACK-00_master-foundation.md",
  "type": "GOVERNS",
  "strength": "DIRECT"
}
```

### Conflict Edge
```json
{
  "source": "FOUNDATION-BASELINE.md",
  "target": "PACK-03_saas-multi-tenant.md",
  "type": "CONTRADICTS",
  "topic": "Storage key format",
  "severity": "HIGH",
  "resolution": "PACK format is CURRENT; FOUNDATION-BASELINE format is TARGET for Phase 5+",
  "resolved": true
}
```

---

## File Structure

```
docs/governance-engine/
├── README.md                       ← This file
├── knowledge-graph.json            ← Master document registry
├── authority-graph.json            ← Governance hierarchy
├── lifecycle-graph.json            ← Lifecycle state machine
├── dependency-graph.json           ← Dependency & impact analysis
├── conflict-graph.json             ← Contradictions & resolutions
├── ai-routing-index.json           ← AI reading priorities
└── future-upgrade-queue.json       ← Pending upgrades