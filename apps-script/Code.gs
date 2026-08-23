/**
 * RPromo — Google Apps Script backend (Sheets + Drive)
 * ----------------------------------------------------
 * Single Web App that the Angular front-end talks to. It reads/writes the
 * "People" sheet and stores photos in a Drive folder. No server, no secrets
 * in the front-end.
 *
 * Deploy: Extensions > Apps Script, paste this file, fill CONFIG below, then
 * Deploy > New deployment > Web app > Execute as "Me", Access "Anyone".
 * Copy the /exec URL into the Angular environment (webAppUrl).
 *
 * The front-end POSTs with Content-Type text/plain to avoid the CORS preflight
 * that Apps Script handles poorly; the body is still JSON.
 */

// ============================ CONFIG ============================
// Fill these in. SHEET_ID is in the spreadsheet URL between /d/ and /edit.
// DRIVE_FOLDER_ID is in the folder URL after /folders/.
const CONFIG = {
  SHEET_ID: 'PUT_YOUR_SHEET_ID_HERE',
  SHEET_NAME: 'People',
  DRIVE_FOLDER_ID: 'PUT_YOUR_DRIVE_FOLDER_ID_HERE',
};

// Canonical column order. Must match the Person model in the front-end.
const HEADERS = [
  'id', 'createdAt', 'updatedAt', 'status', 'doNotCall', 'doNotCallReason',
  'fullName', 'cpf', 'rg', 'issuingAgency', 'issueDate', 'birthDate', 'sex',
  'raceColor', 'birthplace', 'fatherName', 'motherName', 'email', 'phone',
  'street', 'neighborhood', 'city', 'region', 'zipCode',
  'voterId', 'voterZone', 'voterSection', 'workCard', 'workCardIssueDate',
  'pis', 'militaryCert',
  'accountType', 'bankAgency', 'accountNumber', 'bank', 'pixKey',
  'hasChildren', 'childrenCount', 'children',
  'photoUrl',
];

// ============================ ROUTES ============================

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'list';
    if (action === 'list') {
      return jsonOut_({ ok: true, data: listPeople_() });
    }
    return jsonOut_({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action;

    switch (action) {
      case 'create':
        return jsonOut_({ ok: true, data: createPerson_(body.person) });
      case 'update':
        return jsonOut_({ ok: true, data: updatePerson_(body.id, body.person) });
      case 'setStatus':
        return jsonOut_({ ok: true, data: patchPerson_(body.id, { status: body.status }) });
      case 'setDoNotCall':
        return jsonOut_({ ok: true, data: patchPerson_(body.id, {
          doNotCall: !!body.value,
          doNotCallReason: body.value ? (body.reason || '') : '',
        }) });
      case 'uploadPhoto':
        return jsonOut_({ ok: true, data: uploadPhoto_(body) });
      default:
        return jsonOut_({ ok: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

// ============================ PEOPLE ============================

function listPeople_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  return values.slice(1)
    .filter(row => row[0]) // must have an id
    .map(row => rowToPerson_(row, headers));
}

function createPerson_(person) {
  const sheet = getSheet_();
  const now = new Date().toISOString();
  const record = Object.assign({}, person, {
    id: Utilities.getUuid(),
    createdAt: now,
    updatedAt: now,
    status: person.status || 'active',
    doNotCall: person.doNotCall === true,
    doNotCallReason: person.doNotCallReason || '',
  });
  sheet.appendRow(personToRow_(record));
  return record;
}

function updatePerson_(id, person) {
  const found = findRow_(id);
  if (!found) throw new Error('Person not found: ' + id);

  const record = Object.assign({}, found.person, person, {
    id: found.person.id,
    createdAt: found.person.createdAt,
    updatedAt: new Date().toISOString(),
  });
  writeRow_(found.rowIndex, record);
  return record;
}

function patchPerson_(id, patch) {
  const found = findRow_(id);
  if (!found) throw new Error('Person not found: ' + id);

  const record = Object.assign({}, found.person, patch, {
    updatedAt: new Date().toISOString(),
  });
  writeRow_(found.rowIndex, record);
  return record;
}

// ============================ DRIVE ============================

function uploadPhoto_(payload) {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const bytes = Utilities.base64Decode(payload.base64);
  const blob = Utilities.newBlob(bytes, payload.mimeType || 'image/jpeg', payload.filename || 'photo.jpg');
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return {
    fileId: file.getId(),
    url: 'https://drive.google.com/uc?export=view&id=' + file.getId(),
  };
}

// ============================ HELPERS ============================

function getSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);

  // Ensure the header row exists and matches the canonical schema.
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow.join('') === '') {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow_(id) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
      return { rowIndex: i + 1, person: rowToPerson_(values[i], headers) };
    }
  }
  return null;
}

function writeRow_(rowIndex, person) {
  getSheet_().getRange(rowIndex, 1, 1, HEADERS.length).setValues([personToRow_(person)]);
}

/** Person object -> flat row, in HEADERS order. */
function personToRow_(person) {
  return HEADERS.map(key => {
    const value = person[key];
    if (value === undefined || value === null) return '';
    if (key === 'children') return JSON.stringify(value || []);
    return value;
  });
}

/** Flat row -> Person object, parsing types. */
function rowToPerson_(row, headers) {
  const person = {};
  headers.forEach((key, i) => {
    let value = row[i];
    if (key === 'children') {
      try { value = value ? JSON.parse(value) : []; } catch (e) { value = []; }
    } else if (key === 'doNotCall' || key === 'hasChildren') {
      value = value === true || value === 'TRUE' || value === 'true';
    } else if (key === 'childrenCount') {
      value = Number(value) || 0;
    } else if (value === null || value === undefined) {
      value = '';
    } else {
      value = String(value);
    }
    person[key] = value;
  });
  return person;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
