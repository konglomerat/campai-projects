/**
 * Fetch cost centers for the mandate and write to a sheet.
 */
function refreshCostCentersSheet() {
  const API_KEY    = 'YOUR_API_KEY_HERE';
  const ORG_ID     = '67f6ef856a53aa169bdc05b2';
  const MANDATE_ID = '6825d7bb46f4de83f0461115';
  const SHEET_NAME = 'CostcenterLookup';

  const url = `https://cloud.campai.com/api/organizations/${ORG_ID}/mandates/${MANDATE_ID}`;
  const res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { 'X-API-Key': API_KEY },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error(`API ${res.getResponseCode()}: ${res.getContentText()}`);
  }

  const data = JSON.parse(res.getContentText());
  const list = Array.isArray(data.costCenters) ? data.costCenters : [];

  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  const header = ['Number','Label','Bookable'];
  const rows = list.map(cc => [
    cc.number == null ? '' : Number(cc.number),
    cc.label || '',
    cc.bookable === true
  ]);

  sheet.clear();
  sheet.getRange(1,1,1,header.length).setValues([header]).setFontWeight('bold');
  if (rows.length) sheet.getRange(2,1,rows.length,header.length).setValues(rows);
  for (let c = 1; c <= header.length; c++) sheet.autoResizeColumn(c);
}