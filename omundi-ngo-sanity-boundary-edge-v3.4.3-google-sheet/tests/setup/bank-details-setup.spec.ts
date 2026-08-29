import {
  test
} from '../../fixtures/auth.fixture';

import {
  BankDetailsPage
} from '../../pages/settings/bank-details.page';

test(
  '@setup ensure Bank Details are configured before Funds testing',
  async ({
    authPage: page
  }) => {
    const bankDetails =
      new BankDetailsPage(
        page
      );

    await bankDetails.configure();
  }
);
