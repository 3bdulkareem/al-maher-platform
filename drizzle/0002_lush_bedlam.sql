CREATE TABLE `demoRecitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`surahName` varchar(100) NOT NULL,
	`surahNumber` int NOT NULL,
	`startVerse` int NOT NULL,
	`endVerse` int NOT NULL,
	`audioUrl` text NOT NULL,
	`audioKey` varchar(255) NOT NULL,
	`durationSeconds` int,
	`aiAnalysis` text,
	`aiScore` decimal(5,2),
	`userEmail` varchar(320),
	`userName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demoRecitations_id` PRIMARY KEY(`id`)
);
