const {
  spawnSync
} = require('node:child_process');

const boundaryOnly =
  process.argv.includes(
    '--boundary-only'
  );

const stages =
  boundaryOnly
    ? [
        'test:campaign-boundary',
        'test:funds-boundary',
        'test:vouchers-boundary',
        'test:login-boundary'
      ]
    : [
        'account:setup',
        'test:happy-path',
        'test:campaign-boundary',
        'test:funds-boundary',
        'test:vouchers-boundary',
        'test:login-boundary',
        'test:edge'
      ];

const results = [];

for (
  const stage of stages
) {
  console.log(
    '\n============================================================'
  );

  console.log(
    `RUNNING: npm run ${stage}`
  );

  console.log(
    '============================================================\n'
  );

  const result =
    spawnSync(
      'npm',
      [
        'run',
        stage
      ],
      {
        stdio:
          'inherit',
        shell:
          true,
        env:
          process.env
      }
    );

  const code =
    typeof result.status ===
      'number'
      ? result.status
      : 1;

  results.push({
    stage,
    code
  });

  if (
    code !== 0
  ) {
    console.error(
      `\n❌ ${stage} failed with exit code ${code}.`
    );

    console.error(
      '➡ Continuing to the next test category.\n'
    );
  } else {
    console.log(
      `\n✅ ${stage} completed.\n`
    );
  }
}

console.log(
  '\n============================================================'
);

console.log(
  boundaryOnly
    ? 'BOUNDARY RUN FINISHED'
    : 'FULL NGO TEST RUN FINISHED'
);

console.log(
  '============================================================\n'
);

for (
  const result of results
) {
  console.log(
    `${result.code === 0 ? '✅' : '❌'} ${result.stage}`
  );
}

const failures =
  results.filter(
    result =>
      result.code !== 0
  );

if (
  failures.length
) {
  console.error(
    `\n${failures.length} stage(s) failed. Remaining stages were still executed.`
  );

  process.exitCode = 1;
} else {
  console.log(
    '\n✅ All selected test categories passed.'
  );
}
