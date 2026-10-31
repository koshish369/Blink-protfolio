// ===== Namya settings: edit the values in quotes, then save =====
const SETTINGS = {
  sheetUrl: 'PASTE_SHEET_SCRIPT_URL_HERE', // Apps Script web app URL (ends in /exec)
  sheetKey: 'PASTE_NAMYA_KEY_HERE',        // same text as NAMYA_KEY in the sheet script
  sunilNumber: 'PASTE_SUNIL_NUMBER_HERE',  // e.g. 9779812345678 (977 + number, no + or spaces)
  wahaSession: '001',                      // session name shown in the WAHA dashboard
  testMode: true,                          // true: team messages also get drafts (for testing)
  team: ['Sunil', 'Sanket'],               // Blink staff names; no drafts for them when testMode is false
};
// ================================================================
return $input.all().map((item) => ({
  json: { ...SETTINGS, wahaUrl: 'http://waha:3000', body: item.json.body || item.json },
}));
