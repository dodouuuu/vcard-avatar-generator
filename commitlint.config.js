// prettier-ignore
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',      // new feature
        'fix',       // bug fix
        'docs',      // documentation
        'style',     // formatting (no logic change)
        'refactor',  // refactoring
        'perf',      // performance improvement
        'test',      // testing
        'chore',     // build/tool/dependency changes
        'ci',        // CI configuration
        'revert',    // rollback
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
}
