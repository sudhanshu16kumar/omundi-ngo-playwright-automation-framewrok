import {
  test
} from '../../fixtures/auth.fixture';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  uniqueSuffix
} from '../../helpers/common.helper';

import {
  BankDetailsPage
} from '../../pages/settings/bank-details.page';

import {
  FundsPage
} from '../../pages/funds/funds.page';

test(
  '@setup seed one real Fund',
  async ({
    authPage: page
  }) => {
    test.setTimeout(
      3 * 60 * 1000
    );

    const bank =
      new BankDetailsPage(
        page
      );

    await bank.configure();

    const funds =
      new FundsPage(
        page
      );

    const transactionReference =
      `${TEST_DATA.liveFlow.fund.transactionPrefix}-${uniqueSuffix()}`;

    const drawer =
      await funds
        .openAddFundDrawer();

    await funds.fillValid(
      drawer,
      {
        amount:
          TEST_DATA.liveFlow
            .fund.amount,
        transactionReference,
        notes:
          TEST_DATA.liveFlow
            .fund.notes
      }
    );

    await funds.submit(
      drawer
    );

    console.log(
      [
        '',
        '============================================================',
        '✅ FUND SEED COMPLETED',
        `Reference: ${transactionReference}`,
        `Amount: ${TEST_DATA.liveFlow.fund.amount}`,
        '============================================================',
        ''
      ].join('\n')
    );
  }
);
