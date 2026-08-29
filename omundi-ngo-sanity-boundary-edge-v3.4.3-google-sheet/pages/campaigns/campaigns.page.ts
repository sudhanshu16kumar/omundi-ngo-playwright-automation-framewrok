import {
  expect,
  type Page
} from '@playwright/test';

import {
  TEST_DATA
} from '../../config/test-data';

import {
  fillNativeDate,
  offsetDate
} from '../../helpers/date.helper';

import {
  uniqueSuffix
} from '../../helpers/common.helper';

export class CampaignsPage {
  constructor(
    private readonly page: Page
  ) {}

  async goto(): Promise<void> {
    if (this.page.isClosed()) {
      throw new Error('Cannot open Campaigns because the page is closed.');
    }

    await this.page.goto('/campaigns', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    });

    if (/\/login(?:[/?#]|$)/i.test(this.page.url())) {
      throw new Error(
        'Campaigns redirected to Login. Authentication did not complete or the session expired.'
      );
    }

    await expect(this.page).toHaveURL(
      /\/campaigns(?:[/?#]|$)/,
      { timeout: 30_000 }
    );
  }

  async openCreateForm(): Promise<void> {
    await this.goto();

    const create =
      this.page
        .getByRole(
          'link',
          {
            name:
              /Create New Campaign/i
          }
        )
        .or(
          this.page.getByRole(
            'button',
            {
              name:
                /Create New Campaign/i
            }
          )
        )
        .first();

    await expect(
      create
    ).toBeVisible();

    await create.click();

    await expect(
      this.nameInput()
    ).toBeVisible();
  }

  nameInput() {
    return this.page
      .getByRole(
        'textbox',
        {
          name:
            /Summer Crop Support/i
        }
      );
  }

  descriptionInput() {
    return this.page
      .getByRole(
        'textbox',
        {
          name:
            /Describe the purpose/i
        }
      );
  }

  regionInput() {
    return this.page
      .getByRole(
        'textbox',
        {
          name:
            /Western Cape|Benguela/i
        }
      );
  }

  cropInput() {
    return this.page
      .getByRole(
        'textbox',
        {
          name: /Maize/i
        }
      );
  }

  dateInputs() {
    /*
     * Preferred: native date inputs.
     * Fallbacks cover labelled/aria date controls if markup changes.
     */
    const nativeDates =
      this.page
        .locator(
          'input[type="date"]'
        );

    const labelledDates =
      this.page
        .locator(
          [
            'input[aria-label*="Start Date" i]',
            'input[aria-label*="End Date" i]',
            'input[name*="startDate" i]',
            'input[name*="endDate" i]',
            'input[name*="start_date" i]',
            'input[name*="end_date" i]'
          ].join(', ')
        );

    return nativeDates
      .or(
        labelledDates
      );
  }

  startDateInput() {
    return this.dateInputs()
      .nth(0);
  }

  endDateInput() {
    return this.dateInputs()
      .nth(1);
  }

  budgetInput() {
    return this.page
      .locator(
        'input[placeholder="0.00"]'
      )
      .last();
  }

  launchButton() {
    return this.page
      .getByRole(
        'button',
        {
          name:
            /Launch Campaign/i
        }
      );
  }

  async fillValid(
    overrides: {
      name?: string;
      description?: string;
      region?: string;
      crop?: string;
      budget?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<string> {
    const data =
      TEST_DATA.liveFlow
        .campaign;

    const name =
      overrides.name ??
      `${data.namePrefix} ${uniqueSuffix()}`;

    await this.nameInput()
      .fill(
        name
      );

    await this.descriptionInput()
      .fill(
        overrides.description ??
        data.description
      );

    await this.regionInput()
      .fill(
        overrides.region ??
        data.region
      );

    await this.cropInput()
      .fill(
        overrides.crop ??
        data.crop
      );

    await expect(
      this.dateInputs()
    ).toHaveCount(2);

    await fillNativeDate(
      this.startDateInput(),
      overrides.startDate ??
      offsetDate(
        data.startOffsetDays
      )
    );

    await fillNativeDate(
      this.endDateInput(),
      overrides.endDate ??
      offsetDate(
        data.endOffsetDays
      )
    );

    await this.budgetInput()
      .fill(
        overrides.budget ??
        data.budget
      );

    return name;
  }

  async launch(): Promise<void> {
    await this.launchButton()
      .click();
  }

  async expectCampaignVisible(
    campaignName: string
  ): Promise<void> {
    await expect(
      this.page.getByText(
        campaignName,
        {
          exact: false
        }
      )
    ).toBeVisible({
      timeout: 40_000
    });
  }
}
