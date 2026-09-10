CREATE TABLE `lesson_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`state` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `lesson_drafts_class_idx` ON `lesson_drafts` (`class_id`);