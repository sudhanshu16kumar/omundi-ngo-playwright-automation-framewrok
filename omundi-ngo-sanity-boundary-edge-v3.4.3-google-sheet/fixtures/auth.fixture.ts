import {
  test as base,
  expect,
  type Page
} from '@playwright/test';

import {
  TEST_DATA
} from '../config/test-data';

import {
  assertAccountApproved
} from '../helpers/account-state.helper';

import {
  LoginPage
} from '../pages/login/login.page';

type TestFixtures = {
  authPage: Page;
};

export const test =
  base.extend<
    TestFixtures
  >({
    authPage: async (
      {
        browser
      },
      use
    ) => {
      assertAccountApproved(
        TEST_DATA.account.email
      );

      const context =
        await browser
          .newContext({
            viewport: {
              width:
                TEST_DATA.browser
                  .width,
              height:
                TEST_DATA.browser
                  .height
            },

            screen: {
              width:
                TEST_DATA.browser
                  .width,
              height:
                TEST_DATA.browser
                  .height
            },

            deviceScaleFactor: 1
          });

      const page =
        await context
          .newPage();

      const login =
        new LoginPage(
          page
        );

      await login.login();

      try {
        await use(
          page
        );
      } finally {
        if (
          !page.isClosed()
        ) {
          await page.close();
        }

        await context.close();
      }
    }
  });

export {
  expect
};
