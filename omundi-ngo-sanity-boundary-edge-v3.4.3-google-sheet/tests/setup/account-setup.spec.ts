import {
  test,
  expect
} from '@playwright/test';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  readAccountState,
  markAccountApproved,
  markAccountCreated
} from '../../helpers/account-state.helper';

import {
  waitForAdminApproval
} from '../../helpers/approval.helper';

import {
  LoginPage
} from '../../pages/login/login.page';

import {
  SignupBasicDetailsPage
} from '../../pages/signup/01-basic-details.page';

import {
  SignupAddressPage
} from '../../pages/signup/02-address.page';

import {
  SignupDocumentsPage
} from '../../pages/signup/03-documents.page';

import {
  SignupReviewPage
} from '../../pages/signup/04-review.page';

test(
  '@setup create NGO account once, wait for Admin approval, then verify Login',
  async ({ page }) => {
    const existingState =
      readAccountState();

    test.skip(
      existingState.approved &&
      existingState.email ===
        TEST_DATA.account.email,
      [
        'This exact NGO account is already marked approved locally.',
        `Email: ${TEST_DATA.account.email}`,
        'Signup is skipped to prevent duplicate-account creation.'
      ].join('\n')
    );

    const login =
      new LoginPage(page);

    const basic =
      new SignupBasicDetailsPage(
        page
      );

    const address =
      new SignupAddressPage(
        page
      );

    const documents =
      new SignupDocumentsPage(
        page
      );

    const review =
      new SignupReviewPage(
        page
      );

    const samePendingAccount =
      existingState.created &&
      !existingState.approved &&
      existingState.email ===
        TEST_DATA.account.email;

    if (!samePendingAccount) {
      await test.step(
        'Signup - Basic Details',
        async () => {
          await login.goto();

          await login
            .goToCreateAccount();

          await basic
            .expectLoaded();

          await basic.fill();
        }
      );

      await test.step(
        'Signup - Verify Email with fixed OTP',
        async () => {
          await basic
            .verifyEmail();

          await basic
            .continue();

          await address
            .expectLoaded();
        }
      );

      await test.step(
        'Signup - Address',
        async () => {
          await address.fill();

          await address
            .continue();

          await documents
            .expectLoaded();
        }
      );

      await test.step(
        'Signup - Documents and Submit',
        async () => {
          await documents
            .uploadRequiredDocuments();

          await documents
            .createAccount();

          await review
            .expectRegistrationSubmitted(
              60_000
            );

          markAccountCreated(
            TEST_DATA.account.email
          );

          await review
            .goToLogin();
        }
      );
    } else {
      console.log(
        [
          '',
          'A signup for this email was already submitted in a previous run.',
          `Email: ${TEST_DATA.account.email}`,
          'The framework will NOT create the account again.',
          'It will resume from the Admin approval wait.',
          ''
        ].join('\n')
      );

      /*
       * Load Omundi before the wait so Chromium does not remain on about:blank.
       */
      await login.goto();

      await expect(
        page.getByRole(
          'button',
          {
            name: /^Login$/i
          }
        )
      ).toBeVisible({
        timeout: 30_000
      });
    }

    await test.step(
      'Wait for Admin approval',
      async () => {
        if (
          !/\/login(?:[/?#]|$)/i.test(
            page.url()
          )
        ) {
          await login.goto();
        }

        console.log(
          `\nApprove the NGO in the Admin Portal during the ${Math.round(TEST_DATA.approval.timeoutMs / 1000)}-second wait. No terminal input is required.\n`
        );

        await waitForAdminApproval(
          TEST_DATA.approval
            .timeoutMs
        );
      }
    );

    await test.step(
      'Login after Admin approval',
      async () => {
        await login.goto();

        await login
          .fillCredentials();

        await login.submit();

        await login
          .completeLoginOtp();

        await login
          .expectDashboard();

        markAccountApproved(
          TEST_DATA.account.email
        );

        await expect(
          page.getByRole(
            'link',
            {
              name: /^Campaigns$/i
            }
          )
        ).toBeVisible();
      }
    );
  }
);
