// Free rule check (no AI): does this message need the team's attention?
// danger = money, complaints, contracts: Sunil gets an alert, never a draft.
const ASK = /\?|\b(price|rate|cost|charge|quote|package|ready|done|when|deadline|date|time|schedule|shoot|video|edit|reel|post|file|send|link|drive|status|update|meeting|call|blink|namya|please|plz|help|kati|kahile|kaile|kun|kasari|milcha|mildaina|pathau|pathaunu|garnu|chahiyo|kya|kab|kitna|kaise|kripya|bhejo)\b/i;
const ASK_NP = /(कति|कहिले|कसरी|कुन|मूल्य|भिडियो|पठाउ|कृपया|कब|कितना|कैसे)/;
const DANGER = /\b(pay|paid|payment|refund|discount|advance|invoice|bill|money|paisa|rupees?|npr|rs|contract|agreement|legal|lawyer|complain|complaint|angry|worst|disappointed|unhappy|cancel|delay|late|wrong|problem|issue|gunaso|bhuktani|chhut|naramro)\b/i;
const DANGER_NP = /(पैसा|भुक्तानी|छुट|रकम|सम्झौता|गुनासो|नराम्रो|ढिला|रद्द|शिकायत)/;

const out = [];
for (const item of $input.all()) {
  const m = item.json;
  if (m.fromMe) continue;
  const sender = String(m.sender || '').toLowerCase();
  const isTeam = (m.team || []).some((n) => n && sender.includes(String(n).toLowerCase()));
  if (isTeam && !m.testMode) continue;
  const text = String(m.text || '').trim();
  if (!text && !m.hasFile) continue;
  const danger = DANGER.test(text) || DANGER_NP.test(text);
  if (!(m.hasFile || danger || ASK.test(text) || ASK_NP.test(text))) continue;
  out.push({ json: { ...m, text, danger } });
}
return out;
