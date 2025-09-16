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

  // Read answers (types come from the Form)
  const belegtyp      = get('Belegtyp');                 // text
  const isExpense     = belegtyp === 'Ausgabe';
  const creditorManual   = get('Kreditor (Eingabe)') || '';
  const [creditorDropdownNumber, creditorDropdownName] = (get('Kreditor (Liste)') || '').split('–').map(s => s.trim());
  const creditorName = creditorManual || creditorDropdownName;
  const creditorNumber = creditorManual ? 700014 : parseInt(creditorDropdownNumber, 10) || null;
  const debitorNumber = 100511;
  const debitorName       = get('Sender');                   // text
  const belegnummer   = get('Belegnummer');              // text/short answer
  const beschreibung  = get('Beschreibung');             // paragraph
  const posAmount     = Math.round(get('Betrag in Euro') * 100);    // number
  const belegdatum    = toISODate_(get('Ausstellungsdatum Beleg')); // Date -> "yyyy-MM-dd"
  const faelligkeit   = toISODate_(get('Fälligkeitsdatum Beleg'));  // Date -> "yyyy-MM-dd"
  const headerAccount = isExpense ? creditorNumber : debitorNumber; //Hardcoded Sammelaccounts für Ausgabe bzw. Einnahme
  const costCenter2   = parseInt((get('Bereich') || '').split('–')[0], 10) || null;
  const tags          = [((get('Bereich') || '').split('–')[1] || '').trim()].filter(Boolean); //splits off number, trims whitespace and filters empty string

  // === API-Endpoint auswählen ===
  const urlBase = `https://cloud.campai.com/api/${ORG_ID}/${MANDATE_ID}`;
  const url     = belegtyp === 'Ausgabe'
    ? `${urlBase}/receipts/expense`
    : `${urlBase}/receipts/revenue`;

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
    tags: tags
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