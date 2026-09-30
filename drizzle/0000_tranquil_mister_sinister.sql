CREATE TABLE `strava_pending` (
	`state` text PRIMARY KEY NOT NULL,
	`encrypted` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `strava_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`encrypted` text NOT NULL,
	`feed` text DEFAULT '[]' NOT NULL,
	`synced_at` integer DEFAULT 0 NOT NULL,
	`lock_until` integer DEFAULT 0 NOT NULL
);
