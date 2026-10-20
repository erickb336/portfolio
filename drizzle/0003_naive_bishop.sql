CREATE TABLE `workstation_agent_daily` (
	`usage_date` text PRIMARY KEY NOT NULL,
	`peak` integer NOT NULL,
	`partial` integer NOT NULL
);
