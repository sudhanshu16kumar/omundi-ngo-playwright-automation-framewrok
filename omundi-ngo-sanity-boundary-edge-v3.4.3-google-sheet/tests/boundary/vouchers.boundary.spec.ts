import {
  test
} from '../../fixtures/auth.fixture';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  offsetDate,
  fillNativeDate,
  forceNativeDate
} from '../../helpers/date.helper';

import {
  expectClientDecision
} from '../../helpers/write-guard.helper';

import {
  VouchersPage
} from '../../pages/vouchers/vouchers.page';

test.describe(
  '@validation @boundary Voucher fields',
  () => {
    for (
      const testCase of
      TEST_DATA.boundaries
        .vouchers.value
    ) {
      test(
        `voucher value: ${testCase.name}`,
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
                testCase.value
            });

          await expectClientDecision(
            page,
            () =>
              vouchers.attemptSubmit(),
            testCase.shouldBlock,
            `voucher value ${testCase.name}`
          );
        }
      );
    }

    for (
      const testCase of
      TEST_DATA.boundaries
        .vouchers.quantity
    ) {
      test(
        `quantity: ${testCase.name}`,
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
              quantity:
                testCase.value
            });

          await expectClientDecision(
            page,
            () =>
              vouchers.attemptSubmit(),
            testCase.shouldBlock,
            `voucher quantity ${testCase.name}`
          );
        }
      );
    }

    test(
      'campaign is required',
      async ({
        authPage: page
      }) => {
        const vouchers =
          new VouchersPage(
            page
          );

        await vouchers
          .openGenerateForm();

        const select =
          vouchers
            .campaignDropdown();

        const firstOption =
          await select
            .locator(
              'option'
            )
            .first()
            .getAttribute(
              'value'
            );

        if (
          firstOption !==
          null
        ) {
          await select
            .selectOption(
              firstOption
            );
        }

        const textboxes =
          vouchers
            .voucherTextboxes();

        await textboxes
          .nth(0)
          .fill(
            TEST_DATA.liveFlow
              .voucher.value
          );

        await textboxes
          .nth(1)
          .fill(
            TEST_DATA.liveFlow
              .voucher.quantity
          );

        await fillNativeDate(
          vouchers.expiryDate(),
          offsetDate(
            TEST_DATA.liveFlow
              .voucher
              .expiryOffsetDays
          )
        );

        await expectClientDecision(
          page,
          () =>
            vouchers.attemptSubmit(),
          TEST_DATA.boundaries
            .vouchers
            .campaignRequired,
          'voucher campaign required'
        );
      }
    );

    test(
      'expiry: past',
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
            expiryDate:
              offsetDate(1)
          });

        await forceNativeDate(
          vouchers.expiryDate(),
          offsetDate(-1)
        );

        await expectClientDecision(
          page,
          () =>
            vouchers.attemptSubmit(),
          TEST_DATA.boundaries
            .vouchers
            .pastExpiryShouldBlock,
          'voucher past expiry'
        );
      }
    );

    test(
      'expiry: today',
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
            expiryDate:
              offsetDate(0)
          });

        await expectClientDecision(
          page,
          () =>
            vouchers.attemptSubmit(),
          TEST_DATA.boundaries
            .vouchers
            .todayExpiryShouldBlock,
          'voucher expiry today'
        );
      }
    );

    test(
      'duplicate criteria type',
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
            includeCriteria:
              false
          });

        const criterion =
          TEST_DATA.liveFlow
            .voucher
            .criteria[0];

        await vouchers
          .addCriterion(
            criterion.key,
            criterion
              .preferredValues
          );

        await vouchers
          .addCriterion(
            criterion.key,
            criterion
              .preferredValues
          );

        await expectClientDecision(
          page,
          () =>
            vouchers.attemptSubmit(),
          TEST_DATA.boundaries
            .vouchers
            .duplicateCriteriaShouldBlock,
          'voucher duplicate criterion'
        );
      }
    );
  }
);
