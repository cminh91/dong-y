-- Simplify IdCard and BankAccount models

-- Add new columns to id_cards table
ALTER TABLE `id_cards` ADD COLUMN `rejected_at` DATETIME(3) NULL;

-- Remove status column from id_cards (will be computed from timestamps)
ALTER TABLE `id_cards` DROP COLUMN `status`;

-- Remove isPrimary column from bank_accounts
ALTER TABLE `bank_accounts` DROP COLUMN `is_primary`;

-- Update existing data: set verifiedAt for VERIFIED records, rejectedAt for REJECTED records
-- Note: This assumes you want to preserve existing verification status
-- You may need to adjust this based on your current data
