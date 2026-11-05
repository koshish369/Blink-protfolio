// Keep only WhatsApp group messages from WAHA and reshape them for Namya.
// Everything else (private chats, status, other events) is dropped.
const out = [];
for (const item of $input.all()) {
  const { body, ...settings } = item.json;
  const b = body || {};
  if (b.event !== 'message.any' && b.event !== 'message') continue;
  const p = b.payload || {};
  const chat = p.fromMe ? (p.to || '') : (p.from || '');
  if (!chat.endsWith('@g.us')) continue;
  const name = (p._data && p._data.notifyName) || '';
  out.push({
    json: {
      ...settings,
      time: p.timestamp || Math.floor(Date.now() / 1000),
      groupId: chat,
      sender: p.fromMe ? 'Namya' : (name || p.participant || p.author || ''),
      text: p.body || '',
      hasFile: !!p.hasMedia,
      fromMe: !!p.fromMe,
    },
  });
}
return out;
