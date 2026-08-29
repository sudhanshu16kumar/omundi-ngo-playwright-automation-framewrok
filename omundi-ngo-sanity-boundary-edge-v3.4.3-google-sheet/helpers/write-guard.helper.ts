import {
  expect,
  type Page,
  type Route
} from '@playwright/test';

const API_HOST =
  'omundi-ngo.wartinlabstesting.dev';

function isBackendWrite(
  request: {
    url(): string;
    method(): string;
  }
): boolean {
  const method =
    request
      .method()
      .toUpperCase();

  return (
    request
      .url()
      .includes(
        API_HOST
      ) &&
    [
      'POST',
      'PUT',
      'PATCH',
      'DELETE'
    ].includes(
      method
    )
  );
}

export async function observeWriteAttempt(
  page: Page,
  action:
    () => Promise<void>
): Promise<boolean> {
  const handler =
    async (
      route: Route
    ) => {
      if (
        isBackendWrite(
          route.request()
        )
      ) {
        await route.abort(
          'blockedbyclient'
        );

        return;
      }

      await route.continue();
    };

  await page.route(
    '**/*',
    handler
  );

  const writeRequest =
    page
      .waitForRequest(
        request =>
          isBackendWrite(
            request
          ),
        {
          timeout: 3000
        }
      )
      .then(
        () => true
      )
      .catch(
        () => false
      );

  try {
    await action();

    return await writeRequest;
  } finally {
    await page.unroute(
      '**/*',
      handler
    );
  }
}

export async function expectClientDecision(
  page: Page,
  action:
    () => Promise<void>,
  shouldBlock: boolean,
  label: string
): Promise<void> {
  const writeAttempted =
    await observeWriteAttempt(
      page,
      action
    );

  if (shouldBlock) {
    expect(
      writeAttempted,
      `${label}: invalid value reached a backend write request`
    ).toBe(false);

    return;
  }

  expect(
    writeAttempted,
    `${label}: valid value did not produce a submission request`
  ).toBe(true);
}
