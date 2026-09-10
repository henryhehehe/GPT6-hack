CREATE TABLE `character_portraits` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`status` text NOT NULL,
	`lease` text NOT NULL,
	`updated_at` integer NOT NULL,
	`blob_key` text,
	`response_id` text,
	`model` text,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action
);
