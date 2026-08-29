const dotenv = require('dotenv');

dotenv.config({
  quiet: true
});

async function main() {
  const webhookUrl =
    process.env.BUG_SHEET_WEBHOOK_URL
      ?.trim();

  if (!webhookUrl) {
    console.error(
      '❌ BUG_SHEET_WEBHOOK_URL is empty. Add the deployed Google Apps Script Web App URL to .env first.'
    );

    process.exitCode = 1;
    return;
  }

  console.log(
    'Clearing automation bug rows from Google Sheet...'
  );

  const response =
    await fetch(
      webhookUrl,
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json'
        },
        body:
          JSON.stringify({
            action: 'clear',
            secret:
              process.env.BUG_SHEET_SECRET ?? ''
          }),
        signal:
          AbortSignal.timeout(
            10_000
          )
      }
    );

  const body =
    await response.text();

  if (!response.ok) {
    console.error(
      `❌ Google Sheet clear failed with HTTP ${response.status}.`
    );

    console.error(
      body
    );

    process.exitCode = 1;
    return;
  }

  try {
    const parsed =
      JSON.parse(body);

    if (parsed.ok !== true) {
      console.error(
        '❌ Google Sheet did not confirm the clear operation.'
      );

      console.error(
        body
      );

      process.exitCode = 1;
      return;
    }
  } catch {
    console.error(
      '❌ Google Sheet returned an unexpected response.'
    );

    console.error(
      body
    );

    process.exitCode = 1;
    return;
  }

  console.log(
    '✅ Google Sheet bug log cleared. Header row was kept.'
  );
}

main()
  .catch(
    error => {
      console.error(
        '❌ Could not clear Google Sheet bug log.',
        error
      );

      process.exitCode = 1;
    }
  );
