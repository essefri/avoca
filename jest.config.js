module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/test/mega/drivers/MySQL/MySQLConnection.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true, // Enable code coverage
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/modules/mega/drivers/MySQL/MySQLConnection.ts',
  ],
};
