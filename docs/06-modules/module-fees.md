# module-fees
> Fees Engine & Collection Module documentation

## Ownership
- Module: `src/modules/fees/`
- Master-setting: `src/master-setting/fees/`
- Service: `src/services/feeSettingsService.js`
- Core: `src/core/fee-engine/feeNormalizer.js`

## Responsibilities
- Fee structure definition
- Fee calculation/normalization
- Receipt generation & printing
- Refund workflow
- Outstanding & due reports
- Audit via receiptAuditService

## Data Entities
- FeeStructure: schoolId, id, classId, feeHead, amount, ...
- Receipt: schoolId, id, studentId, amount, mode, date, ...
- FeeSettings: schoolId, id, tax, concession rules, ...

## Rules (see PACK-01)
- F-01..F-05