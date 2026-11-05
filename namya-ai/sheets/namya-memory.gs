/**
 * Namya Memory: the sheet side of Namya.
 * Paste into Extensions > Apps Script, then Deploy as a Web app.
 *
 * Security: set a Script Property called NAMYA_KEY (Project Settings >
 * Script Properties). Every request from n8n must send the same key.
 *
 * POST (save a message), JSON body:
 *   {"key": "...", "time": 1761830000, "groupId": "1203...@g.us",
 *    "sender": "Ram", "text": "Is my video ready?", "hasFile": false}
 *
 * GET (read a group's memory): ?key=...&groupId=1203...@g.us
 *   returns {ok, groupName, project, region, notes, recent: [...], prices: [...]}
 */

var RECENT_LIMIT = 15;

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  if (!keyOk_(data.key)) return json_({ ok: false, error: 'bad key' });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var groupId = String(data.groupId || '');
    var group = findOrAddGroup_(ss, groupId);
    var when = data.time ? new Date(Number(data.time) * 1000) : new Date();
    ss.getSheetByName('Messages').appendRow([
      when,
      safe_(groupId),
      safe_(group.name),
      safe_(data.sender),
      safe_(data.text),
      data.hasFile ? 'yes' : 'no'
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (!keyOk_(p.key)) return json_({ ok: false, error: 'bad key' });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var groupId = String(p.groupId || '');
  var group = findGroup_(ss, groupId) || { name: '', project: '', region: '' };
  return json_({
    ok: true,
    groupName: group.name,
    project: group.project,
    region: group.region,
    notes: findNotes_(ss, groupId),
    recent: recentMessages_(ss, groupId, RECENT_LIMIT),
    prices: prices_(ss)
  });
}

function keyOk_(key) {
  var expected = PropertiesService.getScriptProperties().getProperty('NAMYA_KEY');
  return !!expected && String(key || '') === expected;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function findGroup_(ss, groupId) {
  if (!groupId) return null;
  var sheet = ss.getSheetByName('Groups');
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var rows = sheet.getRange(2, 1, last - 1, 4).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === groupId) {
      return { name: String(rows[i][1] || ''), project: String(rows[i][2] || ''),
               region: String(rows[i][3] || '') };
    }
  }
  return null;
}

// Returns the group's details, adding it to the Groups tab (status "new")
// the first time it is seen.
function findOrAddGroup_(ss, groupId) {
  var found = findGroup_(ss, groupId);
  if (found || !groupId) return found || { name: '', project: '', region: '' };
  ss.getSheetByName('Groups').appendRow([groupId, '', '', '', 'new']);
  return { name: '', project: '', region: '' };
}

function findNotes_(ss, groupId) {
  var sheet = ss.getSheetByName('Group Notes');
  var last = sheet.getLastRow();
  if (last < 2 || !groupId) return '';
  var rows = sheet.getRange(2, 1, last - 1, 2).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === groupId) return String(rows[i][1] || '');
  }
  return '';
}

// Last `limit` messages for this group, oldest first. Looks at the newest
// 1000 rows only, so it stays fast as the sheet grows.
function recentMessages_(ss, groupId, limit) {
  var sheet = ss.getSheetByName('Messages');
  var last = sheet.getLastRow();
  if (last < 2 || !groupId) return [];
  var start = Math.max(2, last - 999);
  var rows = sheet.getRange(start, 1, last - start + 1, 6).getValues();
  var out = [];
  for (var i = rows.length - 1; i >= 0 && out.length < limit; i--) {
    if (String(rows[i][1]) === groupId) {
      out.push({ time: rows[i][0], sender: String(rows[i][3]), text: String(rows[i][4]) });
    }
  }
  return out.reverse();
}

function prices_(ss) {
  var sheet = ss.getSheetByName('Prices');
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, 4).getValues()
    .filter(function (r) { return String(r[0]).trim() !== ''; })
    .map(function (r) {
      return { package: String(r[0]), includes: String(r[1]), priceNpr: String(r[2]), notes: String(r[3]) };
    });
}

// Stops message text that starts with = + - @ from running as a formula.
function safe_(value) {
  var s = value === undefined || value === null ? '' : String(value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
