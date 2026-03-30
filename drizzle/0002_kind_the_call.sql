CREATE TABLE `miners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dogeAddress` varchar(34) NOT NULL,
	`minerType` enum('basic','standard','premium','elite') NOT NULL,
	`cost` varchar(32) NOT NULL,
	`incomePerHour` varchar(32) NOT NULL,
	`totalIncome` varchar(32) NOT NULL DEFAULT '0',
	`lastCollectedAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `miners_id` PRIMARY KEY(`id`)
);
