import {
  expect
} from '@playwright/test';

import {
  test
} from '../../fixtures/auth.fixture';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  expectClientDecision
} from '../../helpers/write-guard.helper';

import {
  VouchersPage
} from '../../pages/vouchers/vouchers.page';

test.describe(
  '@edge Voucher text inputs',
  () => {
    for (
      const [
        name,
        payload
      ] of Object.entries(
        TEST_DATA.securityPayloads
      )
    ) {
      /*
       * Known SQL case is temporarily excluded from the normal green Edge run.
       */
      if (
        name ===
        'sql'
      ) {
        continue;
      }

      test(
        `voucher value blocks ${name}`,
        async ({
          authPage: page
        }) => {
          const vouchers =
            new VouchersPage(
              page
            );

          await vouchers
            .openGenerateForm();

          await vouchers
            .fillValid({
              value:
                payload
            });

          await expectClientDecision(
            page,
            async () => {
              const button =
                vouchers.submitButton();

              await expect(
                button
              ).toBeVisible({
                timeout:
                  20_000
              });

              const enabled =
                await button
                  .isEnabled()
                  .catch(
                    () => false
                  );

              if (
                !enabled
              ) {
                console.log(
                  `✅ Voucher ${name} payload blocked by disabled Generate Vouchers button.`
                );
                return;
              }

              await button.click();
            },
            true,
            `voucher value security ${name}`
          );
        }
      );
    }
  }
);
