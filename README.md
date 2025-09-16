# Campai Projects
All code related to our campai setup like booking forms, scripts and frontend customizations

## Campai Google Form Integration

The purpose of these scripts is to let people at Konglomerat add bookings for revenues or expenses directly to our accounting tool, Campai, using a Google Form. This way, users can submit accounting entries without needing direct access to the full Campai platform, improving accessibility and security.

### Campai API Endpoints Used

| Purpose                   | Method | Path                                                             | Docs Link                                                                 |
|----------------------------|--------|------------------------------------------------------------------|----------------------------------------------------------------------------|
| Fetch cost centers (Dropdowns) | GET    | `/api/organizations/{organizationId}/mandates/{mandateId}`       | [Campai API Reference – Organizations & Mandates](https://docs.campai.com/developer/api-reference/organizations) |
| Fetch creditor list             | GET    | `/api/{organizationId}/{mandateId}/finance/accounts/creditors/list` | [Campai API Reference – Finance / Accounts / Creditors](https://docs.campai.com/developer/api-reference/finance/finance-accounts/accounts-creditors#post-organizationid-mandateid-finance-accounts-creditors-list) |
| Retrieve signed upload URL | GET    | `/api/storage/uploadUrl`                                         | [Campai API Reference – Storage](https://docs.campai.com/developer/api-reference/storage#get-storage-uploadurl) |
| Upload file to S3 (using signed URL) | PUT    | `<url returned by /storage/uploadUrl>`                           | [Campai API Reference – Storage](https://docs.campai.com/developer/api-reference/storage) |
| Create expense receipt     | POST   | `/api/{organizationId}/{mandateId}/receipts/expense`             | [Campai API Reference – Finance Receipts](https://docs.campai.com/developer/api-reference/finance/finance-receipts#post-organizationid-mandateid-receipts-expense) |
| Create revenue receipt     | POST   | `/api/{organizationId}/{mandateId}/receipts/revenue`             | [Campai API Reference – Finance Receipts](https://docs.campai.com/developer/api-reference/finance/finance-receipts#post-organizationid-mandateid-receipts-revenue) |

---

### Notes
- **Debitor/Creditor Number**: If a user selects an existing creditor/debtor from the list, this number is used as the account. Otherwise, a manual name is entered and the posting is made to a fallback account that serves as a collector
- **Payments**: Payment assignments are handled directly in Campai, since this is more accurate and often happens semi-automatically when Campai recognizes matching receipt numbers
- **Chart of Accounts (SKR42) and Cost Centers**: For now, every booking submitted via the form is posted to the same SKR42 account (13700) and Sphäre/Cost Center 1 (9). Reassignment is done later in Campai, as this requires knowledge of the chart of accounts and cost center structure
- **Authentication**: The API key and IDs for Org, Mandate, and Form are stored in Apps Script Properties to make them easier to manage
- **Files**: Uploaded separately via a signed URL, then referenced in receipts with `receiptFileId` (UUID) and `receiptFileName` (string)

### Setup

1. Open the Google Form → **Extensions → Apps Script**.  
2. Copy the contents of these `.gs` files into the Script Editor.  
3. Store your API credentials and IDs under **Script Properties**:  
   - `CAMPAI_API_KEY`  
   - `ORG_ID`  
   - `MANDATE_ID`  
   - `FORM_ID`  
4. Create triggers:  
   - `createExpenseReceipt` → **From form → On form submit**  
   - `fillCostCenterDropdown` → **Time-driven** or via menu if you prefer manual refresh.  

### Development Notes

- The scripts logs outgoing payloads and API responses to **Executions → Logs** in Apps Script.  
- Cost centers and creditor dropdowns are filled dynamically from Campai’s API  
- Receipt payloads include conditional handling for expense vs. revenue and support cost center tags

### To-DO

- [ ] File uploads for receipts (Campai requires a pre-signed upload URL flow)
- [ ] Error Handling
- [ ] Eigenbelege
