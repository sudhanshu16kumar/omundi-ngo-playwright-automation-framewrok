import path from 'node:path';

import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult
} from '@playwright/test/reporter';

type BugPayload = {
  action: 'append';
  secret: string;
  module: string;
  issueTitle: string;
  description: string;
  expected: string;
  actual: string;
  priority: string;
  qaStatus: string;
  environmentUrl: string;
  testFile: string;
  testName: string;
  browser: string;
  screenshot: string;
  video: string;
  trace: string;
  runAt: string;
  notes: string;
};

function inferModule(
  test: TestCase
): string {
  const source =
    `${test.location.file} ${test.title}`
      .toLowerCase();

  if (source.includes('voucher')) {
    return 'Vouchers';
  }

  if (source.includes('campaign')) {
    return 'Campaigns';
  }

  if (source.includes('fund')) {
    return 'Funds';
  }

  if (
    source.includes('bank') ||
    source.includes('setting')
  ) {
    return 'Settings / Bank Details';
  }

  if (
    source.includes('signup') ||
    source.includes('account-setup')
  ) {
    return 'Signup';
  }

  if (
    source.includes('login') ||
    source.includes('email') ||
    source.includes('password')
  ) {
    return 'Login';
  }

  return 'NGO Portal';
}

function cleanMessage(
  value: string | undefined
): string {
  if (!value) {
    return 'Playwright test failed without a captured error message.';
  }

  return value
    .replace(/\u001b\[[0-9;]*m/g, '')
    .trim()
    .slice(0, 12000);
}

function relativeAttachmentPath(
  result: TestResult,
  matcher: (
    name: string,
    contentType: string
  ) => boolean
): string {
  const attachment =
    result.attachments.find(
      item =>
        Boolean(item.path) &&
        matcher(
          item.name.toLowerCase(),
          item.contentType.toLowerCase()
        )
    );

  if (!attachment?.path) {
    return '';
  }

  return path
    .relative(
      process.cwd(),
      attachment.path
    )
    .replace(/\\/g, '/');
}

function isDemoFailure(
  test: TestCase
): boolean {
  const title =
    test.titlePath()
      .join(' ')
      .toLowerCase();

  return (
    title.includes('@demo') ||
    title.includes('expected fail') ||
    title.includes('demo expected failure')
  );
}

class GoogleSheetBugReporter
implements Reporter {
  private readonly pending:
    Promise<void>[] = [];

  private warnedMissingConfig = false;

  onTestEnd(
    test: TestCase,
    result: TestResult
  ): void {
    if (
      result.status !== 'failed' &&
      result.status !== 'timedOut'
    ) {
      return;
    }

    /*
     * Ignore tests that Playwright itself expected to fail.
     * We only log unexpected failures / defect candidates.
     */
    if (test.expectedStatus !== 'passed') {
      return;
    }

    if (
      process.env.BUG_SHEET_ENABLED === 'false'
    ) {
      return;
    }

    const webhookUrl =
      process.env.BUG_SHEET_WEBHOOK_URL
        ?.trim();

    if (!webhookUrl) {
      if (!this.warnedMissingConfig) {
        this.warnedMissingConfig = true;

        console.log(
          '\nℹ Google Sheet bug logging is disabled because BUG_SHEET_WEBHOOK_URL is empty.'
        );
      }

      return;
    }

    const errorMessage =
      cleanMessage(
        result.error?.message ??
        result.errors?.[0]?.message
      );

    const demoFailure =
      isDemoFailure(test);

    const payload: BugPayload = {
      action: 'append',
      secret:
        process.env.BUG_SHEET_SECRET ?? '',
      module:
        inferModule(test),
      issueTitle:
        test.title,
      description:
        demoFailure
          ? 'Synthetic boundary failure created only to demonstrate automatic failure evidence and Google Sheet logging.'
          : 'Automation detected an unexpected test failure. QA review is required before confirming this as a product defect.',
      expected:
        'The automated scenario should complete successfully.',
      actual:
        errorMessage,
      priority:
        demoFailure
          ? 'Demo'
          : 'Medium',
      qaStatus:
        demoFailure
          ? 'Demo - Needs Review'
          : 'Open - Needs QA Review',
      environmentUrl:
        process.env.BASE_URL ?? '',
      testFile:
        path
          .relative(
            process.cwd(),
            test.location.file
          )
          .replace(/\\/g, '/'),
      testName:
        test.titlePath()
          .join(' > '),
      browser:
        test.parent.project()
          ?.name ?? 'unknown',
      screenshot:
        relativeAttachmentPath(
          result,
          (
            name,
            contentType
          ) =>
            contentType === 'image/png' ||
            name.includes('screenshot')
        ),
      video:
        relativeAttachmentPath(
          result,
          (
            name,
            contentType
          ) =>
            contentType.includes('video') ||
            name.includes('video')
        ),
      trace:
        relativeAttachmentPath(
          result,
          name =>
            name.includes('trace')
        ),
      runAt:
        new Date()
          .toISOString(),
      notes:
        demoFailure
          ? 'DEMO ONLY: this row is intentionally generated and is not a confirmed product bug.'
          : 'Automatically logged by Playwright. Review screenshot, trace and application behavior before confirming.'
    };

    this.pending.push(
      this.sendBug(
        webhookUrl,
        payload
      )
    );
  }

  async onEnd(
    _result: FullResult
  ): Promise<void> {
    if (!this.pending.length) {
      return;
    }

    await Promise.allSettled(
      this.pending
    );
  }

  private async sendBug(
    webhookUrl: string,
    payload: BugPayload
  ): Promise<void> {
    try {
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
              JSON.stringify(
                payload
              ),
            signal:
              AbortSignal.timeout(
                8_000
              )
          }
        );

      const body =
        await response.text();

      if (!response.ok) {
        console.error(
          `\n⚠ Google Sheet bug logger returned HTTP ${response.status}: ${body.slice(0, 500)}`
        );

        return;
      }

      let parsed:
        {
          ok?: boolean;
          bugId?: string;
          error?: string;
        };

      try {
        parsed =
          JSON.parse(body) as {
            ok?: boolean;
            bugId?: string;
            error?: string;
          };
      } catch {
        console.error(
          `\n⚠ Google Sheet bug logger returned an unexpected response: ${body.slice(0, 500)}`
        );

        return;
      }

      if (parsed.ok !== true) {
        console.error(
          `\n⚠ Google Sheet rejected the bug log request: ${parsed.error ?? body.slice(0, 500)}`
        );

        return;
      }

      console.log(
        parsed.bugId
          ? `\n🐞 ${parsed.bugId} added to Google Sheet: ${payload.issueTitle}`
          : `\n🐞 Failure added to Google Sheet: ${payload.issueTitle}`
      );
    } catch (error) {
      console.error(
        '\n⚠ Could not log the failed test to Google Sheet. The Playwright test result is unchanged.',
        error
      );
    }
  }
}

export default GoogleSheetBugReporter;
