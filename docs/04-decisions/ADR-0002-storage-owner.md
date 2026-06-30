# ADR-0002: Storage Ownership Model
> **Status:** Accepted
> **Date:** 2026-06-29

## Context
Need clear data ownership rules in a multi-tenant environment.

## Decision
All data is stored in `localStorage` with key pattern `{schoolId}__{module}__{entity}`. Each module is the sole owner of its entities. Access is exclusively via `storageService.js`.

## Consequences
✅ Tenant isolation is enforced in one place
✅ Easy to swap localStorage for API later
❌ Developer discipline required to not bypass storageService
❌ Key design limits complex queries