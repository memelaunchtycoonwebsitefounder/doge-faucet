CREATE TABLE `miner_upgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dogeAddress` varchar(34) NOT NULL,
	`minerId` int NOT NULL,
	`fromTier` enum('basic','standard','premium','elite') NOT NULL,
	`toTier` enum('basic','standard','premium','elite') NOT NULL,
	`powerMultiplier` varchar(32) NOT NULL DEFAULT '3',
	`upgradeCost` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `miner_upgrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mining_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dogeAddress` varchar(34) NOT NULL,
	`sessionStartAt` timestamp NOT NULL DEFAULT (now()),
	`sessionExpiresAt` timestamp NOT NULL,
	`miningRate` varchar(32) NOT NULL,
	`totalMined` varchar(32) NOT NULL DEFAULT '0',
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mining_sessions_id` PRIMARY KEY(`id`)
);
