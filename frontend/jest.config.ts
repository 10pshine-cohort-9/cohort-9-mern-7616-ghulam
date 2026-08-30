import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '\\.svg(\\?react)?$': '<rootDir>/test/mocks.tsx',
    '\\.(css|scss|less)$': '<rootDir>/test/styleMock.ts',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(react-router|react-router-dom)/)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['lcov', 'text'],
}

export default config
