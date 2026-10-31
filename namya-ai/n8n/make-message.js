// Turn Claude's answer into a private WhatsApp message for Sunil.
// Anything unclear, or any AI error, becomes a "Needs you" alert.
const originals = $('Build prompt').all();
const out = [];
$input.all().forEach((item, i) => {
  const m = originals[i].json;
  const num = String(m.sunilNumber || '').replace(/\D/g, '');
  if (!/^\d{8,15}$/.test(num)) throw new Error('Set sunilNumber in the Settings box first');
  const resp = item.json || {};
  const text = Array.isArray(resp.content)
    ? resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
    : '';
  let r = null;
  try { r = JSON.parse((text.match(/\{[\s\S]*\}/) || [''])[0]); } catch (e) { r = null; }
  if (!r || resp.stop_reason === 'refusal' || !['draft', 'needs_human', 'no_reply'].includes(r.action)) {
    r = { action: 'needs_human', reason: 'Namya could not draft this one (AI error), please check.', reply: '' };
  }
  if (m.danger && r.action !== 'needs_human') {
    r = { action: 'needs_human', reason: r.reason || 'Money, complaint or contract topic.', reply: '' };
  }
  if (r.action === 'draft' && !String(r.reply || '').trim()) {
    r = { action: 'needs_human', reason: 'Namya had no safe reply.', reply: '' };
  }
  if (r.action === 'no_reply') return;
  const said = String(m.text || '(file)').slice(0, 500);
  const head = `*${m.groupName}*\nFrom ${m.sender}: "${said}"`;
  const message = r.action === 'draft'
    ? `📝 Draft reply for ${head}\n\nSuggested reply:\n${r.reply}\n\n(Copy it into the group if it is OK, or edit it first.)`
    : `⚠️ Needs you: ${head}\n\nWhy: ${r.reason}\n\nNamya has not drafted a reply.`;
  out.push({ json: { wahaUrl: m.wahaUrl, session: m.wahaSession, chatId: `${num}@c.us`, message } });
});
return out;
