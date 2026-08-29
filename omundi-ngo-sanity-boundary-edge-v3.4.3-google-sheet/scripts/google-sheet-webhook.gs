/**
 * OMUNDI NGO - Playwright Bug Log Web App
 *
 * Setup:
 * 1. Create/open a Google Sheet.
 * 2. Extensions -> Apps Script.
 * 3. Replace Code.gs with this file.
 * 4. Set SHARED_SECRET below. Use the same value in .env as BUG_SHEET_SECRET.
 * 5. Deploy -> New deployment -> Web app.
 * 6. Execute as: Me.
 * 7. Who has access: Anyone.
 * 8. Copy the Web App URL into .env as BUG_SHEET_WEBHOOK_URL.
 */

const SHEET_NAME = 'Automation Bugs';
const SHARED_SECRET = 'change-me-before-deploying';

const HEADERS = [
  'Bug ID',
  'Module',
  'Issue Title',
  'Description',
  'Expected',
  'Actual / Error',
  'Priority',
  'QA Status',
  'Environment URL',
  'Test File',
  'Test Name',
  'Browser',
  'Screenshot',
  'Video',
  'Trace',
  'Run At',
  'Notes'
];

function doGet() {
  return jsonResponse({
    ok: true,
    service: 'Omundi NGO Playwright Bug Logger',
    sheet: SHEET_NAME
  });
}

function doPost(e) {
  try {
    const body = JSON.parse(
      e.postData && e.postData.contents
        ? e.postData.contents
        : '{}'
    );

    if (
      SHARED_SECRET &&
      body.secret !== SHARED_SECRET
    ) {
      return jsonResponse({
        ok: false,
        error: 'Unauthorized'
      });
    }

    const sheet = getBugSheet();

    if (body.action === 'clear') {
      sheet.clearContents();
      writeHeaders(sheet);

      return jsonResponse({
        ok: true,
        action: 'clear',
        message: 'Bug log cleared and headers restored.'
      });
    }

    if (body.action !== 'append') {
      return jsonResponse({
        ok: false,
        error: 'Unsupported action'
      });
    }

    ensureHeaders(sheet);

    const bugId = nextBugId(sheet);

    sheet.appendRow([
      bugId,
      safe(body.module),
      safe(body.issueTitle),
      safe(body.description),
      safe(body.expected),
      safe(body.actual),
      safe(body.priority),
      safe(body.qaStatus),
      safe(body.environmentUrl),
      safe(body.testFile),
      safe(body.testName),
      safe(body.browser),
      safe(body.screenshot),
      safe(body.video),
      safe(body.trace),
      safe(body.runAt),
      safe(body.notes)
    ]);


    return jsonResponse({
      ok: true,
      action: 'append',
      bugId: bugId
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: String(error)
    });
  }
}

function getBugSheet() {
  const spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  let sheet =
    spreadsheet.getSheetByName(
      SHEET_NAME
    );

  if (!sheet) {
    sheet =
      spreadsheet.insertSheet(
        SHEET_NAME
      );
  }

  ensureHeaders(sheet);
  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    writeHeaders(sheet);
    return;
  }

  const firstCell =
    sheet.getRange(1, 1)
      .getValue();

  if (firstCell !== HEADERS[0]) {
    sheet.insertRowBefore(1);
    writeHeaders(sheet);
  }
}

function writeHeaders(sheet) {
  sheet.getRange(
    1,
    1,
    1,
    HEADERS.length
  ).setValues([
    HEADERS
  ]);

  sheet.getRange(
    1,
    1,
    1,
    HEADERS.length
  ).setFontWeight('bold');

  sheet.setFrozenRows(1);
}

function nextBugId(sheet) {
  const dataRows =
    Math.max(
      0,
      sheet.getLastRow() - 1
    );

  return 'BUG-' +
    String(dataRows + 1)
      .padStart(3, '0');
}

function safe(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value)
    .slice(0, 45000);
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(
      JSON.stringify(value)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}
