# Omundi NGO Portal Playwright Framework v3.4.0

Playwright + TypeScript framework for the Omundi NGO Portal.

## Install

```powershell
npm install
npm run install:browsers
Copy-Item .env.example .env
```

## One-time account setup

```powershell
npm run account:setup
```

Account setup performs signup, uploads both required PDFs, submits Create Account automatically, opens Login, waits the configured Admin approval period (90 seconds by default), then verifies Login.

## Seed commands

Create only one Fund:

```powershell
npm run fund:seed
```

Alias also supported:

```powershell
npm run funds:seed
```

Create only one active Campaign:

```powershell
npm run campaign:seed
```

Alias:

```powershell
npm run campaigns:seed
```

Create only one Voucher using a currently available active Campaign:

```powershell
npm run voucher:seed
```

Alias:

```powershell
npm run vouchers:seed
```

Run all seed prerequisites in business order:

```powershell
npm run seed:all
```

Order:

```text
Bank Details -> Fund -> Campaign -> Voucher
```

## Real happy path

```powershell
npm run test:happy-path
```

Business flow:

```text
Login
-> Bank Details
-> Add Fund
-> Confirm Fund Deposit
-> Create/Launch Campaign
-> Generate Voucher
-> Region criterion
-> Irrigation Type criterion
-> Primary Crop criterion
-> verify backend API payload
```

## Boundary tests

```powershell
npm run test:campaign-boundary
npm run test:funds-boundary
npm run test:vouchers-boundary
npm run test:login-boundary
npm run test:boundary
```

`npm run test:boundary` intentionally does NOT include the internal demo file.

## Internal demo: exactly 3 pass + 2 intentional fail

```powershell
npm run demo:boundary
```

This command is designed for internal presentation only.

Expected result:

```text
3 passed
2 failed
```

The two failures are deliberately synthetic. They are clearly labelled `DEMO EXPECTED FAILURE`; do not report them as real Omundi defects.

Each failing demo case explicitly saves a screenshot and Playwright also keeps failure screenshot/video/trace according to `playwright.config.ts`.

Open report:

```powershell
npm run report
```

Typical artifacts:

```text
test-results/<test-folder>/
  test-failed-1.png
  demo-*-before-failure.png
  video.webm
  trace.zip
  error-context.md
```

## Edge tests

```powershell
npm run test:edge
```

Known reviewed edge cases that were intentionally excluded/skipped remain documented in their existing edge spec files so the normal edge run is not forced red by already-known items.

## Full normal framework run

```powershell
npm run test:all
```

The internal `demo:boundary` command is never included in `test:all`.

## Debugging

```powershell
npm run test:debug
npm run report
npx playwright show-trace test-results\<test-folder>\trace.zip
```

## Important data locations

- `config/test-data.ts` - account, OTP, Bank, Fund, Campaign, Voucher and boundary data.
- `.env` - environment settings such as `BASE_URL` and `HEADLESS`.
- `state/account-state.json` - local account created/approved state.

---

## Automatic Google Sheet bug logging

This build keeps the existing framework and adds automatic Google Sheet logging for unexpected Playwright failures.

### What happens on a failed test

A failed/timed-out test is still handled normally by Playwright. The custom reporter then sends a defect-candidate row to Google Sheets containing:

- Bug ID
- Module
- Issue title
- Description
- Expected result
- Actual Playwright error
- Priority
- QA status
- Environment URL
- Test file and test name
- Browser/project
- Screenshot path
- Video path
- Trace path
- Run timestamp
- Notes

Google Sheet logging is **non-blocking**. If the Sheet endpoint is unavailable, it prints a warning but does not change the Playwright pass/fail result.

### One-time Google Sheet setup

1. Create or open a Google Sheet.
2. Open **Extensions -> Apps Script**.
3. Replace `Code.gs` with the complete contents of `scripts/google-sheet-webhook.gs` from this framework.
4. In that Apps Script file, change:

   `const SHARED_SECRET = 'change-me-before-deploying';`

   to a private value.
5. Select **Deploy -> New deployment -> Web app**.
6. Set **Execute as: Me**.
7. Set **Who has access: Anyone**.
8. Deploy and copy the Web App URL.
9. In the framework `.env`, add:

   `BUG_SHEET_ENABLED=true`

   `BUG_SHEET_WEBHOOK_URL=<your deployed Web App URL>`

   `BUG_SHEET_SECRET=<the same secret used in Apps Script>`

The first request automatically creates a tab named **Automation Bugs** and creates the header row.

### Demo command: 3 pass + 2 fail

Run:

`npm run demo:boundary`

The existing demo file intentionally produces:

- 3 passing boundary checks
- 2 immediate synthetic failures

The two failures generate Playwright evidence and, when the Google Sheet Web App is configured, create two rows in **Automation Bugs**.

The rows are clearly marked as demo-only and are not treated as confirmed Omundi defects.

### Clear every logged issue

Run:

`npm run bugs:clear`

This removes every logged data row in **Automation Bugs**, keeps/recreates the header row, and resets the next generated ID to `BUG-001`.

### Existing commands are unchanged

All existing seed, happy-path, sanity, boundary and edge commands from v3.4.2 remain available. The normal boundary runner does not include `demo:boundary`; the two synthetic failures run only when you explicitly execute `npm run demo:boundary`.
