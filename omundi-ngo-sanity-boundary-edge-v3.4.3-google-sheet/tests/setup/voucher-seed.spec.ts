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
  VouchersPage
} from '../../pages/vouchers/vouchers.page';

test(
  '@setup seed one real Voucher',
  async ({
    authPage: page
  }) => {
    test.setTimeout(
      3 * 60 * 1000
    );

    const vouchers =
      new VouchersPage(
        page
      );

    await vouchers
      .openGenerateForm();

    await vouchers
      .fillValid({
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

    const responsePromise =
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

    const response =
      await responsePromise;

    console.log(
      `Voucher API status: ${response.status()}`
    );

    expect(
      response.ok(),
      `Voucher creation API returned HTTP ${response.status()}`
    ).toBe(true);

    const requestBody =
      response
        .request()
        .postData() ??
      '';

    let payload: {
      criteria?: {
        region_id?: number;
        irrigation_type_id?: number;
        primary_crop_id?: number;
      };
    };

    try {
      payload =
        JSON.parse(
          requestBody
        );
    } catch {
      throw new Error(
        `Voucher API request body was not valid JSON: ${requestBody}`
      );
    }

    expect(
      payload.criteria,
      'Voucher API request did not contain targeting criteria.'
    ).toBeTruthy();

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
      [
        '',
        '============================================================',
        '✅ VOUCHER SEED COMPLETED',
        `Value: ${TEST_DATA.liveFlow.voucher.value}`,
        `Quantity: ${TEST_DATA.liveFlow.voucher.quantity}`,
        `Region ID: ${payload.criteria?.region_id}`,
        `Irrigation Type ID: ${payload.criteria?.irrigation_type_id}`,
        `Primary Crop ID: ${payload.criteria?.primary_crop_id}`,
        '============================================================',
        ''
      ].join('\n')
    );
  }
);
