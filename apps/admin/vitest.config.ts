import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    globals: true,
    // E2E/Integration setup() starts Nuxt server — needs long hook timeout
    hookTimeout: 180_000,
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node'
        }
      },
      {
        test: {
          name: 'integration',
          include: ['test/integration/**/*.{test,spec}.ts'],
          environment: 'node',
          setupTimeout: 120_000,
          hookTimeout: 180_000,
          fileParallelism: false
        }
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          environment: 'node',
          setupTimeout: 120_000,
          hookTimeout: 180_000,
          fileParallelism: false
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt'
        }
      })
    ]
  }
})
