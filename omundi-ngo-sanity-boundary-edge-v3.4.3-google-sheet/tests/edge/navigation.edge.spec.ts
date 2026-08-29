import {
  test,
  expect
} from '../../fixtures/auth.fixture';

test.describe(
  '@edge Authenticated navigation',
  () => {
    test(
      'direct authenticated routes remain accessible after Login',
      async ({
        authPage: page
      }) => {
        const routes = [
          '/funds',
          '/campaigns',
          '/vouchers',
          '/settings'
        ];

        for (
          const route of routes
        ) {
          await page.goto(
            route,
            {
              waitUntil:
                'domcontentloaded'
            }
          );

          await expect(
            page
          ).not.toHaveURL(
            /\/login(?:[/?#]|$)/
          );
        }
      }
    );

    test(
      'unknown route does not destroy authenticated session',
      async ({
        authPage: page
      }) => {
        await page.goto(
          '/this-route-should-not-exist',
          {
            waitUntil:
              'domcontentloaded'
          }
        );

        await page.goto(
          '/campaigns',
          {
            waitUntil:
              'domcontentloaded'
          }
        );

        await expect(
          page
        ).toHaveURL(
          /\/campaigns/
        );

        await expect(
          page.getByRole(
            'link',
            {
              name: /^Funds$/i
            }
          )
        ).toBeVisible();
      }
    );
  }
);
