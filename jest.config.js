/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  transform: { 
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: '__tests__/tsconfig.json'
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^~/(.*)$': '<rootDir>/$1'
  },
  extensionsToTreatAsEsm: ['.ts']
};