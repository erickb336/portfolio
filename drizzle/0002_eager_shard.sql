CREATE TABLE `workstation_daily` (
	`usage_date` text PRIMARY KEY NOT NULL,
	`input` integer,
	`cached_input` integer,
	`output` integer,
	`total` integer,
	`coverage` text NOT NULL,
	`observed_at_ms` integer NOT NULL,
	`received_at_ms` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workstation_live` (
	`id` integer PRIMARY KEY NOT NULL,
	`observed_at_ms` integer NOT NULL,
	`received_at_ms` integer NOT NULL,
	`lease_until_ms` integer NOT NULL,
	`agents_active` integer,
	`agents_coverage` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workstation_rate` (
	`id` integer PRIMARY KEY NOT NULL,
	`events` text NOT NULL
);
