import fs from 'node:fs';
import path from 'node:path';

export type AccountState = {
  created: boolean;
  approved: boolean;
  email: string | null;
  approvedAt: string | null;
};

const STATE_FILE =
  path.resolve(
    process.cwd(),
    'state/account-state.json'
  );

const DEFAULT_STATE: AccountState = {
  created: false,
  approved: false,
  email: null,
  approvedAt: null
};

export function readAccountState(): AccountState {
  if (
    !fs.existsSync(
      STATE_FILE
    )
  ) {
    return {
      ...DEFAULT_STATE
    };
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        STATE_FILE,
        'utf8'
      )
    ) as AccountState;
  } catch {
    return {
      ...DEFAULT_STATE
    };
  }
}

export function writeAccountState(
  state: AccountState
): void {
  fs.mkdirSync(
    path.dirname(
      STATE_FILE
    ),
    {
      recursive: true
    }
  );

  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(
      state,
      null,
      2
    )
  );
}

export function markAccountCreated(
  email: string
): void {
  writeAccountState({
    created: true,
    approved: false,
    email,
    approvedAt: null
  });
}

export function markAccountApproved(
  email: string
): void {
  writeAccountState({
    created: true,
    approved: true,
    email,
    approvedAt:
      new Date().toISOString()
  });
}

export function assertAccountApproved(
  expectedEmail: string
): void {
  const state =
    readAccountState();

  if (
    !state.approved ||
    state.email !==
      expectedEmail
  ) {
    throw new Error(
      [
        'The reusable NGO QA account is not marked as approved.',
        '',
        `Expected account: ${expectedEmail}`,
        '',
        'First-time setup:',
        '  npm run account:setup',
        '',
        'If the account already exists and is already approved:',
        '  npm run account:mark-approved'
      ].join('\n')
    );
  }
}
