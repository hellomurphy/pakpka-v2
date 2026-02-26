/**
 * Re-export monorepo schema so NuxtHub picks it up for @nuxthub/db.
 * Single source of truth: packages/database/schema.ts.
 * Use relative path so the bundler inlines the schema (avoids missing chunk-*.mjs with @nuxthub/db).
 */
export * from '../../../../packages/database/schema'
