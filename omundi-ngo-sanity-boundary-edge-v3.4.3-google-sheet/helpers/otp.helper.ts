import { expect, type Page } from '@playwright/test';

export async function fillSixDigitOtp(
  page: Page,
  otp: string
): Promise<void> {
  if (!/^\d{6}$/.test(otp)) {
    throw new Error(
      `Expected a 6-digit OTP but received "${otp}".`
    );
  }

  /**
   * First preference: OTP controls that explicitly use maxlength=1.
   */
  let otpInputs =
    page.locator(
      'input[maxlength="1"]:visible'
    );

  let count =
    await otpInputs.count();

  /**
   * Fallback for the current Omundi OTP modal:
   * take the final six visible text inputs, because the Signup/Login
   * page fields stay in the DOM behind the modal.
   */
  if (count < 6) {
    otpInputs =
      page.locator(
        'input[type="text"]:visible'
      );

    count =
      await otpInputs.count();

    if (count < 6) {
      throw new Error(
        `OTP modal is visible but only ${count} text inputs were found.`
      );
    }

    const start =
      count - 6;

    for (
      let index = 0;
      index < 6;
      index++
    ) {
      await otpInputs
        .nth(start + index)
        .fill(otp[index]);
    }

    return;
  }

  /**
   * When more than six one-character inputs exist, use the final six.
   */
  const start =
    count - 6;

  for (
    let index = 0;
    index < 6;
    index++
  ) {
    await otpInputs
      .nth(start + index)
      .fill(otp[index]);
  }
}

export async function verifyOtpModal(
  page: Page,
  otp: string
): Promise<void> {
  const verifyEmailButton =
    page.getByRole(
      'button',
      {
        name: /^Verify Email$/i
      }
    );

  await expect(
    verifyEmailButton
  ).toBeVisible({
    timeout: 30_000
  });

  await fillSixDigitOtp(
    page,
    otp
  );

  await verifyEmailButton.click();

  await expect(
    verifyEmailButton
  ).toBeHidden({
    timeout: 30_000
  });
}
