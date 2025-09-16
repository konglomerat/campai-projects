# Campai Projects
All code related to our campai setup like booking forms, scripts and frontend customizations

## Campai Google Form Integration

This repository contains all Google Apps Script files that extend a Google Form to automatically forward submitted data into the [Campai API](https://docs.campai.com/developer).

**Why?**
The purpose of these scripts is to let people at Konglomerat add bookings for revenues or expenses directly to our accounting tool, Campai, using a Google Form. This way, users can submit accounting entries without needing direct access to the full Campai platform, improving accessibility and security.

## Files

- **Form_Setup.gs**  
  - Populates dropdowns in the Form with dynamic data from Campai (e.g. cost centers, creditors)
  - Can be run manually or on a trigger (time-driven or editor menu)

- **Handle_Responses.gs**  
  - Runs on Form submit
  - Reads responses, normalizes values (dates, numbers, cost centers)
  - Builds a JSON payload for Campai and executes the API call
  - Supports both Einnahme (revenue) and Ausgabe (expense) flows

## Setup

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

## Development Notes

- The scripts logs outgoing payloads and API responses to **Executions → Logs** in Apps Script.  
- Cost centers and creditor dropdowns are filled dynamically from Campai’s API  
- Receipt payloads include conditional handling for expense vs. revenue and support cost center tags

## To-DO

- [ ] File uploads for receipts (Campai requires a pre-signed upload URL flow)
- [ ] Error Handling
- [ ] Eigenbelege
