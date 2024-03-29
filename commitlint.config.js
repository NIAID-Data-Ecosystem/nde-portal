module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
  },
  ignores: [
    message => message.toUpperCase().includes('WIP'),
    message => message.includes('merge'),
  ],
};
