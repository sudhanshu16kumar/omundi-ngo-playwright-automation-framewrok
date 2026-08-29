import path from 'node:path';

import {
  expect,
  type Page
} from '@playwright/test';

import {
  TEST_DATA
} from '../../config/test-data';

export class SignupDocumentsPage {
  constructor(
    private readonly page: Page
  ) {}

  async expectLoaded(): Promise<void> {
    await expect(
      this.page
        .getByRole(
          'button',
          {
            name:
              /^Create Account$/i
          }
        )
    ).toBeVisible({
      timeout:
        30_000
    });

    await expect(
      this.page
        .locator(
          'input[type="file"]'
        )
    ).toHaveCount(
      2
    );
  }

  async uploadRequiredDocuments(): Promise<void> {
    const files =
      TEST_DATA.account.signup.documents;

    const fileInputs =
      this.page
        .locator(
          'input[type="file"]'
        );

    const businessPath =
      path.resolve(
        process.cwd(),
        files.businessRegistration
      );

    const taxPath =
      path.resolve(
        process.cwd(),
        files.taxRegistration
      );

    await fileInputs
      .nth(0)
      .setInputFiles(
        businessPath
      );

    await fileInputs
      .nth(1)
      .setInputFiles(
        taxPath
      );

    /*
     * React can recreate hidden file inputs after upload.
     * Verify the visible uploaded filenames instead of files.length.
     */
    await expect(
      this.page
        .getByText(
          /business-registration-certificate\.pdf/i
        )
        .first()
    ).toBeVisible({
      timeout:
        20_000
    });

    await expect(
      this.page
        .getByText(
          /tax-registration-certificate\.pdf/i
        )
        .first()
    ).toBeVisible({
      timeout:
        20_000
    });

    console.log(
      '✅ Both signup documents uploaded and verified.'
    );
  }

  async createAccount(): Promise<void> {
    const button =
      this.page
        .getByRole(
          'button',
          {
            name:
              /^Create Account$/i
          }
        );

    await expect(
      button
    ).toBeVisible({
      timeout:
        30_000
    });

    await expect(
      button
    ).toBeEnabled({
      timeout:
        30_000
    });

    await button.click();

    await expect(
      this.page
        .getByText(
          /Registration Submitted/i
        )
        .first()
    ).toBeVisible({
      timeout:
        60_000
    });
  }
}
