import {
  expect,
  type Locator,
  type Page
} from '@playwright/test';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  fillNativeDate,
  offsetDate
} from '../../helpers/date.helper';

export class VouchersPage {
  constructor(
    private readonly page: Page
  ) {}

  async goto(): Promise<void> {
    if (
      this.page.isClosed()
    ) {
      throw new Error(
        'Cannot open Vouchers because the page is closed.'
      );
    }

    await this.page.goto(
      '/vouchers',
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
        'Vouchers redirected to Login. Authentication did not complete or the session expired.'
      );
    }

    await expect(
      this.page
    ).toHaveURL(
      /\/vouchers(?:[/?#]|$)/,
      {
        timeout:
          30_000
      }
    );
  }

  async openGenerateForm(): Promise<void> {
    await this.goto();

    const generate =
      this.page
        .getByRole(
          'link',
          {
            name:
              /Generate Vouchers/i
          }
        )
        .or(
          this.page.getByRole(
            'button',
            {
              name:
                /Generate Vouchers/i
            }
          )
        )
        .first();

    await expect(
      generate
    ).toBeVisible({
      timeout:
        30_000
    });

    await generate.click();

    await expect(
      this.page
        .getByRole(
          'heading',
          {
            name:
              /Generate Vouchers/i
          }
        )
    ).toBeVisible({
      timeout:
        30_000
    });

    await expect(
      this.campaignDropdown()
    ).toBeVisible({
      timeout:
        30_000
    });
  }

  campaignDropdown(): Locator {
    return this.page
      .getByRole(
        'combobox'
      )
      .first();
  }

  async selectCampaign(
    campaignName?: string
  ): Promise<string> {
    const select =
      this.campaignDropdown();

    await expect(
      select
    ).toBeVisible({
      timeout:
        30_000
    });

    await expect
      .poll(
        async () => {
          const options =
            await select
              .locator(
                'option'
              )
              .evaluateAll(
                items =>
                  items.map(
                    item => ({
                      text:
                        (
                          item.textContent ??
                          ''
                        ).trim(),
                      value:
                        (
                          item as HTMLOptionElement
                        ).value,
                      disabled:
                        (
                          item as HTMLOptionElement
                        ).disabled
                    })
                  )
              );

          if (
            campaignName
          ) {
            return options.some(
              option =>
                option.value &&
                !option.disabled &&
                option.text
                  .toLowerCase()
                  .includes(
                    campaignName.toLowerCase()
                  )
            );
          }

          return options.some(
            option =>
              option.value &&
              option.value !==
                '0' &&
              !option.disabled &&
              option.text &&
              !/select|choose/i.test(
                option.text
              )
          );
        },
        {
          timeout:
            30_000,
          message:
            campaignName
              ? `Waiting for campaign "${campaignName}" in voucher dropdown.`
              : 'Waiting for an active campaign in voucher dropdown.'
        }
      )
      .toBe(true);

    const options =
      await select
        .locator(
          'option'
        )
        .evaluateAll(
          items =>
            items.map(
              item => ({
                text:
                  (
                    item.textContent ??
                    ''
                  ).trim(),
                value:
                  (
                    item as HTMLOptionElement
                  ).value,
                disabled:
                  (
                    item as HTMLOptionElement
                  ).disabled
              })
            )
        );

    const match =
      campaignName
        ? options.find(
            option =>
              option.value &&
              !option.disabled &&
              option.text
                .toLowerCase()
                .includes(
                  campaignName.toLowerCase()
                )
          )
        : options.find(
            option =>
              option.value &&
              option.value !==
                '0' &&
              !option.disabled &&
              option.text &&
              !/select|choose/i.test(
                option.text
              )
          );

    if (
      !match?.value
    ) {
      throw new Error(
        campaignName
          ? `Campaign "${campaignName}" was not found in voucher dropdown.`
          : 'No active campaign is available for voucher testing.'
      );
    }

    await select.selectOption(
      match.value
    );

    console.log(
      `✅ Voucher campaign selected: ${match.text}`
    );

    return match.text;
  }

  voucherTextboxes(): Locator {
    return this.page
      .getByRole(
        'textbox'
      );
  }

  expiryDate(): Locator {
    return this.page
      .locator(
        [
          'input[type="date"]',
          'input[aria-label*="Expiry" i]',
          'input[name*="expiry" i]',
          'input[name*="expiration" i]'
        ].join(', ')
      )
      .last();
  }

  async selectPreferredOption(
    select: Locator,
    preferredValues:
      readonly string[]
  ): Promise<string> {
    const options =
      await select
        .locator(
          'option'
        )
        .evaluateAll(
          items =>
            items.map(
              item => ({
                text:
                  (
                    item.textContent ??
                    ''
                  ).trim(),
                value:
                  (
                    item as HTMLOptionElement
                  ).value,
                disabled:
                  (
                    item as HTMLOptionElement
                  ).disabled
              })
            )
        );

    for (
      const preferred of
      preferredValues
    ) {
      const match =
        options.find(
          option =>
            option.value &&
            !option.disabled &&
            option.text
              .toLowerCase()
              .includes(
                preferred.toLowerCase()
              )
        );

      if (
        match
      ) {
        await select
          .selectOption(
            match.value
          );

        return match.text;
      }
    }

    const fallback =
      options.find(
        option =>
          option.value &&
          option.value !==
            '0' &&
          !option.disabled
      );

    if (
      !fallback
    ) {
      throw new Error(
        'No selectable criterion value was found.'
      );
    }

    await select
      .selectOption(
        fallback.value
      );

    return fallback.text;
  }

  async addCriterion(
    key: string,
    preferredValues:
      readonly string[]
  ): Promise<void> {
    await this.page
      .getByRole(
        'button',
        {
          name:
            /^Add criteria$/i
        }
      )
      .click();

    const dropdowns =
      this.page
        .getByRole(
          'combobox'
        );

    const count =
      await dropdowns.count();

    const typeDropdown =
      dropdowns.nth(
        count - 2
      );

    const valueDropdown =
      dropdowns.nth(
        count - 1
      );

    await expect(
      typeDropdown
    ).toBeVisible({
      timeout:
        20_000
    });

    await typeDropdown
      .selectOption(
        key
      );

    await expect(
      valueDropdown
    ).toBeEnabled({
      timeout:
        20_000
    });

    const selectedValue =
      await this.selectPreferredOption(
        valueDropdown,
        preferredValues
      );

    console.log(
      `✅ Voucher criterion added: ${key} = ${selectedValue}`
    );
  }

  async fillValid(
    overrides: {
      campaignName?: string;
      value?: string;
      quantity?: string;
      expiryDate?: Date;
      includeCriteria?: boolean;
    } = {}
  ): Promise<void> {
    const data =
      TEST_DATA.liveFlow.voucher;

    await this.selectCampaign(
      overrides.campaignName
    );

    const textboxes =
      this.voucherTextboxes();

    await textboxes
      .nth(0)
      .fill(
        overrides.value ??
        data.value
      );

    await textboxes
      .nth(1)
      .fill(
        overrides.quantity ??
        data.quantity
      );

    await fillNativeDate(
      this.expiryDate(),
      overrides.expiryDate ??
      offsetDate(
        data.expiryOffsetDays
      )
    );

    if (
      overrides.includeCriteria !==
      false
    ) {
      for (
        const criterion of
        data.criteria
      ) {
        await this.addCriterion(
          criterion.key,
          criterion.preferredValues
        );
      }
    }
  }

  submitButton(): Locator {
    return this.page
      .getByRole(
        'button',
        {
          name:
            /^Generate Vouchers$/i
        }
      )
      .last();
  }

  async attemptSubmit(): Promise<void> {
    const button =
      this.submitButton();

    if (
      !await button
        .isEnabled()
        .catch(
          () => false
        )
    ) {
      return;
    }

    await button.click();
  }

  async submit(): Promise<void> {
    await this.submitButton()
      .click();
  }
}
