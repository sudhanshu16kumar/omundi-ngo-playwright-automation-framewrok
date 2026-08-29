import {
  expect,
  type Page
} from '@playwright/test';

import {
  TEST_DATA
} from '../../config/test-data';

export class SignupAddressPage {
  constructor(
    private readonly page: Page
  ) {}

  async expectLoaded(): Promise<void> {
    await expect(
      this.page
        .getByRole(
          'textbox',
          {
            name:
              'Enter Street Address'
          }
        )
    ).toBeVisible({
      timeout: 30_000
    });
  }

  async fill(): Promise<void> {
    const data =
      TEST_DATA.account
        .signup.address;

    await this.page
      .getByRole(
        'textbox',
        {
          name:
            'Enter Street Address'
        }
      )
      .fill(
        data.street
      );

    await this.page
      .getByRole(
        'textbox',
        {
          name:
            'Enter city'
        }
      )
      .fill(
        data.city
      );

    await this.page
      .getByRole(
        'textbox',
        {
          name:
            'Enter province or state'
        }
      )
      .fill(
        data.province
      );

    await this.page
      .getByRole(
        'textbox',
        {
          name:
            'Enter bairro'
        }
      )
      .fill(
        data.bairro
      );

    await this.page
      .getByRole(
        'textbox',
        {
          name:
            'Enter country'
        }
      )
      .fill(
        data.country
      );

    await this.page
      .getByRole(
        'textbox',
        {
          name:
            'https://yourwebsite.com'
        }
      )
      .fill(
        data.website
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
