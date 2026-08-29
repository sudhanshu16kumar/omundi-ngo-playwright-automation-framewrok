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
  BankDetailsPage
} from '../../pages/settings/bank-details.page';

import {
  FundsPage
} from '../../pages/funds/funds.page';

import {
  CampaignsPage
} from '../../pages/campaigns/campaigns.page';

import {
  VouchersPage
} from '../../pages/vouchers/vouchers.page';

test(
  '@happy-path Bank Details -> Add Fund -> Create Campaign -> Create Voucher with Criteria',
  async ({
    authPage: page
  }) => {
    test.setTimeout(
      10 * 60 * 1000
    );

    const suffix =
      uniqueSuffix();

    const transactionReference =
      `${TEST_DATA.liveFlow.fund.transactionPrefix}-${suffix}`;

    const campaignName =
      `${TEST_DATA.liveFlow.campaign.namePrefix} ${suffix}`;

    console.log(
      [
        '',
        '============================================================',
        'OMUNDI NGO HAPPY PATH',
        '',
        '1. Bank Details',
        '2. Add Fund',
        '3. Create Active Campaign',
        '4. Create Voucher with criteria',
        '============================================================',
        ''
      ].join('\n')
    );

    await test.step(
      'Ensure Bank Details',
      async () => {
        const bank =
          new BankDetailsPage(
            page
          );

        await bank.configure();

        console.log(
          '✅ Bank Details ready.'
        );
      }
    );

    await test.step(
      'Add Fund',
      async () => {
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
          `✅ Fund added successfully: ${transactionReference}`
        );
      }
    );

    await test.step(
      'Create Active Campaign',
      async () => {
        const campaigns =
          new CampaignsPage(
            page
          );

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

        console.log(
          '✅ Campaign form filled. Clicking Launch Campaign now.'
        );

        const campaignResponsePromise =
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

        const campaignResponse =
          await campaignResponsePromise;

        console.log(
          `Campaign API status: ${campaignResponse.status()}`
        );

        expect(
          campaignResponse.ok(),
          `Campaign creation API returned HTTP ${campaignResponse.status()}`
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
          `✅ REAL Campaign created and verified: ${campaignName}`
        );
      }
    );

    await test.step(
      'Create Voucher with Farmer Targeting Criteria',
      async () => {
        const vouchers =
          new VouchersPage(
            page
          );

        await vouchers
          .openGenerateForm();

        await vouchers
          .fillValid({
            campaignName,
            value:
              TEST_DATA.liveFlow
                .voucher.value,
            quantity:
              TEST_DATA.liveFlow
                .voucher.quantity
          });

        const generateButton =
          vouchers.submitButton();

        await expect(
          generateButton
        ).toBeVisible({
          timeout:
            30_000
        });

        await expect(
          generateButton
        ).toBeEnabled({
          timeout:
            30_000
        });

        console.log(
          '✅ Voucher form + criteria filled. Clicking Generate Vouchers.'
        );

        const voucherResponsePromise =
          page.waitForResponse(
            response =>
              response
                .request()
                .method() ===
                'POST' &&
              /voucher/i.test(
                response.url()
              ),
            {
              timeout:
                40_000
            }
          );

        await generateButton.click();

        const voucherResponse =
          await voucherResponsePromise;

        console.log(
          `Voucher API status: ${voucherResponse.status()}`
        );

        expect(
          voucherResponse.ok(),
          `Voucher creation API returned HTTP ${voucherResponse.status()}`
        ).toBe(true);

        const body =
          voucherResponse
            .request()
            .postData() ??
          '';

        const payload =
          JSON.parse(
            body
          ) as {
            criteria?: {
              region_id?: number;
              irrigation_type_id?: number;
              primary_crop_id?: number;
            };
          };

        expect(
          payload.criteria
            ?.region_id
        ).toBeDefined();

        expect(
          payload.criteria
            ?.irrigation_type_id
        ).toBeDefined();

        expect(
          payload.criteria
            ?.primary_crop_id
        ).toBeDefined();

        console.log(
          '✅ REAL Voucher generated with targeting criteria.'
        );
      }
    );

    console.log(
      [
        '',
        '============================================================',
        '✅ HAPPY PATH COMPLETED',
        `Fund: ${transactionReference}`,
        `Campaign: ${campaignName}`,
        '============================================================',
        ''
      ].join('\n')
    );
  }
);
