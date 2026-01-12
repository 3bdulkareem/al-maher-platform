CREATE TABLE `corrections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recitationId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`feedback` text NOT NULL,
	`tajweedErrors` int NOT NULL DEFAULT 0,
	`pronunciationErrors` int NOT NULL DEFAULT 0,
	`memorizationErrors` int NOT NULL DEFAULT 0,
	`errorDetails` text,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verifiedByTeacher` int,
	`matchesConsensus` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `corrections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('new_recitation','review_completed','rank_upgrade','trust_update','correction_verified') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedId` int,
	`relatedType` enum('recitation','correction'),
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`surahName` varchar(100) NOT NULL,
	`surahNumber` int NOT NULL,
	`startVerse` int NOT NULL,
	`endVerse` int NOT NULL,
	`audioUrl` text NOT NULL,
	`audioKey` varchar(255) NOT NULL,
	`durationSeconds` int,
	`status` enum('pending_ai','ai_reviewed','pending_peers','under_review','completed','rejected') NOT NULL DEFAULT 'pending_ai',
	`aiAnalysis` text,
	`aiScore` decimal(5,2),
	`requiredReviews` int NOT NULL DEFAULT 3,
	`completedReviews` int NOT NULL DEFAULT 0,
	`finalScore` decimal(5,2),
	`finalFeedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surahs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` int NOT NULL,
	`nameArabic` varchar(100) NOT NULL,
	`nameEnglish` varchar(100) NOT NULL,
	`versesCount` int NOT NULL,
	`revelationType` enum('meccan','medinan') NOT NULL,
	CONSTRAINT `surahs_id` PRIMARY KEY(`id`),
	CONSTRAINT `surahs_number_unique` UNIQUE(`number`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `userRank` enum('student','bronze_reviewer','silver_reviewer','gold_reviewer','teacher') DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `trustScore` decimal(5,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalRecitations` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalCorrections` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `correctCorrections` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isOnline` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastActiveAt` timestamp;