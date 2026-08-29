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

export class LoginPage {
  constructor(
    private readonly page: Page
  ) {}

  async goto(): Promise<void> {
    await this.page.goto(
      '/login',
      {
        waitUntil: 'load'
      }
    );

    await expect(
      this.emailInput()
    ).toBeVisible();
  }

  emailInput() {
    return this.page
      .locator(
        'input[type="email"], input[placeholder="supplier@example.com"]'
      )
      .first();
  }

  passwordInput() {
    return this.page
      .locator(
        'input[type="password"], input[placeholder="••••••••"]'
      )
      .first();
  }

  loginButton() {
    return this.page
      .getByRole(
        'button',
        {
          name: /^Login$/i
        }
      );
  }

  async goToCreateAccount(): Promise<void> {
    await this.page
      .getByText(
        'Create Account',
        {
          exact: true
        }
      )
      .click();

    await expect(
      this.page
    ).toHaveURL(
      /\/signup/
    );
  }

  async fillCredentials(
    email = TEST_DATA.account.email,
    password = TEST_DATA.account.password
  ): Promise<void> {
    await this.emailInput()
      .fill(
        email
      );

    await this.passwordInput()
      .fill(
        password
      );
  }

  async submit(): Promise<void> {
    await this.loginButton()
      .click();
  }

  async completeLoginOtp(
    otp =
      TEST_DATA.account.otp
  ): Promise<void> {
    const verifyButton =
      this.page
        .getByRole(
          'button',
          {
            name: /^Verify Email$/i
          }
        );

    const fundsLink =
      this.page
        .getByRole(
          'link',
          {
            name: /^Funds$/i
          }
        );

    /**
     * Some test environments may skip OTP for an existing session.
     * Accept either the OTP modal or the authenticated sidebar.
     */
    await expect(
      verifyButton
        .or(
          fundsLink
        )
        .first()
    ).toBeVisible({
      timeout: 60_000
    });

    if (
      await verifyButton
        .isVisible()
        .catch(
          () => false
        )
    ) {
      await verifyOtpModal(
        this.page,
        otp
      );
    }
  }

  async expectDashboard(): Promise<void> {
    await expect(
      this.page
        .getByRole(
          'link',
          {
            name: /^Funds$/i
          }
        )
    ).toBeVisible({
      timeout: 60_000
    });

    await expect(
      this.page
    ).not.toHaveURL(
      /\/login(?:[/?#]|$)/
    );
  }

  async login(
    email = TEST_DATA.account.email,
    password = TEST_DATA.account.password,
    otp = TEST_DATA.account.otp
  ): Promise<void> {
    await this.goto();

    await this.fillCredentials(
      email,
      password
    );

    await this.submit();

    await this.completeLoginOtp(
      otp
    );

    await this.expectDashboard();
  }
}
