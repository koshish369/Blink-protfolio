/**
 * Namya Memory: receives group messages from n8n and saves them in this sheet.
 * Paste into Extensions > Apps Script, then Deploy > New deployment > Web app.
 *
 * Each POST body is JSON like:
 * {"time": 1761830000, "groupId": "1203...@g.us", "sender": "Ram",
 *  "text": "Is my video ready?", "hasFile": false}
 */

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var groupId = String(data.groupId || '');
    var groupName = findOrAddGroup_(ss, groupId);
    var when = data.time ? new Date(Number(data.time) * 1000) : new Date();
    ss.getSheetByName('Messages').appendRow([
      when,
      safe_(groupId),
      safe_(groupName),
      safe_(data.sender),
      safe_(data.text),
      data.hasFile ? 'yes' : 'no'
    ]);
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Returns the client name for a group, adding the group to the Groups tab
// (status "new") the first time it is seen.
function findOrAddGroup_(ss, groupId) {
  if (!groupId) return '';
  var sheet = ss.getSheetByName('Groups');
  var last = sheet.getLastRow();
  if (last >= 2) {
    var rows = sheet.getRange(2, 1, last - 1, 2).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === groupId) return String(rows[i][1] || '');
    }
  }
  sheet.appendRow([groupId, '', '', '', 'new']);
  return '';
}

// Stops message text that starts with = + - @ from running as a formula.
function safe_(value) {
  var s = value === undefined || value === null ? '' : String(value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
