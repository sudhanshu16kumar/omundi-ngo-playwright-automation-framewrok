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
  CampaignsPage
} from '../../pages/campaigns/campaigns.page';

test.describe(
  '@edge Campaign text fields',
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
        `campaign name blocks ${name}`,
        async ({
          authPage: page
        }) => {
          const campaigns =
            new CampaignsPage(
              page
            );

          await campaigns
            .openCreateForm();

          await campaigns
            .fillValid({
              name:
                payload
            });

          await expectClientDecision(
            page,
            () =>
              campaigns.launch(),
            true,
            `campaign name security ${name}`
          );
        }
      );
    }
  }
);
