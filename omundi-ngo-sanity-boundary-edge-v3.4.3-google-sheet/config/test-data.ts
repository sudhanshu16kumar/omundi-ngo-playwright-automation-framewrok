export type BoundaryCase = {
  name: string;
  value: string;
  shouldBlock: boolean;
};

export const TEST_DATA = {
  browser: {
    width: 1100,
    height: 720
  },

  account: {
    /**
     * This exact email is used for the ONE-TIME signup in this framework.
     * The current testing environment uses the fixed OTP below.
     */
    email: 'kumar10@yopmil.com',
    password: 'Test@123',
    otp: '123456',

    signup: {
      basicDetails: {
        organizationName: 'Kumar Agricultural Foundation',
        registrationNumber: 'KAF-2026-0010',
        contactPerson: 'Kumar QA'
      },

      address: {
        street: '10 Agricultural Development Road',
        city: 'Huambo',
        province: 'Huambo',
        bairro: 'Sao Pedro',
        country: 'Angola',
        website: 'https://example.com'
      },

      documents: {
        businessRegistration:
          'assets/signup/business-registration-certificate.pdf',
        taxRegistration:
          'assets/signup/tax-registration-certificate.pdf',
        emptyPdf:
          'assets/signup/empty.pdf',
        nearTenMbPdf:
          'assets/signup/near-10mb.pdf',
        invalidText:
          'assets/signup/invalid-document.txt'
      },

      /*
       * After both documents are uploaded, the framework waits here
       * while YOU click Create Account manually.
       */
      manualCreateAccountTimeoutMs:
        5 * 60 * 1000
    }
  },

  approval: {
    timeoutMs: 30 * 1000
  },

  uiExpectations: {
    expectedSidebarGreen: '#0A7A3F',
    globalSearchPlaceholder: 'Search campaigns, vouchers, funds...',
    organizationName: 'Kumar Agricultural Foundation',
    campaignHeaders: [
      'Campaign Name',
      'Description',
      'Target Region',
      'Crop Type',
      'Budget Allocated',
      'Amount Used',
      'Status'
    ],
    allowedRegionPlaceholderTerms: ['Huambo', 'Benguela', 'Bié', 'Bie'],
    safeReferencePattern: /^[A-Za-z0-9/_-]+$/,
    swiftBicPattern: /^[A-Za-z0-9]{8}([A-Za-z0-9]{3})?$/
  },

  liveFlow: {
    bankDetails: {
      bankName: 'SBI',
      accountHolderName: 'Green Future Foundation',
      accountNumber: 'GFF123456789',
      accountType: 'Savings',
      branchName: 'Huambo',
      swiftBic: 'SBIAAOAX'
    },

    fund: {
      amount: '25000',
      transactionPrefix: 'TXN-2026',
      notes:
        'Seasonal test funding allocation for the Huambo maize farmer support campaign.'
    },

    campaign: {
      namePrefix: 'Kumar Huambo Maize Support',
      description:
        'Seasonal agricultural support campaign for eligible smallholder maize farmers in Huambo Province.',
      region: 'Huambo Province',
      crop: 'Maize',
      budget: '25000',
      startOffsetDays: 2,
      endOffsetDays: 30
    },

    voucher: {
      value: '150',
      quantity: '120',
      expiryOffsetDays: 60,
      criteria: [
        {
          key: 'regions',
          preferredValues: ['Bié', 'Bie']
        },
        {
          key: 'irrigationTypes',
          preferredValues: ['Rain-fed', 'Rainfed']
        },
        {
          key: 'primaryCrops',
          preferredValues: ['Maize']
        }
      ]
    }
  },

  boundaries: {
    login: {
      emailMax: 254,
      passwordMin: 8,
      passwordMax: 128,
      emailCases: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'whitespace only', value: '   ', shouldBlock: true },
        { name: 'missing at sign', value: 'qa.ngo.example.com', shouldBlock: true },
        { name: 'missing local part', value: '@example.com', shouldBlock: true },
        { name: 'missing domain', value: 'qa.ngo@', shouldBlock: true },
        { name: 'multiple at signs', value: 'qa@@example.com', shouldBlock: true },
        { name: 'valid plus alias', value: 'qa.ngo+boundary@example.com', shouldBlock: false },
        { name: 'valid uppercase', value: 'QA.NGO@EXAMPLE.COM', shouldBlock: false }
      ] satisfies BoundaryCase[],
      passwordCases: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'whitespace only', value: '        ', shouldBlock: true },
        { name: 'minimum minus one', value: 'Aa1!aaa', shouldBlock: true },
        { name: 'minimum', value: 'Aa1!aaaa', shouldBlock: false },
        { name: 'long valid password', value: 'Aa1!' + 'x'.repeat(60), shouldBlock: false }
      ] satisfies BoundaryCase[]
    },

    signup: {
      textMax: 100,
      websiteHttpsOnly: true,
      rejectNumericCountry: true,
      rejectNumericOnlyAddressFields: true,
      rejectEmptyFiles: true,
      fileSizeLimitMb: 10
    },

    funds: {
      amountMin: 0.01,
      amountMax: 999999999,
      amount: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'zero', value: '0', shouldBlock: true },
        { name: 'negative', value: '-1', shouldBlock: true },
        { name: 'minimum positive', value: '0.01', shouldBlock: false },
        { name: 'three decimal places', value: '0.001', shouldBlock: true },
        { name: 'large valid', value: '999999999', shouldBlock: false },
        { name: 'extremely large', value: '999999999999', shouldBlock: true },
        { name: 'scientific notation', value: '1e9', shouldBlock: true }
      ] satisfies BoundaryCase[],
      transactionReferenceMax: 100,
      transactionReference: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'whitespace only', value: '   ', shouldBlock: true },
        { name: 'single character', value: 'A', shouldBlock: false },
        { name: 'normal', value: 'TXN-2026-483920', shouldBlock: false }
      ] satisfies BoundaryCase[],
      notesMax: 500,
      notes: [
        { name: 'empty optional notes', value: '', shouldBlock: false },
        { name: 'whitespace notes', value: '   ', shouldBlock: false },
        { name: 'normal notes', value: 'QA test fund transfer reference.', shouldBlock: false }
      ] satisfies BoundaryCase[]
    },

    campaigns: {
      nameMax: 100,
      descriptionMax: 1000,
      regionMax: 100,
      cropMax: 100,
      rejectWhitespaceOnly: true,
      rejectDuplicateNames: true,
      rejectScriptInput: true,
      cropMustBeControlled: true,
      name: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'whitespace only', value: '   ', shouldBlock: true },
        { name: 'single character', value: 'A', shouldBlock: false },
        { name: 'normal', value: 'Huambo Maize Support', shouldBlock: false }
      ] satisfies BoundaryCase[],
      description: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'whitespace only', value: '   ', shouldBlock: true },
        { name: 'normal', value: 'Support eligible farmers during the current growing season.', shouldBlock: false }
      ] satisfies BoundaryCase[],
      region: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'whitespace only', value: '   ', shouldBlock: true },
        { name: 'normal', value: 'Huambo Province', shouldBlock: false }
      ] satisfies BoundaryCase[],
      crop: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'whitespace only', value: '   ', shouldBlock: true },
        { name: 'normal', value: 'Maize', shouldBlock: false }
      ] satisfies BoundaryCase[],
      budget: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'zero', value: '0', shouldBlock: true },
        { name: 'negative', value: '-1', shouldBlock: true },
        { name: 'minimum positive', value: '0.01', shouldBlock: false },
        { name: 'extremely large', value: '999999999999', shouldBlock: true }
      ] satisfies BoundaryCase[],
      dates: {
        pastStartShouldBlock: true,
        endBeforeStartShouldBlock: true,
        sameDayShouldBlock: true
      }
    },

    vouchers: {
      quantityIntegerOnly: true,
      campaignRequired: true,
      duplicateCriteriaShouldBlock: true,
      pastExpiryShouldBlock: true,
      todayExpiryShouldBlock: true,
      value: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'zero', value: '0', shouldBlock: true },
        { name: 'negative', value: '-1', shouldBlock: true },
        { name: 'minimum positive', value: '0.01', shouldBlock: false },
        { name: 'extremely large', value: '999999999999', shouldBlock: true }
      ] satisfies BoundaryCase[],
      quantity: [
        { name: 'empty', value: '', shouldBlock: true },
        { name: 'zero', value: '0', shouldBlock: true },
        { name: 'negative', value: '-1', shouldBlock: true },
        { name: 'decimal', value: '1.5', shouldBlock: true },
        { name: 'minimum', value: '1', shouldBlock: false },
        { name: 'extremely large', value: '999999999', shouldBlock: true }
      ] satisfies BoundaryCase[]
    },

    globalSearchMax: 200
  },

  securityPayloads: {
    xss: '<script>alert(1)</script>',
    html: '<img src=x onerror=alert(1)>',
    sql: "' OR 1=1 --",
    template: '{{7*7}}',
    pathTraversal: '../../../../etc/passwd'
  }
} as const;
