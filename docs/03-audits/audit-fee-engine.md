# audit-fee-engine
> Fee engine and normalizer compliance audit

Findings:
- feeNormalizer.js exists and centralizes fee logic
- Receipts stored via receiptService
- Concession and approval logic lives in fees module

Gaps:
- Normalizer not enforced on all fee write paths (e.g., import?)
- No coverage for refund flow integration test

Action items:
- [ ] Harden feeNormalizer to run on every fee mutation
- [ ] Add refund integration test