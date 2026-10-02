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

export const workstationLive = sqliteTable('workstation_live', {
  id: integer('id').primaryKey(),
  observedAt: integer('observed_at_ms').notNull(),
  receivedAt: integer('received_at_ms').notNull(),
  leaseUntil: integer('lease_until_ms').notNull(),
  agentsActive: integer('agents_active'),
  agentsCoverage: text('agents_coverage').notNull(),
});
export const workstationDaily = sqliteTable('workstation_daily', {
  usageDate: text('usage_date').primaryKey(),
  input: integer('input'), cachedInput: integer('cached_input'),
  output: integer('output'), total: integer('total'),
  coverage: text('coverage').notNull(),
  observedAt: integer('observed_at_ms').notNull(),
  receivedAt: integer('received_at_ms').notNull(),
});
export const workstationRate = sqliteTable('workstation_rate', {
  id: integer('id').primaryKey(),
  events: text('events').notNull(),
});
