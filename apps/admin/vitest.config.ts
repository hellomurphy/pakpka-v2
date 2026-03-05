import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
          testTimeout: 10_000,
        },
      },
      {
        test: {
          name: 'integration',
          include: ['test/integration/**/*.{test,spec}.ts'],
          environment: 'node',
          setupTimeout: 90_000,
          hookTimeout: 90_000,
          testTimeout: 60_000,
          fileParallelism: false,
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          environment: 'node',
          setupTimeout: 90_000,
          hookTimeout: 90_000,
          testTimeout: 60_000,
          fileParallelism: false,
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
          testTimeout: 10_000,
        },
      }),
    ],
  },
})
