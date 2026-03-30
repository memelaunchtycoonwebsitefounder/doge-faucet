CREATE TABLE `faucet_user_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dogeAddress` varchar(34) NOT NULL,
	`currentStreak` int NOT NULL DEFAULT 0,
	`maxStreak` int NOT NULL DEFAULT 0,
	`lastClaimAt` timestamp,
	`totalEarned` varchar(32) NOT NULL DEFAULT '0',
	`referralEarnings` varchar(32) NOT NULL DEFAULT '0',
	`referralCount` int NOT NULL DEFAULT 0,
	`referralCode` varchar(16) NOT NULL,
	`referrerAddress` varchar(34),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faucet_user_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `faucet_user_stats_dogeAddress_unique` UNIQUE(`dogeAddress`),
	CONSTRAINT `faucet_user_stats_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerAddress` varchar(34) NOT NULL,
	`referredAddress` varchar(34) NOT NULL,
	`rewardAmount` varchar(32) NOT NULL DEFAULT '0.0067',
	`isPaid` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`paidAt` timestamp,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
