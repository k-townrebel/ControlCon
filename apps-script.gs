const SHEET_ID = '1syynV08TebZplVvWkEPbNlOAz43XpaC4xZo6_IYMrbQ';

function doPost(e) {
  const now = new Date().toISOString();
  let sheetName = 'Waitlist';
  let timestamp = now;
  let data = {};

  if (e && e.parameter && Object.keys(e.parameter).length) {
    sheetName = e.parameter.sheet || sheetName;
    timestamp = e.parameter.timestamp || timestamp;
    data = Object.assign({}, e.parameter);
    delete data.sheet;
    delete data.timestamp;
  } else if (e && e.postData && e.postData.contents) {
    let payload = {};
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (error) {
      payload = {};
    }
    sheetName = payload.sheet || sheetName;
    timestamp = payload.timestamp || timestamp;
    if (payload.data && typeof payload.data === 'object') {
      data = payload.data;
    } else {
      data = Object.assign({}, payload);
      delete data.sheet;
      delete data.timestamp;
    }
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  const rowData = Object.assign({}, data, { timestamp });
  const keys = Object.keys(rowData);

  let headers = [];
  if (sheet.getLastRow() >= 1) {
    const lastColumn = Math.max(sheet.getLastColumn(), 1);
    headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].filter(Boolean);
  }

  let changed = false;
  keys.forEach((key) => {
    if (!headers.includes(key)) {
      headers.push(key);
      changed = true;
    }
  });

  if (headers.length === 0) {
    headers = keys;
    changed = true;
  }

  if (changed) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  const row = headers.map((key) => rowData[key] || '');
  sheet.appendRow(row);

  return ContentService.createTextOutput('ok');
}
