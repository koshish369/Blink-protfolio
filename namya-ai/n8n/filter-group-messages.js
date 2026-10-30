// n8n Code node: keep only WhatsApp group messages from WAHA and reshape them
// for the Namya Memory sheet. Everything else (private chats, status, other
// events) is dropped.
const out = [];
for (const item of $input.all()) {
  const body = item.json.body || item.json;
  if (body.event !== 'message.any' && body.event !== 'message') continue;
  const p = body.payload || {};
  const chat = p.fromMe ? (p.to || '') : (p.from || '');
  if (!chat.endsWith('@g.us')) continue;
  const name = (p._data && p._data.notifyName) || '';
  out.push({
    json: {
      time: p.timestamp || Math.floor(Date.now() / 1000),
      groupId: chat,
      sender: p.fromMe ? 'Namya' : (name || p.participant || p.author || ''),
      text: p.body || '',
      hasFile: !!p.hasMedia,
    },
  });
}
return out;
