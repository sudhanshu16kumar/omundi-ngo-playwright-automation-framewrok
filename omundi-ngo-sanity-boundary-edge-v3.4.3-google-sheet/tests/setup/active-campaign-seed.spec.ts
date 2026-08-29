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
  uniqueSuffix
} from '../../helpers/common.helper';

import {
  CampaignsPage
} from '../../pages/campaigns/campaigns.page';

test(
  '@setup seed one real active Campaign',
  async ({
    authPage: page
  }) => {
    test.setTimeout(
      3 * 60 * 1000
    );

    const campaigns =
      new CampaignsPage(
        page
      );

    const campaignName =
      `${TEST_DATA.liveFlow.campaign.namePrefix} ${uniqueSuffix()}`;

    await campaigns
      .openCreateForm();

    await campaigns
      .fillValid({
        name:
          campaignName,
        description:
          TEST_DATA.liveFlow
            .campaign
            .description,
        region:
          TEST_DATA.liveFlow
            .campaign
            .region,
        crop:
          TEST_DATA.liveFlow
            .campaign
            .crop,
        budget:
          TEST_DATA.liveFlow
            .campaign
            .budget
      });

    const launchButton =
      campaigns.launchButton();

    await expect(
      launchButton
    ).toBeVisible({
      timeout:
        30_000
    });

    await expect(
      launchButton
    ).toBeEnabled({
      timeout:
        30_000
    });

    const responsePromise =
      page.waitForResponse(
        response =>
          response
            .request()
            .method() ===
            'POST' &&
          /campaign/i.test(
            response.url()
          ),
        {
          timeout:
            40_000
        }
      );

    await launchButton.click();

    const response =
      await responsePromise;

    console.log(
      `Campaign API status: ${response.status()}`
    );

    expect(
      response.ok(),
      `Campaign creation API returned HTTP ${response.status()}. Make sure enough Fund balance is available.`
    ).toBe(true);

    await page.goto(
      '/campaigns',
      {
        waitUntil:
          'domcontentloaded',
        timeout:
          60_000
      }
    );

    await expect(
      page.getByText(
        campaignName,
        {
          exact:
            false
        }
      )
    ).toBeVisible({
      timeout:
        40_000
    });

    console.log(
      [
        '',
        '============================================================',
        '✅ CAMPAIGN SEED COMPLETED',
        `Campaign: ${campaignName}`,
        '============================================================',
        ''
      ].join('\n')
    );
  }
);
