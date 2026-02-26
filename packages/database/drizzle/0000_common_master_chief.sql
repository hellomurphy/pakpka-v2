CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_provider_provider_account_id` ON `account` (`provider`,`provider_account_id`);--> statement-breakpoint
CREATE TABLE `amenity` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `amenity_name_unique` ON `amenity` (`name`);--> statement-breakpoint
CREATE TABLE `billing_run` (
	`id` text PRIMARY KEY NOT NULL,
	`period` text NOT NULL,
	`status` text DEFAULT 'PENDING_METER_READING',
	`property_id` text NOT NULL,
	`total_contracts` integer NOT NULL,
	`meter_reading_required` integer NOT NULL,
	`executed_by_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `billing_run_property_id` ON `billing_run` (`property_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `billing_run_property_id_period` ON `billing_run` (`property_id`,`period`);--> statement-breakpoint
CREATE TABLE `contract` (
	`id` text PRIMARY KEY NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`status` text DEFAULT 'ACTIVE',
	`water_billing_type` text NOT NULL,
	`waterRate` text NOT NULL,
	`waterMinimumCharge` text NOT NULL,
	`electricity_billing_type` text NOT NULL,
	`electricityRate` text NOT NULL,
	`electricityMinimumCharge` text NOT NULL,
	`rentAmount` text NOT NULL,
	`room_id` text NOT NULL,
	`property_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contract_room_id` ON `contract` (`room_id`);--> statement-breakpoint
CREATE INDEX `contract_property_id` ON `contract` (`property_id`);--> statement-breakpoint
CREATE INDEX `contract_property_id_status` ON `contract` (`property_id`,`status`);--> statement-breakpoint
CREATE INDEX `contract_property_id_end_date` ON `contract` (`property_id`,`end_date`);--> statement-breakpoint
CREATE INDEX `contract_property_id_status_end_date` ON `contract` (`property_id`,`status`,`end_date`);--> statement-breakpoint
CREATE TABLE `contract_service` (
	`id` text PRIMARY KEY NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`status` text DEFAULT 'ACTIVE',
	`customPrice` text,
	`contract_id` text NOT NULL,
	`service_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contract_service_contract_id` ON `contract_service` (`contract_id`);--> statement-breakpoint
CREATE INDEX `contract_service_service_id` ON `contract_service` (`service_id`);--> statement-breakpoint
CREATE TABLE `contract_tenant` (
	`contract_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`is_primary` integer DEFAULT false,
	PRIMARY KEY(`contract_id`, `tenant_id`)
);
--> statement-breakpoint
CREATE INDEX `contract_tenant_tenant_id` ON `contract_tenant` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `contract_tenant_contract_id_is_primary` ON `contract_tenant` (`contract_id`,`is_primary`);--> statement-breakpoint
CREATE TABLE `contract_termination` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`reason` text NOT NULL,
	`terminated_date` integer NOT NULL,
	`notes` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contract_termination_contract_id_unique` ON `contract_termination` (`contract_id`);--> statement-breakpoint
CREATE TABLE `deposit` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` text NOT NULL,
	`received_date` integer NOT NULL,
	`refunded_date` integer,
	`deductions` text DEFAULT '0',
	`deduction_notes` text,
	`contract_id` text NOT NULL,
	`clearance_status` text DEFAULT 'PENDING_ROOM_CHECK'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deposit_contract_id_unique` ON `deposit` (`contract_id`);--> statement-breakpoint
CREATE TABLE `floor` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`floor_number` integer NOT NULL,
	`property_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `floor_property_id_floor_number` ON `floor` (`property_id`,`floor_number`);--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'PENDING',
	`name_for_reference` text,
	`invited_by_id` text NOT NULL,
	`accepted_by_user_id` text,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer
);
--> statement-breakpoint
CREATE INDEX `invitation_property_id` ON `invitation` (`property_id`);--> statement-breakpoint
CREATE INDEX `invitation_invited_by_id` ON `invitation` (`invited_by_id`);--> statement-breakpoint
CREATE INDEX `invitation_accepted_by_user_id` ON `invitation` (`accepted_by_user_id`);--> statement-breakpoint
CREATE TABLE `invoice` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`period` text NOT NULL,
	`totalAmount` text NOT NULL,
	`due_date` integer NOT NULL,
	`status` text DEFAULT 'DRAFT',
	`contract_id` text NOT NULL,
	`billing_run_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `invoice_property_id` ON `invoice` (`property_id`);--> statement-breakpoint
CREATE INDEX `invoice_billing_run_id` ON `invoice` (`billing_run_id`);--> statement-breakpoint
CREATE INDEX `invoice_contract_id` ON `invoice` (`contract_id`);--> statement-breakpoint
CREATE TABLE `invoice_item` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`amount` text NOT NULL,
	`invoice_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `invoice_item_invoice_id` ON `invoice_item` (`invoice_id`);--> statement-breakpoint
CREATE TABLE `maintenance_request` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'PENDING',
	`priority` text,
	`due_date` integer,
	`room_id` text NOT NULL,
	`reported_by_contract_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `maintenance_request_room_id` ON `maintenance_request` (`room_id`);--> statement-breakpoint
CREATE INDEX `maintenance_request_reported_by_contract_id` ON `maintenance_request` (`reported_by_contract_id`);--> statement-breakpoint
CREATE TABLE `meter_reading` (
	`id` text PRIMARY KEY NOT NULL,
	`utility_type` text NOT NULL,
	`readingValue` text NOT NULL,
	`reading_date` integer NOT NULL,
	`invoice_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `meter_reading_invoice_id` ON `meter_reading` (`invoice_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `meter_reading_invoice_id_utility_type` ON `meter_reading` (`invoice_id`,`utility_type`);--> statement-breakpoint
CREATE TABLE `meter_reading_photo` (
	`id` text PRIMARY KEY NOT NULL,
	`image_url` text NOT NULL,
	`ai_detected_value` real,
	`is_verified_by_admin` integer DEFAULT false,
	`meter_reading_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `meter_reading_photo_meter_reading_id` ON `meter_reading_photo` (`meter_reading_id`);--> statement-breakpoint
CREATE TABLE `payment` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` text NOT NULL,
	`payment_date` integer NOT NULL,
	`status` text DEFAULT 'PENDING',
	`notes` text,
	`invoice_id` text NOT NULL,
	`payment_method` text NOT NULL,
	`receiving_account_id` text,
	`slip_url` text,
	`verified_by_user_id` text,
	`gateway_provider` text,
	`gateway_transaction_id` text,
	`gateway_response` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_gateway_transaction_id_unique` ON `payment` (`gateway_transaction_id`);--> statement-breakpoint
CREATE INDEX `payment_invoice_id` ON `payment` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `payment_gateway_transaction_id` ON `payment` (`gateway_transaction_id`);--> statement-breakpoint
CREATE TABLE `property` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`room_naming_format` text DEFAULT 'ALPHA_NUMERIC',
	`room_turnover_days` integer DEFAULT 3,
	`contract_ending_soon_days` integer DEFAULT 60,
	`default_water_billing_type` text DEFAULT 'FLAT_RATE',
	`defaultWaterRate` text DEFAULT '150',
	`defaultWaterMinimumCharge` text DEFAULT '100',
	`default_electricity_billing_type` text DEFAULT 'PER_UNIT',
	`defaultElectricityRate` text DEFAULT '8',
	`defaultElectricityMinimumCharge` text DEFAULT '0',
	`default_billing_cutoff_day` integer DEFAULT 28,
	`default_payment_due_days` integer DEFAULT 7,
	`late_fee_enabled` integer DEFAULT true,
	`late_fee_type` text DEFAULT 'FIXED',
	`lateFeeValue` text DEFAULT '100',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `property_staff` (
	`user_id` text NOT NULL,
	`property_id` text NOT NULL,
	`role` text DEFAULT 'STAFF',
	PRIMARY KEY(`user_id`, `property_id`)
);
--> statement-breakpoint
CREATE TABLE `receiving_account` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`details` text NOT NULL,
	`is_active` integer DEFAULT true,
	`property_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `receiving_account_property_id` ON `receiving_account` (`property_id`);--> statement-breakpoint
CREATE TABLE `reservation` (
	`id` text PRIMARY KEY NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`status` text DEFAULT 'PENDING',
	`property_id` text NOT NULL,
	`room_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reservation_property_id` ON `reservation` (`property_id`);--> statement-breakpoint
CREATE INDEX `reservation_room_id` ON `reservation` (`room_id`);--> statement-breakpoint
CREATE INDEX `reservation_tenant_id` ON `reservation` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `reservation_room_id_status` ON `reservation` (`room_id`,`status`);--> statement-breakpoint
CREATE TABLE `room` (
	`id` text PRIMARY KEY NOT NULL,
	`room_number` text NOT NULL,
	`status` text DEFAULT 'AVAILABLE',
	`room_type_id` text NOT NULL,
	`property_id` text NOT NULL,
	`floor_id` text DEFAULT '',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `room_room_type_id` ON `room` (`room_type_id`);--> statement-breakpoint
CREATE INDEX `room_floor_id` ON `room` (`floor_id`);--> statement-breakpoint
CREATE INDEX `room_property_id_status` ON `room` (`property_id`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `room_property_id_room_number` ON `room` (`property_id`,`room_number`);--> statement-breakpoint
CREATE TABLE `room_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`status` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`notes` text
);
--> statement-breakpoint
CREATE INDEX `room_status_history_room_id` ON `room_status_history` (`room_id`);--> statement-breakpoint
CREATE TABLE `room_type` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`basePrice` text NOT NULL,
	`deposit` text NOT NULL,
	`property_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `room_type_property_id` ON `room_type` (`property_id`);--> statement-breakpoint
CREATE TABLE `room_type_amenity` (
	`room_type_id` text NOT NULL,
	`amenity_id` text NOT NULL,
	PRIMARY KEY(`room_type_id`, `amenity_id`)
);
--> statement-breakpoint
CREATE TABLE `service` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`defaultPrice` text NOT NULL,
	`billing_cycle` text NOT NULL,
	`property_id` text NOT NULL,
	`is_optional` integer DEFAULT true,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `service_property_id` ON `service` (`property_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `service_property_id_name` ON `service` (`property_id`,`name`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`session_token` text NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_session_token_unique` ON `session` (`session_token`);--> statement-breakpoint
CREATE TABLE `tenant` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`status` text DEFAULT 'WAITING_LIST',
	`property_id` text NOT NULL,
	`user_id` text,
	`desired_room_type_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_user_id_unique` ON `tenant` (`user_id`);--> statement-breakpoint
CREATE INDEX `tenant_desired_room_type_id` ON `tenant` (`desired_room_type_id`);--> statement-breakpoint
CREATE INDEX `tenant_property_id` ON `tenant` (`property_id`);--> statement-breakpoint
CREATE INDEX `tenant_property_id_status` ON `tenant` (`property_id`,`status`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`username` text,
	`email` text,
	`avatar_url` text,
	`image` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification_token` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verification_token_token_unique` ON `verification_token` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `verification_token_identifier_token` ON `verification_token` (`identifier`,`token`);