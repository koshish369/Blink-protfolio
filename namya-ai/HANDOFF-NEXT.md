# Namya AI: current state and next steps (for Claude on the Mac mini)

Owner: Sanket Koirala (Dubbo, Australia). Not a coder: do the work yourself, explain in one or two plain lines, ask before spending money. Sunil (Biratnagar) only handles physical things (the Namya phone, power).

Design: `docs/specs/2026-10-21-phase1-design.md`. Phase 1 = WhatsApp bot that reads client groups, remembers per group, drafts replies privately for a human to approve. It never posts in client groups.

## Running on this Mac mini (M2, 8 GB, macOS Tahoe)

- Docker Desktop. Files in `~/namya` (`docker-compose.yml`, private `.env`). Created by `setup/install.sh`; settings by `setup/namya-settings.sh`.
- WAHA (WhatsApp link) at `localhost:3000`, image `devlikeapro/waha:arm`, engine WEBJS, session name `001`, WORKING, linked to the Namya number (+977 9744921657, profile "Blink Media Assistant").
- n8n at `localhost:5678`, workflow **Namya** (10 nodes, from `n8n/namya-workflow.json`) is Published. Settings come from env vars in `~/namya/.env` (NAMYA_SHEET_URL, NAMYA_KEY, NAMYA_SUNIL_NUMBER, NAMYA_WAHA_SESSION=001, NAMYA_TEST_MODE=true, ANTHROPIC_API_KEY, WAHA_API_KEY). Never print these values.
- WAHA sends `message.any` to `http://n8n:5678/webhook/waha`.
- Google Sheet "Namya Memory" (owned by koshish.enterprise369@gmail.com), tabs Groups, Messages, Group Notes, To do, Prices. Apps Script web app (`sheets/namya-memory.gs`, key-protected by Script Property NAMYA_KEY) saves messages (POST) and returns group memory (GET).
- Test group "Namya Test" (Sanket, Sunil, Namya number) id `120363411751448668@g.us`.

## Verified working

- Group messages are saved to the Messages tab (seen 31 Oct).

## Not yet verified

- The draft path end to end: rule check, sheet GET, Claude Haiku (`claude-haiku-5-5`, effort low), WhatsApp send via WAHA `/api/sendText`. First live test still pending. Check n8n Executions for the first run.

## Next steps, in order

1. **Drafts go to Sanket for now, not Sunil.** Set NAMYA_SUNIL_NUMBER in `~/namya/.env` to Sanket's WhatsApp number (ask him), then `cd ~/namya && docker compose up -d`. Note the settings script only accepts numbers starting 977; edit `.env` directly if his number is Australian (61...).
2. Run the live test: Sanket sends a question and a money question in Namya Test; expect a draft and a "Needs you" alert on his WhatsApp. Debug with n8n Executions (`localhost:5678`) and `docker compose logs`.
3. Fill the Prices tab with Sanket's packages (he will dictate them).
4. Morning briefing for the team at 8:00 Nepal time, and the weekly report for Sanket (design sections 4.7 and 4.8).
5. Later: hand over to Sunil (set his number 9779826307594), add 2-3 real client groups, then phone calls (AI voice), calendar, email, social media.
