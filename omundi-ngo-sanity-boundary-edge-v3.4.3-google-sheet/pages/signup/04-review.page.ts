import {
  expect,
  type Page
} from '@playwright/test';

export class SignupReviewPage {
  constructor(
    private readonly page: Page
  ) {}

  async expectRegistrationSubmitted(
    timeout = 60_000
  ): Promise<void> {
    await expect(
      this.page
        .getByText(
          /Registration Submitted/i
        )
        .first()
    ).toBeVisible({
      timeout
    });

    await expect(
      this.page
        .getByText(
          /under review|pending approval/i
        )
        .first()
    ).toBeVisible({
      timeout: 30_000
    });
  }

  async goToLogin(): Promise<void> {
    const control =
      this.page
        .getByRole(
          'button',
          {
            name:
              /Go to Login/i
          }
        )
        .or(
          this.page.getByRole(
            'link',
            {
              name:
                /Go to Login/i
            }
          )
        )
        .first();

    if (
      await control
        .isVisible()
        .catch(() => false)
    ) {
      await control.click();
    } else {
      await this.page.goto(
        '/login'
      );
    }

    await expect(
      this.page
    ).toHaveURL(
      /\/login/
    );
  }
}
