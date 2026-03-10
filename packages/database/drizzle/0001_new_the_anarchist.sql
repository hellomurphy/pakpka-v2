ALTER TABLE `payment` ADD `slip_key` text;--> statement-breakpoint
ALTER TABLE `payment` ADD `slip_status` text DEFAULT 'NONE';