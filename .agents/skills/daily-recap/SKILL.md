---
name: daily-recap
description: Use when sending the daily recap newsletter to parents at Explore the Clubhouse — finds all parents with bookings in the same week and sends the drafted newsletter via the send-daily-recap.ts script
---

# Daily Recap Newsletter

Sends a pre-drafted newsletter recap to all parents who have a child booked for the **same week** as the recap date — including parents who booked a single day on a different day that week.

## Workflow

1. **Ask for the recap date** if not provided (default: today, YYYY-MM-DD)
2. **Ask for the newsletter subject** — must match exactly as saved in the database
3. **Run check mode** to preview the recipient list
4. **Confirm with the user** before sending
5. **Run send mode** — marks the newsletter as sent in the database

## Commands

```bash
# Preview recipients (always run first)
npx tsx scripts/send-daily-recap.ts check [date]

# Send (after user confirms the recipient list looks right)
npx tsx scripts/send-daily-recap.ts send [date]
```

Both commands prompt interactively for the newsletter subject.

## Week logic

The script automatically calculates Monday–Friday for the week containing the given date. A parent is included if they have **any** paid or complete booking day in that window — regardless of whether they booked the full week or a single day.

## Notes

- The newsletter must already be saved as a draft in the admin dashboard before running
- After a successful send the newsletter status is updated to `sent` in the database
- Run from the project root: `/Volumes/DevSSD/Projects/explore-the-clubhouse`
