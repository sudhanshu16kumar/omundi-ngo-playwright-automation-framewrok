import {
  expect,
  type Locator,
  type Page
} from '@playwright/test';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  uniqueSuffix
} from '../../helpers/common.helper';

export class FundsPage {
  constructor(
    private readonly page: Page
  ) {}

  async goto(): Promise<void> {
    if (
      this.page.isClosed()
    ) {
      throw new Error(
        'Cannot open Funds because the Playwright page is already closed.'
      );
    }

    await this.page.goto(
      '/funds',
      {
        waitUntil:
          'domcontentloaded',
        timeout:
          60_000
      }
    );

    if (
      /\/login(?:[/?#]|$)/i.test(
        this.page.url()
      )
    ) {
      throw new Error(
        'Funds redirected to Login. Authentication did not complete or the session expired.'
      );
    }

    await expect(
      this.page
    ).toHaveURL(
      /\/funds(?:[/?#]|$)/,
      {
        timeout:
          30_000
      }
    );

    await expect(
      this.page
        .getByRole(
          'button',
          {
            name:
              /^Add Fund$/i
          }
        )
        .first()
    ).toBeVisible({
      timeout:
        30_000
    });
  }

  async openAddFundDrawer(): Promise<Locator> {
    await this.goto();

    const openButton =
      this.page
        .getByRole(
          'button',
          {
            name:
              /^Add Fund$/i
          }
        )
        .first();

    await expect(
      openButton
    ).toBeVisible({
      timeout:
        20_000
    });

    await openButton.click();

    const drawer =
      this.page
        .locator(
          'div.fixed.inset-0.z-50.flex.justify-end'
        )
        .last();

    await expect(
      drawer
    ).toBeVisible({
      timeout:
        30_000
    });

    return drawer;
  }

  amount(
    drawer: Locator
  ): Locator {
    return drawer
      .getByLabel(
        /^Amount/i
      )
      .or(
        drawer.locator(
          'input[placeholder="0.00"]'
        )
      )
      .or(
        drawer.getByRole(
          'spinbutton'
        )
      )
      .first();
  }

  reference(
    drawer: Locator
  ): Locator {
    return drawer
      .getByLabel(
        /Reference ID|Reference/i
      )
      .or(
        drawer.locator(
          'input[placeholder*="TXN-2026" i]'
        )
      )
      .or(
        drawer.getByRole(
          'textbox',
          {
            name:
              /TXN-2026/i
          }
        )
      )
      .first();
  }

  notes(
    drawer: Locator
  ): Locator {
    return drawer
      .getByLabel(
        /Notes/i
      )
      .or(
        drawer.locator(
          'textarea[placeholder*="additional notes" i], input[placeholder*="additional notes" i]'
        )
      )
      .or(
        drawer.getByRole(
          'textbox',
          {
            name:
              /additional notes/i
          }
        )
      )
      .first();
  }

  submitButton(
    drawer: Locator
  ): Locator {
    return drawer
      .getByRole(
        'button',
        {
          name:
            /^Add Fund$/i
        }
      )
      .last();
  }

  bankDetailsMissing(
    drawer: Locator
  ): Locator {
    return drawer
      .getByText(
        /No bank account configured yet|No bank details configured/i
      )
      .first();
  }

  async fillValid(
    drawer: Locator,
    overrides: {
      amount?: string;
      transactionReference?: string;
      notes?: string;
    } = {}
  ): Promise<void> {
    const amount =
      this.amount(
        drawer
      );

    const reference =
      this.reference(
        drawer
      );

    const notes =
      this.notes(
        drawer
      );

    await expect(
      amount
    ).toBeVisible({
      timeout:
        20_000
    });

    await amount.fill(
      overrides.amount ??
      TEST_DATA.liveFlow
        .fund.amount
    );

    await expect(
      reference
    ).toBeVisible({
      timeout:
        20_000
    });

    await reference.fill(
      overrides.transactionReference ??
      `${TEST_DATA.liveFlow.fund.transactionPrefix}-${uniqueSuffix()}`
    );

    await expect(
      notes
    ).toBeVisible({
      timeout:
        20_000
    });

    await notes.fill(
      overrides.notes ??
      TEST_DATA.liveFlow
        .fund.notes
    );
  }

  /**
   * Boundary/edge submit attempt.
   * It never waits for a successful API response.
   * If client validation disables the button or prevents the confirm modal,
   * the method simply returns so write-guard can classify the behavior.
   */
  async attemptSubmit(
    drawer: Locator
  ): Promise<void> {
    const addFundButton =
      this.submitButton(
        drawer
      );

    if (
      !await addFundButton
        .isEnabled()
        .catch(
          () => false
        )
    ) {
      return;
    }

    await addFundButton.click();

    const confirmButton =
      this.page.getByRole(
        'button',
        {
          name:
            /^Confirm$/i
        }
      );

    const confirmationAppeared =
      await confirmButton
        .waitFor({
          state:
            'visible',
          timeout:
            2_000
        })
        .then(
          () => true
        )
        .catch(
          () => false
        );

    if (
      confirmationAppeared &&
      await confirmButton
        .isEnabled()
        .catch(
          () => false
        )
    ) {
      await confirmButton.click();
    }
  }

  /**
   * Happy-path submit.
   * This method expects the Fund to be valid and actually created.
   */
  async submit(
    drawer: Locator
  ): Promise<void> {
    const addFundButton =
      this.submitButton(
        drawer
      );

    await addFundButton
      .scrollIntoViewIfNeeded();

    await expect(
      addFundButton
    ).toBeVisible({
      timeout:
        20_000
    });

    await expect(
      addFundButton
    ).toBeEnabled({
      timeout:
        20_000
    });

    console.log(
      '✅ Fund form filled. Clicking Add Fund.'
    );

    await addFundButton.click();

    const confirmationHeading =
      this.page.getByRole(
        'heading',
        {
          name:
            /^Confirm Fund Deposit$/i
        }
      );

    await expect(
      confirmationHeading
    ).toBeVisible({
      timeout:
        20_000
    });

    console.log(
      '✅ Confirm Fund Deposit popup opened.'
    );

    const confirmButton =
      this.page.getByRole(
        'button',
        {
          name:
            /^Confirm$/i
        }
      );

    await expect(
      confirmButton
    ).toBeVisible({
      timeout:
        20_000
    });

    await expect(
      confirmButton
    ).toBeEnabled({
      timeout:
        20_000
    });

    const fundResponsePromise =
      this.page.waitForResponse(
        response => {
          const request =
            response.request();

          return (
            request.method() ===
              'POST' &&
            /fund/i.test(
              response.url()
            )
          );
        },
        {
          timeout:
            40_000
        }
      );

    console.log(
      '✅ Clicking Confirm Fund Deposit.'
    );

    await confirmButton.click();

    const fundResponse =
      await fundResponsePromise;

    console.log(
      `Fund API status: ${fundResponse.status()}`
    );

    expect(
      fundResponse.ok(),
      `Fund creation API returned HTTP ${fundResponse.status()}`
    ).toBe(true);

    await expect(
      confirmationHeading
    ).toBeHidden({
      timeout:
        30_000
    });

    await expect(
      drawer
    ).toBeHidden({
      timeout:
        30_000
    });

    console.log(
      '✅ REAL Fund deposit confirmed successfully.'
    );
  }
}
