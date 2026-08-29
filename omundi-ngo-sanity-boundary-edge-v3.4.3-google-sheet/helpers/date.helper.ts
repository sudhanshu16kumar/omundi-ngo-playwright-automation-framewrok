import {
  expect,
  type Locator
} from '@playwright/test';

export function offsetDate(
  days: number
): Date {
  const date = new Date();

  date.setHours(
    12,
    0,
    0,
    0
  );

  date.setDate(
    date.getDate() +
    days
  );

  return date;
}

export function toISODate(
  date: Date
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );

  return `${year}-${month}-${day}`;
}

async function setNativeDateValue(
  input: Locator,
  value: string
): Promise<void> {
  await input.evaluate(
    (
      element,
      dateValue
    ) => {
      const dateInput =
        element as HTMLInputElement;

      const nativeSetter =
        Object
          .getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
          )
          ?.set;

      if (!nativeSetter) {
        throw new Error(
          'Native HTMLInputElement value setter was not available.'
        );
      }

      nativeSetter.call(
        dateInput,
        dateValue
      );

      dateInput.dispatchEvent(
        new Event(
          'input',
          {
            bubbles: true
          }
        )
      );

      dateInput.dispatchEvent(
        new Event(
          'change',
          {
            bubbles: true
          }
        )
      );
    },
    value
  );
}

export async function fillNativeDate(
  input: Locator,
  date: Date
): Promise<void> {
  const value =
    toISODate(
      date
    );

  /*
   * The Omundi date control uses a hidden native input.
   * It must exist, but it is intentionally not visible.
   */
  await expect(
    input
  ).toHaveCount(
    1
  );

  const min =
    await input
      .getAttribute(
        'min'
      )
      .catch(
        () => null
      );

  const max =
    await input
      .getAttribute(
        'max'
      )
      .catch(
        () => null
      );

  if (
    min &&
    value < min
  ) {
    throw new Error(
      `Date ${value} is below input minimum ${min}. Use forceNativeDate() for a negative boundary case.`
    );
  }

  if (
    max &&
    value > max
  ) {
    throw new Error(
      `Date ${value} is above input maximum ${max}. Use forceNativeDate() for a negative boundary case.`
    );
  }

  await setNativeDateValue(
    input,
    value
  );

  await expect
    .poll(
      async () =>
        input.inputValue(),
      {
        timeout:
          10_000,
        message:
          `Waiting for date input to keep value ${value}`
      }
    )
    .toBe(
      value
    );

  console.log(
    `✅ Date successfully set: ${value}`
  );
}

export async function forceNativeDate(
  input: Locator,
  date: Date
): Promise<void> {
  const value =
    toISODate(
      date
    );

  await expect(
    input
  ).toHaveCount(
    1
  );

  await input.evaluate(
    (
      element,
      dateValue
    ) => {
      const dateInput =
        element as HTMLInputElement;

      const originalMin =
        dateInput.getAttribute(
          'min'
        );

      const originalMax =
        dateInput.getAttribute(
          'max'
        );

      dateInput.removeAttribute(
        'min'
      );

      dateInput.removeAttribute(
        'max'
      );

      const nativeSetter =
        Object
          .getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
          )
          ?.set;

      if (!nativeSetter) {
        throw new Error(
          'Native HTMLInputElement value setter was not available.'
        );
      }

      nativeSetter.call(
        dateInput,
        dateValue
      );

      dateInput.dispatchEvent(
        new Event(
          'input',
          {
            bubbles: true
          }
        )
      );

      dateInput.dispatchEvent(
        new Event(
          'change',
          {
            bubbles: true
          }
        )
      );

      if (
        originalMin !== null
      ) {
        dateInput.setAttribute(
          'min',
          originalMin
        );
      }

      if (
        originalMax !== null
      ) {
        dateInput.setAttribute(
          'max',
          originalMax
        );
      }
    },
    value
  );

  await expect
    .poll(
      async () =>
        input.inputValue(),
      {
        timeout:
          10_000,
        message:
          `Waiting for forced date input value ${value}`
      }
    )
    .toBe(
      value
    );

  console.log(
    `🧪 Boundary date successfully forced: ${value}`
  );
}
