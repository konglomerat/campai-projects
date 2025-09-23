# Finance Dashboard

The purpose of these scripts is to let people at Konglomerat add bookings for revenues or expenses directly to our accounting tool, Campai, using a Google Form. This way, users can submit accounting entries without needing direct access to the full Campai platform, improving accessibility and security.

## How it works

- Apps Script attached to a Google Sheet pulls bookings from Campai via API and dumps it all into a sheet
- Looker Studio uses this Sheet as database for displaying a number of charts and tables

### Setup

the live script is running under a shared account, but you can easily set it up for yourself for testing

1. Open the Google Sheet → **Extensions → Apps Script**
2. Copy the contents of these `.gs` files into the Script Editor
3. Store your API credentials and IDs under **Script Properties**:  
   - `CAMPAI_API_KEY`  
   - `ORG_ID`  
   - `MANDATE_ID`  
4. Run the script and give all the required permissions
5. (optional) set up triggers


### Campai API Endpoints Used

| Purpose                   | Method | Path                                                             | Docs Link                                                                 |
|----------------------------|--------|------------------------------------------------------------------|----------------------------------------------------------------------------|
| Gets a list of receipts for the mandate | POST    | `https://cloud.campai.com/api/${ORG_ID}/${MANDATE_ID}/finance/receipts/list`       | [Campai API Reference – Finance / Receipts](https://docs.campai.com/developer/api-reference/finance/finance-receipts#post-organizationid-mandateid-finance-receipts-list) |
| Fetch Costcenters             | GET    | `https://cloud.campai.com/api/organizations/{organizationId}/mandates/{mandateId}` | [Campai API Reference – Organizations / Mandate](https://docs.campai.com/developer/api-reference/organizations/organizations-mandates#get-organizations-organizationid-mandates-mandateid) |

---

### Notes
- well

