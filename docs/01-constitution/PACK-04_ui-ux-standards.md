# PACK-04: UI/UX Standards
> **ERP-v2 Knowledge Base v1.0 (Permanent)**
> Frontend consistency rules

---

## 1. Design Principles

- **Mobile-first** — Every screen works on 320px width
- **Hindi+English bilingual** — All labels in both languages
- **Print-friendly** — Receipts, certificates, reports must print clean
- **Offline-capable** — Forms work offline, sync when online

## 2. Component Standards

| Component | Must Have | File Location |
|-----------|-----------|---------------|
| Form | Validation + Hindi labels | `src/modules/{module}/components/*Form.jsx` |
| Table | Column toggle + Export | `src/modules/{module}/components/*Table.jsx` |
| Modal | Escape to close + Focus trap | Global component |
| Button | Loading state + Disabled state | Global component |

## 3. Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Primary | #1a56a0 | Headers, primary buttons |
| Success | #10710e | Success messages |
| Warning | #92400e | Warnings |
| Danger | #b91c1c | Delete, errors |
| Neutral | #6b7280 | Secondary text |

## 4. Typography

| Element | Size | Weight |
|---------|------|--------|
| H1 | 24px | 700 |
| H2 | 20px | 600 |
| Body | 14px | 400 |
| Small | 12px | 400 |

## 5. Form Validation

```javascript
const rules = {
  required: (v) => !!v || 'यहां भरें',
  email: (v) => /.+@.+\..+/.test(v) || 'गलत ईमेल',
  min: (n) => (v) => v.length >= n || `कम से कम ${n} अक्षर`,
};
```

## 6. Responsive Breakpoints

| Name | Width |
|------|-------|
| Mobile | < 640px |
| Tablet | 640px - 1024px |
| Desktop | > 1024px |