# Namya AI: Phase 1 Design

Date: 2026-10-21
Owner: Sanket Koirala (Blink Media Tech, Biratnagar)
Status: Draft, waiting for Sanket's review

## 1. What Namya AI is

Namya AI is Blink Media's AI receptionist. It lives in WhatsApp, reads client
groups, remembers each group separately, and helps the team answer clients.

- First and only user for now: Blink Media.
- Later: copy the same system to other offices. Not part of Phase 1.
- Sanket is not a coder. Every setup step is guided one click at a time.
- Never spend money on paid AI tools without asking Sanket first.

## 2. What we learned (answers to the open questions)

| Topic | Answer |
|---|---|
| Daily tasks | All 11: repeat questions, collecting client details, booking, reminders, lead follow-ups, project status, feedback, files, daily summaries, drafting emails and quotes, routing problems |
| Critical tasks | Shoot dates (team must know the full day before it starts), files (never forget, never send to the wrong group), lead follow-ups |
| Safe tasks | Standard package prices, deadlines, feedback collection |
| Follow-up tone | Firmer for Asia, Africa, North America. Softer for Australia and Europe |
| Who gets handoffs | Sunil, for everything at Blink |
| Sanket's role | Board-style reports only (summaries, numbers, problems), no daily alerts |
| Where work comes from | WhatsApp groups 50%, WhatsApp direct chats 20%, phone 20%, email 10% |
| Walk-ins | Separate future project (physical robot receptionist). Out of scope |
| Social media | Later phase (content, posting, replies) |
| Office tools | Files sent on WhatsApp, accounts in Excel, team chat on WhatsApp, no calendar or client list yet |
| Time | About 5 hours a week. Sanket guides, Sunil helps in Biratnagar |
| Company number | On the WhatsApp Business app, groups already exist |

Rules that never change: money (payments, discounts, refunds), custom prices,
complaints, angry clients, legal or contract promises, and anything physical
always go to a human. When unsure, Namya says "let me check with the team"
and alerts Sunil. It never guesses.

## 3. The WhatsApp decision

Facts checked on 2026-10-21 (from Meta partner documentation; recheck before Phase 2):

- The official WhatsApp Cloud API cannot read groups that already exist on the
  Business app. "Coexistence" (app plus API on one number) mirrors 1:1 chats
  only, not groups.
- The official Groups API only works on groups created through the API,
  reportedly needs an Official Business Account, and reportedly caps groups at
  8 members.
- Linking the company number to an unofficial WhatsApp Web style tool risks a
  ban on the number clients know.

**Decision: Namya gets its own spare number.**

1. Buy a cheap spare SIM. Install WhatsApp Business on it, named
   "Namya, Blink Media Assistant".
2. Sunil adds this number to 2-3 real client groups, like a new staff member.
3. Namya connects through WAHA (a free tool that links like WhatsApp Web).
4. In Phase 1 Namya **never posts in client groups**. It only sends private
   messages to Sunil (drafts, alerts, briefing).
5. If WhatsApp bans the spare number, Blink loses a test SIM, not the company
   number.

The long-term connection (official API or not) is decided in Phase 2, after
Phase 1 proves the idea.

## 4. What Phase 1 does

1. **Listens.** Saves every message from the test groups to Google Sheets.
   This is each group's memory.
2. **Filters.** Uses simple rules, with no AI, to decide whether a message
   needs a reply (a question, Blink Media mentioned, a file, a date, a price).
   Everything else is only saved. This keeps AI costs low.
3. **Drafts.** For messages that need a reply, the AI reads the group's
   memory and recent chat, then writes a draft in the client's language
   (Nepali, English, Hindi or Romanised Nepali).
4. **Sends the draft to Sunil privately**, with the group name and the
   message it answers. Sunil copies it into the group if it is good.
5. **Flags danger topics.** Money, complaints, contracts or anything unclear
   go to Sunil as "Needs you" alerts, with no draft.
6. **Tracks promises.** Pending files, change requests, shoot dates and
   deadlines go into a "To do" tab per group.
7. **Morning briefing at 8:00 Nepal time** to Sunil: today's shoots, pending
   files, open feedback, overdue items.
8. **Weekly report to Sanket** (board style): messages handled, drafts used,
   open problems, AI cost.

Not in Phase 1: posting automatically, direct chats, calendar, email,
voice, phone calls, social media, other offices.

## 5. How it fits together

```
Client group (WhatsApp)
   |  Namya's spare number is a member
   v
WAHA (on Mac mini)  -->  n8n (on Mac mini)
                           |  1. save message to Google Sheets
                           |  2. rules: reply needed?
                           |  3. if yes: Claude AI drafts reply
                           v
                 Private WhatsApp message to Sunil
```

| Part | Tool | Where it runs | Cost |
|---|---|---|---|
| WhatsApp link | WAHA Core (free) | Mac mini, Dubbo | $0 |
| Automation | n8n (free, self-hosted) | Mac mini, Dubbo | $0 |
| Memory | Google Sheets | Google account | $0 |
| AI, routine | Claude Haiku 5.5 | Anthropic API | about $0.10 per million input tokens |
| AI, hard questions | Claude Sonnet 5.5 | Anthropic API | used rarely |
| Spare SIM | Nepal or Australia | Phone | about $2 once |

Expected monthly cost: **about USD 3-6**, almost all of it AI. Sanket approves
before any credit is added to the Anthropic account.

The Mac mini (8 GB) stays on and online all the time. Docker runs WAHA and n8n.

## 6. Memory layout (Google Sheets)

One spreadsheet, "Namya Memory":

- **Groups** tab: group ID, client name, project, region (for follow-up tone),
  status.
- **Messages** tab: time, group, sender, text, has file (yes or no).
- **Group Notes** tab: one row per group, a short running summary updated by
  the AI (who the client is, what was promised, decisions).
- **To do** tab: group, item (file, change request, shoot, deadline), due
  date, status.
- **Prices** tab: standard packages the AI may quote. Sunil keeps this
  correct.

## 7. When things go wrong

- AI or internet fails: the message is still saved; Sunil gets "Namya could
  not draft a reply, please check group X".
- WhatsApp link drops: n8n checks every 15 minutes and alerts Sanket and
  Sunil from a backup (email) if WAHA is offline.
- AI unsure: no draft, a "Needs you" alert instead.
- Spending: a daily AI-cost cell in Sheets; alert if it passes USD 1 a day.

## 8. How we test it

1. One test group with only the team (Sanket, Sunil, the Namya number).
   Team members act as clients in all four languages.
2. Check that messages are saved, filtered, drafted, and that danger topics
   produce alerts and no draft.
3. Then add 2-3 real client groups for two weeks.
4. Phase 1 is done when Sunil uses most drafts with small or no edits, the
   morning briefing is correct, and nothing important is missed.

## 9. Rough timeline (5 hours a week)

- Week 1: spare SIM, Docker, WAHA, n8n on the Mac mini, Google Sheet created.
- Week 2: saving messages, filter rules, AI drafts to Sunil.
- Week 3: To do tracking, morning briefing, weekly report, team test group.
- Week 4: real client groups, fixes.

## 10. Later phases (not designed yet)

- Phase 2: decide the long-term WhatsApp link; Namya posts approved replies
  itself; direct chats.
- Phase 3: Google Calendar for shoots, Gmail drafts.
- Phase 4: voice notes in and out, phone receptionist.
- Phase 5: social media (Notion content calendar, captions, scheduled posts).
- Later: package Namya for other offices.
