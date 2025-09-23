# Campai Projects
All code related to our campai setup like booking forms, scripts and frontend customizations

- [Buchungsformular](/Buchungsformular):lets people at Konglomerat add bookings for revenues or expenses directly to our accounting tool
- [Buchhaltung_Dashboard](/Buchhaltung_Dashboard): simple overview of the finances of whole Konglomerat as well as each costcenter (werkbereich)

### Campai API Endpoints Used

| Purpose                   | Method | Path                                                             | Docs Link                                                                 |
|----------------------------|--------|------------------------------------------------------------------|----------------------------------------------------------------------------|
| Fetch cost centers (Dropdowns) | GET    | `/api/organizations/{organizationId}/mandates/{mandateId}`       | [Campai API Reference – Organizations & Mandates](https://docs.campai.com/developer/api-reference/organizations) |
| Fetch creditor list             | GET    | `/api/{organizationId}/{mandateId}/finance/accounts/creditors/list` | [Campai API Reference – Finance / Accounts / Creditors](https://docs.campai.com/developer/api-reference/finance/finance-accounts/accounts-creditors#post-organizationid-mandateid-finance-accounts-creditors-list) |
| Retrieve signed upload URL | GET    | `/api/storage/uploadUrl`                                         | [Campai API Reference – Storage](https://docs.campai.com/developer/api-reference/storage#get-storage-uploadurl) |
| Upload file to S3 (using signed URL) | PUT    | `<url returned by /storage/uploadUrl>`                           | [Campai API Reference – Storage](https://docs.campai.com/developer/api-reference/storage) |
| Create expense receipt     | POST   | `/api/{organizationId}/{mandateId}/receipts/expense`             | [Campai API Reference – Finance Receipts](https://docs.campai.com/developer/api-reference/finance/finance-receipts#post-organizationid-mandateid-receipts-expense) |
| Create revenue receipt     | POST   | `/api/{organizationId}/{mandateId}/receipts/revenue`             | [Campai API Reference – Finance Receipts](https://docs.campai.com/developer/api-reference/finance/finance-receipts#post-organizationid-mandateid-receipts-revenue) |

### To-DO

- [X] File uploads for receipts (Campai requires a pre-signed upload URL flow)
- [ ] Übersicht Budgets der einzelnen Werkbereiche
- [ ] Rückerstattungen
- [ ] Error Handling
- [ ] Eigenbelege

