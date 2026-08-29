import {
  test,
  expect
} from '@playwright/test';

import {
  LoginPage
} from '../../pages/login/login.page';

/*
 * INTERNAL DEMO ONLY
 *
 * This file intentionally produces:
 *   3 PASS
 *   2 FAIL
 *
 * The two failing cases are synthetic demonstration failures.
 * They are NOT evidence of real Omundi product defects.
 * Their purpose is to demonstrate Playwright screenshots,
 * traces, videos, error messages and HTML reporting.
 *
 * Run only with:
 *   npm run demo:boundary
 */

test.describe(
  '@demo @boundary Internal demo - 3 pass + 2 expected fail',
  () => {
    test(
      'PASS 1 - Login email field is visible',
      async ({
        page
      }) => {
        const login =
          new LoginPage(
            page
          );

        await login.goto();

        await expect(
          login.emailInput()
        ).toBeVisible();
      }
    );

    test(
      'PASS 2 - Password field is masked',
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
      }
    );

    test(
      'PASS 3 - Login button is visible',
      async ({
        page
      }) => {
        const login =
          new LoginPage(
            page
          );

        await login.goto();

        await expect(
          login.loginButton()
        ).toBeVisible();
      }
    );

    test(
      'EXPECTED FAIL 1 - Demo email boundary defect screenshot',
      async ({
        page
      }, testInfo) => {
        const login =
          new LoginPage(
            page
          );

        await login.goto();

        await login
          .emailInput()
          .fill(
            'a'.repeat(245) +
            '@example.com'
          );

        await login
          .passwordInput()
          .fill(
            'Test@123'
          );

        const screenshotPath =
          testInfo.outputPath(
            'demo-email-boundary-before-failure.png'
          );

        await page.screenshot({
          path:
            screenshotPath,
          fullPage:
            true
        });

        await testInfo.attach(
          'Demo email boundary screenshot',
          {
            path:
              screenshotPath,
            contentType:
              'image/png'
          }
        );

        throw new Error(
          '[DEMO EXPECTED FAILURE] Synthetic email boundary issue used only to demonstrate bug evidence and screenshots.'
        );
      }
    );

    test(
      'EXPECTED FAIL 2 - Demo password boundary defect screenshot',
      async ({
        page
      }, testInfo) => {
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
            'Aa1!aaa'
          );

        const screenshotPath =
          testInfo.outputPath(
            'demo-password-boundary-before-failure.png'
          );

        await page.screenshot({
          path:
            screenshotPath,
          fullPage:
            true
        });

        await testInfo.attach(
          'Demo password boundary screenshot',
          {
            path:
              screenshotPath,
            contentType:
              'image/png'
          }
        );

        throw new Error(
          '[DEMO EXPECTED FAILURE] Synthetic password boundary issue used only to demonstrate bug evidence and screenshots.'
        );
      }
    );
  }
);
