// Namya settings. Values come from the Mac mini's ~/namya/.env file,
// filled in by setup/namya-settings.sh, so nothing needs editing here.
let env = {};
try { env = $env || {}; } catch (e) { env = {}; }
const SETTINGS = {
  sheetUrl: env.NAMYA_SHEET_URL || '',
  sheetKey: env.NAMYA_KEY || '',
  sunilNumber: env.NAMYA_SUNIL_NUMBER || '',
  wahaSession: env.NAMYA_WAHA_SESSION || '001',
  testMode: String(env.NAMYA_TEST_MODE || 'true') === 'true', // true: team messages also get drafts
  team: String(env.NAMYA_TEAM || 'Sunil,Sanket').split(',').map((s) => s.trim()).filter(Boolean),
};
if (!SETTINGS.sheetUrl || !SETTINGS.sheetKey) {
  throw new Error('Namya settings missing: run namya-settings.sh on the Mac mini');
}
return $input.all().map((item) => ({
  json: { ...SETTINGS, wahaUrl: 'http://waha:3000', body: item.json.body || item.json },
}));
