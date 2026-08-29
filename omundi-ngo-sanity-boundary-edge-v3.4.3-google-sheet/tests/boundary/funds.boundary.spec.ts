import {
  test
} from '../../fixtures/auth.fixture';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  repeated
} from '../../helpers/common.helper';

import {
  expectClientDecision
} from '../../helpers/write-guard.helper';

import {
  FundsPage
} from '../../pages/funds/funds.page';

test.describe(
  '@validation @boundary Funds fields',
  () => {
    for (
      const testCase of
      TEST_DATA.boundaries
        .funds.amount
    ) {
      test(
        `amount: ${testCase.name}`,
        async ({
          authPage: page
        }) => {
          const funds =
            new FundsPage(
              page
            );

          const drawer =
            await funds
              .openAddFundDrawer();

          await funds.fillValid(
            drawer,
            {
              amount:
                testCase.value
            }
          );

          await expectClientDecision(
            page,
            () =>
              funds.attemptSubmit(
                drawer
              ),
            testCase.shouldBlock,
            `fund amount ${testCase.name}`
          );
        }
      );
    }

    for (
      const testCase of
      TEST_DATA.boundaries
        .funds
        .transactionReference
    ) {
      test(
        `transaction reference: ${testCase.name}`,
        async ({
          authPage: page
        }) => {
          const funds =
            new FundsPage(
              page
            );

          const drawer =
            await funds
              .openAddFundDrawer();

          await funds.fillValid(
            drawer,
            {
              transactionReference:
                testCase.value
            }
          );

          await expectClientDecision(
            page,
            () =>
              funds.attemptSubmit(
                drawer
              ),
            testCase.shouldBlock,
            `fund reference ${testCase.name}`
          );
        }
      );
    }

    test(
      'transaction reference: maximum plus one',
      async ({
        authPage: page
      }) => {
        const funds =
          new FundsPage(
            page
          );

        const drawer =
          await funds
            .openAddFundDrawer();

        await funds.fillValid(
          drawer,
          {
            transactionReference:
              repeated(
                TEST_DATA.boundaries
                  .funds
                  .transactionReferenceMax +
                1
              )
          }
        );

        await expectClientDecision(
          page,
          () =>
            funds.attemptSubmit(
              drawer
            ),
          true,
          'fund transaction reference maximum plus one'
        );
      }
    );

    for (
      const testCase of
      TEST_DATA.boundaries
        .funds.notes
    ) {
      test(
        `notes: ${testCase.name}`,
        async ({
          authPage: page
        }) => {
          const funds =
            new FundsPage(
              page
            );

          const drawer =
            await funds
              .openAddFundDrawer();

          await funds.fillValid(
            drawer,
            {
              notes:
                testCase.value
            }
          );

          await expectClientDecision(
            page,
            () =>
              funds.attemptSubmit(
                drawer
              ),
            testCase.shouldBlock,
            `fund notes ${testCase.name}`
          );
        }
      );
    }

    test(
      'notes: maximum plus one',
      async ({
        authPage: page
      }) => {
        const funds =
          new FundsPage(
            page
          );

        const drawer =
          await funds
            .openAddFundDrawer();

        await funds.fillValid(
          drawer,
          {
            notes:
              repeated(
                TEST_DATA.boundaries
                  .funds.notesMax +
                1,
                'N'
              )
          }
        );

        await expectClientDecision(
          page,
          () =>
            funds.attemptSubmit(
              drawer
            ),
          true,
          'fund notes maximum plus one'
        );
      }
    );
  }
);
