const fs = require('node:fs');
const path = require('node:path');

const stateFile =
  path.resolve(
    process.cwd(),
    'state/account-state.json'
  );

const dataFile =
  path.resolve(
    process.cwd(),
    'config/test-data.ts'
  );

function readState() {
  if (!fs.existsSync(stateFile)) {
    return {
      created: false,
      approved: false,
      email: null,
      approvedAt: null
    };
  }

  return JSON.parse(
    fs.readFileSync(
      stateFile,
      'utf8'
    )
  );
}

function extractConfiguredEmail() {
  const text =
    fs.readFileSync(
      dataFile,
      'utf8'
    );

  const match =
    text.match(
      /email:\s*'([^']+)'/
    );

  return match
    ? match[1]
    : null;
}

function writeState(state) {
  fs.mkdirSync(
    path.dirname(
      stateFile
    ),
    {
      recursive: true
    }
  );

  fs.writeFileSync(
    stateFile,
    JSON.stringify(
      state,
      null,
      2
    )
  );
}

const command =
  process.argv[2] ??
  'status';

if (command === 'status') {
  console.log(
    JSON.stringify(
      readState(),
      null,
      2
    )
  );

  process.exit(0);
}

if (command === 'approve') {
  const email =
    extractConfiguredEmail();

  writeState({
    created: true,
    approved: true,
    email,
    approvedAt:
      new Date().toISOString()
  });

  console.log(
    `Account marked approved locally: ${email}`
  );

  process.exit(0);
}

if (command === 'reset') {
  writeState({
    created: false,
    approved: false,
    email: null,
    approvedAt: null
  });

  const runState = path.resolve(process.cwd(), 'state/run-state.json');
  const observations = path.resolve(process.cwd(), 'state/setup-observations.json');

  fs.writeFileSync(runState, JSON.stringify({
    campaignName: null,
    transactionReference: null,
    seededAt: null
  }, null, 2));

  fs.writeFileSync(observations, '{}\n');

  console.log(
    'Local account/run state reset. account:setup will be allowed again.'
  );

  process.exit(0);
}

console.error(
  `Unknown command: ${command}`
);

process.exit(1);
