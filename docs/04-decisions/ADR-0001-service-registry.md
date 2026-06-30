# ADR-0001: Service Registry Decision
> **Status:** Accepted
> **Date:** 2026-06-29

## Context
Need a single source of truth for all shared business logic and data access.

## Decision
All shared code lives in `src/services/`. Each file is owned by one module. Modules communicate only via this registry.

## Consequences
✅ Clear ownership
✅ Easier testing
❌ Extra indirection for every call
❌ Requires strict discipline