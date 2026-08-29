import {
  test,
  expect,
  type Page
} from '@playwright/test';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  expectClientDecision
} from '../../helpers/write-guard.helper';

import {
  LoginPage
} from '../../pages/login/login.page';

async function expectLoginRejected(
  page: Page,
  login: LoginPage,
  label: string
): Promise<void> {
  await expect(
    login.loginButton()
  ).toBeVisible({
    timeout:
      10_000
  });

  await expect(
    login.loginButton()
  ).toBeEnabled({
    timeout:
      10_000
  });

  await login
    .loginButton()
    .click();

  await page.waitForTimeout(
    2_000
  );

  await expect(
    page,
    `${label}: invalid input unexpectedly left the Login page`
  ).toHaveURL(
    /\/login(?:[/?#]|$)/,
    {
      timeout:
        10_000
    }
  );

  const authenticatedNavigation =
    page
      .getByRole(
        'link',
        {
          name:
            /^(Dashboard|Funds|Campaigns|Vouchers)$/i
        }
      )
      .first();

  await expect(
    authenticatedNavigation,
    `${label}: authenticated navigation became available`
  ).not.toBeVisible();

  await expect(
    login.loginButton()
  ).toBeVisible({
    timeout:
      10_000
  });

  console.log(
    `✅ ${label}: Login correctly rejected.`
  );
}

test.describe(
  '@validation @boundary Login fields',
  () => {
    for (
      const testCase of
      TEST_DATA.boundaries
        .login.emailCases
    ) {
      test(
        `email: ${testCase.name}`,
        async ({
          page
        }) => {
          const login =
            new LoginPage(
              page
            );

          await login.goto();

          await login
            .emailInput()
            .fill(
              testCase.value
            );

          await login
            .passwordInput()
            .fill(
              'Test@123'
            );

          await expectClientDecision(
            page,
            () =>
              login
                .loginButton()
                .click(),
            testCase.shouldBlock,
            `login email ${testCase.name}`
          );
        }
      );
    }

    test(
      'email: maximum valid length',
      async ({
        page
      }) => {
        const login =
          new LoginPage(
            page
          );

        await login.goto();

        const max =
          TEST_DATA.boundaries
            .login.emailMax;

        const domain =
          '@example.com';

        const email =
          'a'.repeat(
            max -
            domain.length
          ) +
          domain;

        await login
          .emailInput()
          .fill(
            email
          );

        await login
          .passwordInput()
          .fill(
            'Test@123'
          );

        await expectClientDecision(
          page,
          () =>
            login
              .loginButton()
              .click(),
          false,
          'login email maximum valid length'
        );
      }
    );

    test(
      'email: maximum plus one',
      async ({
        page
      }) => {
        const login =
          new LoginPage(
            page
          );

        await login.goto();

        const max =
          TEST_DATA.boundaries
            .login.emailMax;

        const domain =
          '@example.com';

        const email =
          'a'.repeat(
            max + 1 -
            domain.length
          ) +
          domain;

        await login
          .emailInput()
          .fill(
            email
          );

        await login
          .passwordInput()
          .fill(
            'Test@123'
          );

        await expectLoginRejected(
          page,
          login,
          'login email maximum plus one'
        );
      }
    );

    for (
      const testCase of
      TEST_DATA.boundaries
        .login.passwordCases
    ) {
      test(
        `password: ${testCase.name}`,
        async ({
          page
        }) => {
          const login =
            new LoginPage(
              page
            );

          await login.goto();

          await login
            .emailInput()
            .fill(
              'qa.ngo@example.com'
            );

          await login
            .passwordInput()
            .fill(
              testCase.value
            );

          if (
            testCase.name ===
              'whitespace only' ||
            testCase.name ===
              'minimum minus one'
          ) {
            await expectLoginRejected(
              page,
              login,
              `login password ${testCase.name}`
            );

            return;
          }

          await expectClientDecision(
            page,
            () =>
              login
                .loginButton()
                .click(),
            testCase.shouldBlock,
            `login password ${testCase.name}`
          );
        }
      );
    }

    test(
      'password: maximum plus one',
      async ({
        page
      }) => {
        const login =
          new LoginPage(
            page
          );

        await login.goto();

        await login
          .emailInput()
          .fill(
            'qa.ngo@example.com'
          );

        await login
          .passwordInput()
          .fill(
            'Aa1!' +
            'x'.repeat(
              TEST_DATA.boundaries
                .login.passwordMax -
              3
            )
          );

        await expectLoginRejected(
          page,
          login,
          'login password maximum plus one'
        );
      }
    );

    test(
      'password is masked and show-password control exists',
      async ({
        page
      }) => {
        const login =
          new LoginPage(
            page
          );

        await login.goto();

        await expect(
          login.passwordInput()
        ).toHaveAttribute(
          'type',
          'password'
        );

        await expect(
          page.getByRole(
            'button',
            {
              name:
                /show password/i
            }
          )
        ).toBeVisible();
      }
    );
  }
);
