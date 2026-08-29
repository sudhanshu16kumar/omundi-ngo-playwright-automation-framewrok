export async function waitForAdminApproval(
  timeoutMs: number
): Promise<void> {
  const totalSeconds = Math.ceil(
    timeoutMs / 1000
  );

  console.log(
    '\n============================================================'
  );

  console.log(
    'ACCOUNT SUBMITTED FOR ADMIN REVIEW'
  );

  console.log(
    `Automation will now wait ${totalSeconds} seconds for Admin approval.`
  );

  console.log(
    'Approve the NGO from the Admin Portal during this time.'
  );

  console.log(
    'No terminal input is required. The automation will continue automatically.'
  );

  console.log(
    '============================================================\n'
  );

  const startedAt =
    Date.now();

  let lastShown =
    totalSeconds;

  while (
    Date.now() -
      startedAt <
    timeoutMs
  ) {
    const elapsed =
      Date.now() -
      startedAt;

    const remaining =
      Math.max(
        0,
        Math.ceil(
          (
            timeoutMs -
            elapsed
          ) /
            1000
        )
      );

    if (
      remaining !==
        lastShown &&
      (
        remaining % 10 === 0 ||
        remaining <= 10
      )
    ) {
      console.log(
        `Admin approval wait: ${remaining}s remaining`
      );

      lastShown =
        remaining;
    }

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          1000
        )
    );
  }

  console.log(
    '\nApproval wait finished. Continuing automatically to Login verification...\n'
  );
}
