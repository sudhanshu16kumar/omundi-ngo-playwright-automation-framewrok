import {
  test
} from '../../fixtures/auth.fixture';

import {
  TEST_DATA,
  type BoundaryCase
} from '../../config/test-data';

import {
  repeated
} from '../../helpers/common.helper';

import {
  offsetDate,
  forceNativeDate
} from '../../helpers/date.helper';

import {
  expectClientDecision
} from '../../helpers/write-guard.helper';

import {
  CampaignsPage
} from '../../pages/campaigns/campaigns.page';

test.describe(
  '@validation @boundary Campaign fields',
  () => {
    async function runFieldCase(
      page:
        import('@playwright/test').Page,
      field:
        | 'name'
        | 'description'
        | 'region'
        | 'crop'
        | 'budget',
      testCase:
        BoundaryCase
    ) {
      const campaigns =
        new CampaignsPage(
          page
        );

      await campaigns
        .openCreateForm();

      await campaigns
        .fillValid({
          [field]:
            testCase.value
        });

      await expectClientDecision(
        page,
        () =>
          campaigns.launch(),
        testCase.shouldBlock,
        `campaign ${field} ${testCase.name}`
      );
    }

    for (
      const testCase of
      TEST_DATA.boundaries
        .campaigns.name
    ) {
      test(
        `name: ${testCase.name}`,
        async ({
          authPage: page
        }) =>
          runFieldCase(
            page,
            'name',
            testCase
          )
      );
    }

    for (
      const testCase of
      TEST_DATA.boundaries
        .campaigns
        .description
    ) {
      test(
        `description: ${testCase.name}`,
        async ({
          authPage: page
        }) =>
          runFieldCase(
            page,
            'description',
            testCase
          )
      );
    }

    for (
      const testCase of
      TEST_DATA.boundaries
        .campaigns.region
    ) {
      test(
        `region: ${testCase.name}`,
        async ({
          authPage: page
        }) =>
          runFieldCase(
            page,
            'region',
            testCase
          )
      );
    }

    for (
      const testCase of
      TEST_DATA.boundaries
        .campaigns.crop
    ) {
      test(
        `crop: ${testCase.name}`,
        async ({
          authPage: page
        }) =>
          runFieldCase(
            page,
            'crop',
            testCase
          )
      );
    }

    for (
      const testCase of
      TEST_DATA.boundaries
        .campaigns.budget
    ) {
      test(
        `budget: ${testCase.name}`,
        async ({
          authPage: page
        }) =>
          runFieldCase(
            page,
            'budget',
            testCase
          )
      );
    }

    const maxCases = [
      {
        field:
          'name' as const,
        max:
          TEST_DATA.boundaries
            .campaigns.nameMax
      },
      {
        field:
          'description' as const,
        max:
          TEST_DATA.boundaries
            .campaigns
            .descriptionMax
      },
      {
        field:
          'region' as const,
        max:
          TEST_DATA.boundaries
            .campaigns.regionMax
      },
      {
        field:
          'crop' as const,
        max:
          TEST_DATA.boundaries
            .campaigns.cropMax
      }
    ];

    for (
      const config of
      maxCases
    ) {
      test(
        `${config.field}: maximum plus one`,
        async ({
          authPage: page
        }) => {
          const campaigns =
            new CampaignsPage(
              page
            );

          await campaigns
            .openCreateForm();

          await campaigns
            .fillValid({
              [config.field]:
                repeated(
                  config.max +
                  1
                )
            });

          await expectClientDecision(
            page,
            () =>
              campaigns.launch(),
            true,
            `campaign ${config.field} maximum plus one`
          );
        }
      );
    }

    test(
      'start date: past',
      async ({
        authPage: page
      }) => {
        const campaigns =
          new CampaignsPage(
            page
          );

        await campaigns
          .openCreateForm();

        await campaigns
          .fillValid({
            startDate:
              offsetDate(2),
            endDate:
              offsetDate(5)
          });

        await forceNativeDate(
          campaigns.startDateInput(),
          offsetDate(-1)
        );

        await expectClientDecision(
          page,
          () =>
            campaigns.launch(),
          TEST_DATA.boundaries
            .campaigns
            .dates
            .pastStartShouldBlock,
          'campaign past start date'
        );
      }
    );

    test(
      'date range: end before start',
      async ({
        authPage: page
      }) => {
        const campaigns =
          new CampaignsPage(
            page
          );

        await campaigns
          .openCreateForm();

        await campaigns
          .fillValid({
            startDate:
              offsetDate(10),
            endDate:
              offsetDate(5)
          });

        await expectClientDecision(
          page,
          () =>
            campaigns.launch(),
          TEST_DATA.boundaries
            .campaigns
            .dates
            .endBeforeStartShouldBlock,
          'campaign end before start'
        );
      }
    );

    test(
      'date range: same day',
      async ({
        authPage: page
      }) => {
        const campaigns =
          new CampaignsPage(
            page
          );

        await campaigns
          .openCreateForm();

        const same =
          offsetDate(5);

        await campaigns
          .fillValid({
            startDate:
              same,
            endDate:
              same
          });

        await expectClientDecision(
          page,
          () =>
            campaigns.launch(),
          TEST_DATA.boundaries
            .campaigns
            .dates
            .sameDayShouldBlock,
          'campaign same day dates'
        );
      }
    );
  }
);
