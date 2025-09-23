function fillCreditorDropdown() {
  const p = PropertiesService.getScriptProperties();
  const API_KEY = p.getProperty('CAMPAI_API_KEY');
  const ORG_ID  = p.getProperty('ORG_ID');
  const MANDATE_ID = p.getProperty('MANDATE_ID');
  const FORM_ID = p.getProperty('FORM_ID')

  const form = FormApp.openById(FORM_ID);
  const item = form.getItems(FormApp.ItemType.LIST)
                   .find(i => i.getTitle() === 'Kreditor (Liste)')
                   .asListItem();

  const url = `https://cloud.campai.com/api/${ORG_ID}/${MANDATE_ID}/finance/accounts/creditors/list`;
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    payload: JSON.stringify({
      sort: {
        account: 'asc'
      },
      limit: 50,
      offset: 0,
      returnCount: false
    })
  });

  const data = JSON.parse(res.getContentText());
  const rows = data.creditors || data.items || [];
  const choices = rows
    .sort((a,b)=> (a.nameSort||a.name).localeCompare(b.nameSort||b.name))
    .map(c => `${c.account} – ${c.name}`);            // Account zuerst = später leichter parsbar

  item.setChoiceValues(choices);
}

function fillCostCenterDropdown() {
  const p = PropertiesService.getScriptProperties();
  const API_KEY = p.getProperty('CAMPAI_API_KEY');
  const ORG_ID  = p.getProperty('ORG_ID');
  const MANDATE_ID = p.getProperty('MANDATE_ID');
  const FORM_ID = p.getProperty('FORM_ID')

  const form = FormApp.openById(FORM_ID);

  const url = `https://cloud.campai.com/api/organizations/${ORG_ID}/mandates/${MANDATE_ID}`;
  const res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { 'X-API-Key': API_KEY, 'Accept': 'application/json' }
  });
  
  const data = JSON.parse(res.getContentText());

  const cc = (data.costCenters || [])
    .filter(c => c.bookable)
    .sort((a,b)=> a.number - b.number)
    .map(c => `${c.number} – ${c.label}`);

  // update ALL dropdowns named "Bereich"
  form.getItems(FormApp.ItemType.LIST)
      .filter(i => i.getTitle().trim() === 'Bereich')
      .forEach(i => i.asListItem().setChoiceValues(cc));

}