CREATE TABLE IF NOT EXISTS events_types (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

INSERT INTO events_types
(name) VALUES
('Paro'),
('Presentacion'),
('Parcial'),
('Recuperatorio'),
('Vacaciones'),
('Mesas'),
('Otros'),
('Trabajo');