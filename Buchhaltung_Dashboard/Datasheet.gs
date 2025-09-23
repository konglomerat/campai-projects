/**
 * Full refresh: fetch ALL receipts (no year/type filters) and overwrite the sheet in one go.
 */
function refreshReceiptsSheet(opts) {
  const {
    sheetName = 'Raw API Receipts',
    limit = 100,
  } = opts || {};

  const p = PropertiesService.getScriptProperties();
  const API_KEY    = p.getProperty('CAMPAI_API_KEY');
  const ORG_ID     = p.getProperty('ORG_ID');
  const MANDATE_ID = p.getProperty('MANDATE_ID');

  const receiptsUrl = `https://cloud.campai.com/api/${ORG_ID}/${MANDATE_ID}/finance/receipts/list`;
  const mandateUrl  = `https://cloud.campai.com/api/organizations/${ORG_ID}/mandates/${MANDATE_ID}`;

  // 1) Fetch cost centers once → build { number: label } map
  const ccMap = getCostCenterMap_(mandateUrl, API_KEY);

  const allRows = [];
  let offset = 0;
  let counter = 1;

  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  const header = [
    'ID',
    'Beleg ID',
    'Datum Zahlung',
    'Sphäre',
    'Bereich Nummer',
    'Bereich Name',
    'Account ID',
    'Account Name',
    'Position',
    'Beschreibung',
    'Betrag Gesamt',
    'Status',
    'Notizen',
    'Tags',
    'Datum Fälligkeit',
    'Datum Erstellung',
    'Datum Update',
    'Belegnummer',
    'Datum Beleg',
    'Beleg Datei',
    'paymentdifference',
    'refund',
    'Typ'
  ];

  while (true) {
    const body = {
      sort: { receiptDate: 'asc' },
      limit: 100,
      offset,
      returnCount: offset === 0, //only count on first chunk where offset is 0
    };

    Logger.log('API fetch body: %s', JSON.stringify(body, null, 2)); 

    const res = UrlFetchApp.fetch(receiptsUrl, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'X-API-Key': API_KEY },
      muteHttpExceptions: true,
      payload: JSON.stringify(body),
    });

    if (res.getResponseCode() !== 200) {
      throw new Error(`API ${res.getResponseCode()}: ${res.getContentText()}`);
    }

    const data = JSON.parse(res.getContentText());
    const receipts = Array.isArray(data.receipts) ? data.receipts : [];
    if (!receipts.length) break;

    for (const r of receipts) {

      const positions = Array.isArray(r.positions) ? r.positions : [];
      if (!positions.length) continue;

      for (const p of positions) {
        
        const cc2Name = p.costCenter2 === '' ? '' : (ccMap[p.costCenter2] || '');

        allRows.push([
          counter++,
          r._id || '',
          r.paidAt || '',
          Number(p.costCenter1),
          Number(p.costCenter2),
          cc2Name,
          Number(r.account),
          r.accountName || '',
          p.description || '',
          r.description || '',
          signedEur(r.type, p.amount),
          r.paymentStatus || '',
          safeJson_(r.notes),
          safeJson_(r.tags),
          r.dueDate || '',
          r.createdAt || '',
          r.updatedAt || '',
          r.receiptNumber || '',
          r.receiptDate || '',
          r.receiptFile || '',
          r.paymentDifference || '',
          r.refund === true,
          r.type || ''
        ]);
      }
    }

    offset += receipts.length; //bumps up offset by number of receipts after each call until end of loop
    if (receipts.length < limit) break; // done
    Utilities.sleep(200); // be polite to the API
  }

  // Overwrite sheet in one batch
  sheet.clear();
  sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (allRows.length) {
    sheet.getRange(2, 1, allRows.length, header.length).setValues(allRows);
  }
  autoResize_(sheet, header.length);
  Logger.log(`Wrote ${allRows.length} receipts to "${sheetName}".`);
}

/** =========== Helpers =============== */

/** Fetch mandate and return a { number: label } map for cost centers */
function getCostCenterMap_(mandateUrl, apiKey) {
  const res = UrlFetchApp.fetch(mandateUrl, {
    method: 'get',
    headers: { 'X-API-Key': apiKey },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error(`Mandate API ${res.getResponseCode()}: ${res.getContentText()}`);
  }
  const data = JSON.parse(res.getContentText());
  const list = Array.isArray(data.costCenters) ? data.costCenters : [];
  const map = {};
  for (const cc of list) {
    // keys as Numbers so lookups with Number(costCenterX) work reliably
    if (cc && cc.number != null) map[Number(cc.number)] = cc.label || '';
  }
  return map;
}

function signedEur(type, cents) {
  if (cents == null || cents === '') return '';
  const sign = (type === 'expense') ? -1 : 1;
  return sign * (Number(cents) / 100);
}
function safeJson_(v) {
  try {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return JSON.stringify(v);
  } catch (e) {
    return '';
  }
}
function autoResize_(sheet, cols) {
  for (let c = 1; c <= cols; c++) sheet.autoResizeColumn(c);
}