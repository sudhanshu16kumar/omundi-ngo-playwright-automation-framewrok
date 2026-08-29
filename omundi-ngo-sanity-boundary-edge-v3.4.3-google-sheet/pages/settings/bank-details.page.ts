import {
  expect,
  type Locator,
  type Page
} from '@playwright/test';

import {
  TEST_DATA
} from '../../config/test-data';

export class BankDetailsPage {
  constructor(
    private readonly page: Page
  ) {}

  async goto(): Promise<void> {
    if (
      this.page.isClosed()
    ) {
      throw new Error(
        'Cannot open Bank Details because the Playwright page is closed.'
      );
    }

    await this.page.goto(
      '/settings',
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
        'Settings redirected to Login. Authentication did not complete or the session expired.'
      );
    }

    await expect(
      this.page
        .getByRole('main')
        .getByRole(
          'heading',
          {
            name:
              /^Settings$/i
          }
        )
    ).toBeVisible({
      timeout:
        30_000
    });

    const bankTab =
      this.page
        .getByRole(
          'button',
          {
            name:
              /^Bank Details$/i
          }
        )
        .or(
          this.page.getByRole(
            'tab',
            {
              name:
                /^Bank Details$/i
            }
          )
        )
        .or(
          this.page.getByText(
            /^Bank Details$/i
          )
        )
        .first();

    await expect(
      bankTab
    ).toBeVisible({
      timeout:
        30_000
    });

    await bankTab.click();

    await expect(
      this.page
        .getByText(
          /Bank Account Details/i
        )
        .first()
    ).toBeVisible({
      timeout:
        30_000
    });

    console.log(
      '✅ Bank Details section opened successfully.'
    );
  }

  private fieldByLabelOrSelectors(
    label: RegExp,
    selectors: string
  ): Locator {
    return this.page
      .getByLabel(
        label
      )
      .first()
      .or(
        this.page
          .locator(
            selectors
          )
          .first()
      )
      .or(
        this.page
          .locator(
            'label'
          )
          .filter({
            hasText:
              label
          })
          .locator(
            'xpath=following::*[self::input or self::select or self::textarea][1]'
          )
          .first()
      )
      .first();
  }

  bankNameInput(): Locator {
    return this.fieldByLabelOrSelectors(
      /Bank Name/i,
      [
        'input[name*="bankName" i]',
        'input[name*="bank_name" i]',
        'input[placeholder*="bank name" i]'
      ].join(', ')
    );
  }

  accountHolderInput(): Locator {
    return this.fieldByLabelOrSelectors(
      /Account Holder Name|Account Holder/i,
      [
        'input[name*="holder" i]',
        'input[name*="accountHolder" i]',
        'input[placeholder*="account holder" i]'
      ].join(', ')
    );
  }

  accountNumberInput(): Locator {
    return this.fieldByLabelOrSelectors(
      /Account Number/i,
      [
        'input[name*="accountNumber" i]',
        'input[name*="account_number" i]',
        'input[placeholder*="account number" i]'
      ].join(', ')
    );
  }

  accountTypeControl(): Locator {
    return this.fieldByLabelOrSelectors(
      /Account Type/i,
      [
        'select[name*="accountType" i]',
        'select[name*="account_type" i]',
        'input[name*="accountType" i]',
        'input[name*="account_type" i]',
        'input[placeholder*="account type" i]'
      ].join(', ')
    );
  }

  branchInput(): Locator {
    return this.fieldByLabelOrSelectors(
      /Branch Name|Branch/i,
      [
        'input[name*="branch" i]',
        'input[placeholder*="branch" i]'
      ].join(', ')
    );
  }

  swiftInput(): Locator {
    return this.fieldByLabelOrSelectors(
      /SWIFT|BIC/i,
      [
        'input[name*="swift" i]',
        'input[name*="bic" i]',
        'input[placeholder*="swift" i]',
        'input[placeholder*="bic" i]'
      ].join(', ')
    );
  }

  private async currentBankEvidenceConfigured(): Promise<boolean> {
    const bankName =
      this.bankNameInput();

    if (
      await bankName
        .isVisible()
        .catch(
          () => false
        )
    ) {
      const value =
        (
          await bankName
            .inputValue()
            .catch(
              () => ''
            )
        ).trim();

      if (
        value
      ) {
        return true;
      }
    }

    const knownBankValue =
      this.page
        .getByText(
          TEST_DATA.liveFlow
            .bankDetails
            .bankName,
          {
            exact:
              true
          }
        )
        .first();

    return await knownBankValue
      .isVisible()
      .catch(
        () => false
      );
  }

  async isConfigured(): Promise<boolean> {
    await this.goto();

    const noDetails =
      this.page
        .getByText(
          /No bank account configured yet|No bank details configured/i
        )
        .first();

    if (
      await noDetails
        .isVisible()
        .catch(
          () => false
        )
    ) {
      return false;
    }

    return this.currentBankEvidenceConfigured();
  }

  private async enterEditModeIfNeeded(): Promise<void> {
    const bankName =
      this.bankNameInput();

    if (
      await bankName
        .isEditable()
        .catch(
          () => false
        )
    ) {
      return;
    }

    const editControl =
      this.page
        .getByRole(
          'button',
          {
            name:
              /Add Bank Details|Configure Bank|Edit Bank Details|Edit|Update/i
          }
        )
        .or(
          this.page.getByRole(
            'link',
            {
              name:
                /Add Bank Details|Configure Bank|Edit Bank Details|Edit|Update/i
            }
          )
        )
        .first();

    if (
      await editControl
        .isVisible()
        .catch(
          () => false
        )
    ) {
      await editControl.click();
    }

    await expect(
      this.bankNameInput()
    ).toBeEditable({
      timeout:
        20_000
    });
  }

  private async fillAccountType(
    value: string
  ): Promise<void> {
    const control =
      this.accountTypeControl();

    await expect(
      control
    ).toBeVisible({
      timeout:
        20_000
    });

    const tagName =
      await control.evaluate(
        element =>
          element.tagName.toLowerCase()
      );

    if (
      tagName ===
      'select'
    ) {
      const options =
        await control
          .locator(
            'option'
          )
          .allTextContents();

      const match =
        options.find(
          option =>
            option
              .trim()
              .toLowerCase()
              .includes(
                value.toLowerCase()
              )
        );

      if (
        match
      ) {
        await control
          .selectOption({
            label:
              match.trim()
          });

        return;
      }

      const fallback =
        await control
          .locator(
            'option'
          )
          .evaluateAll(
            items =>
              items
                .map(
                  item => ({
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
                .find(
                  item =>
                    item.value &&
                    !item.disabled
                )?.value
          );

      if (
        !fallback
      ) {
        throw new Error(
          'No selectable Account Type option was found.'
        );
      }

      await control.selectOption(
        fallback
      );

      return;
    }

    await control.fill(
      value
    );
  }

  private async checkConfirmationIfPresent(): Promise<void> {
    const checkbox =
      this.page
        .getByRole(
          'checkbox',
          {
            name:
              /I confirm that the bank account details provided belong to my organization and are correct/i
          }
        )
        .or(
          this.page
            .getByRole(
              'checkbox'
            )
            .first()
        )
        .first();

    if (
      await checkbox
        .isVisible()
        .catch(
          () => false
        )
    ) {
      if (
        !await checkbox.isChecked()
      ) {
        await checkbox.check();
      }
    }
  }

  async configure(): Promise<void> {
    await this.goto();

    if (
      await this.currentBankEvidenceConfigured()
    ) {
      console.log(
        '✅ Bank Details already configured. No update required.'
      );

      return;
    }

    console.log(
      'ℹ Bank Details are empty. Configuring them now.'
    );

    await this.enterEditModeIfNeeded();

    const data =
      TEST_DATA.liveFlow.bankDetails;

    await this.bankNameInput()
      .fill(
        data.bankName
      );

    await this.accountHolderInput()
      .fill(
        data.accountHolderName
      );

    await this.accountNumberInput()
      .fill(
        data.accountNumber
      );

    await this.fillAccountType(
      data.accountType
    );

    await this.branchInput()
      .fill(
        data.branchName
      );

    await this.swiftInput()
      .fill(
        data.swiftBic
      );

    await this.checkConfirmationIfPresent();

    const saveButton =
      this.page
        .getByRole(
          'button',
          {
            name:
              /Save Details|Save Changes|Save Bank Details|Save|Update Bank Details|Update|Submit/i
          }
        )
        .last();

    await saveButton
      .scrollIntoViewIfNeeded();

    await expect(
      saveButton
    ).toBeVisible({
      timeout:
        20_000
    });

    await expect(
      saveButton
    ).toBeEnabled();

    console.log(
      '✅ Bank Details filled. Saving now.'
    );

    /*
     * Start listening BEFORE clicking Save.
     * The predicate is deliberately tied to the current Bank data so
     * unrelated background requests are not mistaken for the save call.
     */
    const saveResponsePromise =
      this.page
        .waitForResponse(
          response => {
            const request =
              response.request();

            const method =
              request
                .method()
                .toUpperCase();

            if (
              ![
                'POST',
                'PUT',
                'PATCH'
              ].includes(
                method
              )
            ) {
              return false;
            }

            const body =
              request.postData() ?? '';

            return (
              /bank/i.test(
                response.url()
              ) ||
              body.includes(
                data.accountNumber
              ) ||
              body.includes(
                data.bankName
              )
            );
          },
          {
            timeout:
              30_000
          }
        )
        .catch(
          () => null
        );

    await saveButton.click();

    const saveResponse =
      await saveResponsePromise;

    if (
      saveResponse
    ) {
      console.log(
        `Bank Details API status: ${saveResponse.status()}`
      );

      expect(
        saveResponse.ok(),
        `Bank Details save API returned HTTP ${saveResponse.status()}`
      ).toBe(true);
    } else {
      console.log(
        'ℹ No Bank Details API response was matched. Verifying persisted UI state directly.'
      );
    }

    /*
     * Keep the successful API check above, then use the same
     * lightweight persistence evidence as the known-good v3.1 build:
     * a populated Bank Name field or the saved Bank Name rendered in UI.
     *
     * Do not require every editable field to be repopulated after Save;
     * this screen does not reliably expose all saved fields after reload.
     */
    await expect
      .poll(
        async () => {
          await this.goto();

          return this.currentBankEvidenceConfigured();
        },
        {
          timeout:
            40_000,
          intervals: [
            1_000,
            2_000,
            3_000,
            5_000
          ],
          message:
            'Waiting for saved Bank Details to persist.'
        }
      )
      .toBe(true);

    console.log(
      '✅ Bank Details saved and verified successfully.'
    );
  }
}
