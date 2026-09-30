import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const stravaState = sqliteTable('strava_state', {
  id: integer('id').primaryKey(),
  encrypted: text('encrypted').notNull(),
  feed: text('feed').notNull().default('[]'),
  syncedAt: integer('synced_at').notNull().default(0),
  revision: integer('revision').notNull().default(0),
  lockUntil: integer('lock_until').notNull().default(0),
});
export const stravaPending = sqliteTable('strava_pending', {
  state: text('state').primaryKey(),
  encrypted: text('encrypted').notNull(),
  expiresAt: integer('expires_at').notNull(),
});
