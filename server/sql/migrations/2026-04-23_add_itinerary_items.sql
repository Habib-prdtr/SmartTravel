CREATE TABLE IF NOT EXISTS itinerary_items (
  id INT NOT NULL AUTO_INCREMENT,
  itinerary_day_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  location_name VARCHAR(150) DEFAULT NULL,
  start_time TIME DEFAULT NULL,
  end_time TIME DEFAULT NULL,
  activity_type VARCHAR(30) DEFAULT 'sightseeing',
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY itinerary_day_id (itinerary_day_id),
  CONSTRAINT itinerary_items_ibfk_1 FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days (id) ON DELETE CASCADE
);
