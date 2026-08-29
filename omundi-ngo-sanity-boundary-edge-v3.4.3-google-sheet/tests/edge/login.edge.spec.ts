import {
  test
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

test.describe(
  '@edge Login input hardening',
  () => {
    for (
      const [
        name,
        payload
      ] of Object.entries(
        TEST_DATA.securityPayloads
      )
    ) {
      test(
        `email rejects ${name} payload`,
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
              payload
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
            true,
            `login security ${name}`
          );
        }
      );
    }
  }
);
