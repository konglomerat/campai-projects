function createExpenseReceipt(e) {
  const p = PropertiesService.getScriptProperties();
  const API_KEY    = p.getProperty('CAMPAI_API_KEY');
  const ORG_ID     = p.getProperty('ORG_ID');
  const MANDATE_ID = p.getProperty('MANDATE_ID');

  // Helper: fetch by question title
  const get = (title) =>
    e.response.getItemResponses()
      .find(ir => ir.getItem().getTitle().trim() === title)
      ?.getResponse();

  // Gather answers (types handled by the Form)
  const belegtyp      = get('Belegtyp');                 // text
  const isExpense     = belegtyp === 'Ausgabe';
  const belegnummer   = get('Belegnummer');              // text/short answer
  const beschreibung  = get('Beschreibung');             // paragraph
  const posAmount     = Math.round(get('Betrag in Euro') * 100);    // number
  const belegdatum    = toISODate_(get('Ausstellungsdatum Beleg')); // Date -> "yyyy-MM-dd"
  const faelligkeit   = toISODate_(get('Fälligkeitsdatum Beleg'));  // Date -> "yyyy-MM-dd"

  // Set Account Name + Number, if Ausgabe use creditor, else debitor
  const creditorManual   = get('Kreditor (Eingabe)') || '';
  const [creditorDropdownNumber, creditorDropdownName] = (get('Kreditor (Liste)') || '').split('–').map(s => s.trim());
  const creditorName = creditorManual || creditorDropdownName;
  const creditorNumber = creditorManual ? 700014 : parseInt(creditorDropdownNumber, 10) || null;
  const debitorNumber = 100511;
  const debitorName       = get('Sender');                   // text
  const headerAccount = isExpense ? creditorNumber : debitorNumber; //Hardcoded Sammelaccounts für Ausgabe bzw. Einnahme
  const costCenter2   = parseInt((get('Bereich') || '').split('–')[0], 10) || null;
  const tags          = [((get('Bereich') || '').split('–')[1] || '').trim()].filter(Boolean); //splits off number, trims whitespace and filters empty string

  // === Set Endpoint based on type of receipt ===
  const urlBase = `https://cloud.campai.com/api/${ORG_ID}/${MANDATE_ID}`;
  const url     = belegtyp === 'Ausgabe'
    ? `${urlBase}/receipts/expense`
    : `${urlBase}/receipts/revenue`;

  // --- get file first (so we can include fields unconditionally)
  let fileBlock = null;
  const files = getUploadFiles_(e, 'Beleg Upload');
  if (files.length) {
    const file = files[0];
    const { id } = uploadFileToCampai_(API_KEY, file);
    fileBlock = { receiptFileId: String(id), receiptFileName: file.getName() };
  }

  const payload = {
    account: headerAccount,
    receiptNumber: belegnummer,   // ✔ Campai-Format
    totalGrossAmount: posAmount,
    receiptDate: belegdatum,
    dueDate: faelligkeit,
    accountName: isExpense ? creditorName : debitorName,
    description: beschreibung,
    positions: [
      {
        account: 13700,
        amount: posAmount,
        costCenter1: 9,  // Sammelposten
        costCenter2: costCenter2,
        taxCode: null
      }
    ],
    tags: tags,
    ...(fileBlock || {}) 
  };

  // === API Call ===
  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  Logger.log(resp.getResponseCode());
  Logger.log(resp.getContentText());
  Logger.log('Payload:\n' + JSON.stringify(payload, null, 2));
}

// --- helpers (only what’s needed) ---

function toISODate_(v) {
  if (!v) return null;                    // allow empty optional dates
  const d = v instanceof Date ? v : new Date(v);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// Grab the first uploaded file from a "Beleg-Upload" File Upload item
function getUploadFiles_(e, title) {
  const ir = e.response.getItemResponses().find(r => r.getItem().getTitle().trim() === title);
  if (!ir) return [];
  const ids = [].concat(ir.getResponse() || []);
  return ids.map(id => DriveApp.getFileById(id));
}

// PUT the blob to the signed URL (S3) of campai
function uploadFileToCampai_(API_KEY, file) {
  // 1) signed URL
  const up = UrlFetchApp.fetch('https://cloud.campai.com/api/storage/uploadUrl', {
    method: 'get',
    headers: { 'X-API-Key': API_KEY, 'Accept': '*/*' },
    muteHttpExceptions: true
  });
  if (up.getResponseCode() !== 200) throw new Error('uploadUrl failed: ' + up.getContentText());
  const { id, url } = JSON.parse(up.getContentText());

  // 2) PUT blob to S3 URL
  const blob = file.getBlob();
  const put = UrlFetchApp.fetch(url, {
    method: 'put',
    contentType: blob.getContentType(),
    payload: blob.getBytes(),
    muteHttpExceptions: true
  });
  if (put.getResponseCode() < 200 || put.getResponseCode() >= 300) {
    throw new Error('File PUT failed: ' + put.getResponseCode() + ' ' + put.getContentText());
  }

  // 3) return resource id
  return { id };
}