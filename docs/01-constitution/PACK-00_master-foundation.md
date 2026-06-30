# PACK-00: Master Foundation
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> Project context, purpose, and core vision

---

## 1. Purpose

ERP-v2 is a **multi-tenant school management ERP** designed for Indian school chains. It digitizes:

- Student lifecycle (admission → transfer → certificates)
- Fee collection with complex rule engines
- Transport logistics
- Hostel management
- Attendance tracking

## 2. Core Principles

| Principle | Meaning |
|-----------|---------|
| **Multi-tenant SaaS** | One codebase, many schools with zero data leakage |
| **Module discipline** | Each module has strict boundaries — no cross-contamination |
| **Storage Authority** | Every data entity has ONE owner module |
| **Service Registry** | All shared logic lives in `src/services/`, owned by registry |
| **Immutable decisions** | PACK docs are permanent — change only via ADR process |
| **Phased rollout** | Changes happen in controlled phases (see PACK-09) |

## 3. Target Users

| Role | Need |
|------|------|
| School Admin | Manage students, fees, transport, hostel |
| Accountant | Fee collection, reports, receipts |
| Transport Manager | Routes, vehicles, drivers |
| Warden | Hostel allocation, room management |
| Teacher | Attendance entry |

## 4. Glossary

| Term | Definition |
|------|------------|
| **Module** | Self-contained business domain (e.g., fees, students) |
| **Storage Owner** | Module that exclusively writes/owns a data entity |
| **Service Registry** | Central authority for shared service files |
| **SAAStenant** | A single school/tenant in multi-tenant deployment |
| **Tenant ID** | Unique identifier isolating tenant data |
| **Freeze** | Locked decision — unchangeable without ADR |