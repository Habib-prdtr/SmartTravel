SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'trips'
    AND COLUMN_NAME = 'deleted_at'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE trips ADD COLUMN deleted_at DATETIME NULL',
  'SELECT "column deleted_at already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
