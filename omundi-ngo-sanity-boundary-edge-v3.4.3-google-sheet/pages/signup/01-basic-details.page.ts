import {
  expect,
  type Page
} from '@playwright/test';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  verifyOtpModal
} from '../../helpers/otp.helper';

export class SignupBasicDetailsPage {
  constructor(
    private readonly page: Page
  ) {}

  organizationName() {
    return this.page
      .getByRole(
        'textbox',
        {
          name:
            'Enter Organization Name'
        }
      );
  }

  registrationNumber() {
    return this.page
      .getByRole(
        'textbox',
        {
          name:
            'Enter Registration Number'
        }
      );
  }

  contactPerson() {
    return this.page
      .getByRole(
        'textbox',
        {
          name:
            'Enter Contact Person'
        }
      );
  }

  email() {
    return this.page
      .getByRole(
        'textbox',
        {
          name:
            'email@example.com'
        }
      );
  }

  password() {
    return this.page
      .locator(
        'input[type="password"], input[placeholder="••••••••"]'
      )
      .first();
  }

  async expectLoaded(): Promise<void> {
    await expect(
      this.page.getByRole(
        'heading',
        {
          name:
            /Create NGO Account/i
        }
      )
    ).toBeVisible();

    await expect(
      this.organizationName()
    ).toBeVisible();
  }

  async fill(): Promise<void> {
    const data =
      TEST_DATA.account
        .signup
        .basicDetails;

    await this.organizationName()
      .fill(
        data.organizationName
      );

    await this.registrationNumber()
      .fill(
        data.registrationNumber
      );

    await this.contactPerson()
      .fill(
        data.contactPerson
      );

    await this.email()
      .fill(
        TEST_DATA.account
          .email
      );

    await this.password()
      .fill(
        TEST_DATA.account
          .password
      );
  }

  async verifyEmail(): Promise<void> {
    await this.page
      .getByRole(
        'button',
        {
          name: /^Verify$/i
        }
      )
      .click();

    await verifyOtpModal(
      this.page,
      TEST_DATA.account.otp
    );
  }

  async continue(): Promise<void> {
    await this.page
      .getByRole(
        'button',
        {
          name: /^Continue$/i
        }
      )
      .click();
  }
}
