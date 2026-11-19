-- BANAFIBRE baseline schema for MySQL 8.0+
-- BACK UP your existing banafibre database before running this file.
-- CREATE TABLE IF NOT EXISTS does not alter an existing table.
-- If a table already exists, compare it with the application columns first.

CREATE DATABASE IF NOT EXISTS banafibre
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banafibre;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  image VARCHAR(255) NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2) NULL,
  image VARCHAR(255) NULL,
  gallery_images JSON NULL,
  tag VARCHAR(100) NULL,
  description TEXT NULL,
  material VARCHAR(255) NULL,
  dimensions VARCHAR(255) NULL,
  care TEXT NULL,
  stock INT NOT NULL DEFAULT 100,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category (category),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(190) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(120) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'COD',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  status VARCHAR(40) NOT NULL DEFAULT 'confirmed',
  estimated_delivery DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_email (email),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_tracking (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(50) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tracking_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coupons (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) NOT NULL UNIQUE,
  discount_type ENUM('percentage','fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  collection_id VARCHAR(150) NULL,
  min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount DECIMAL(10,2) NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  points INT NOT NULL,
  transaction_type ENUM('earn','redeem','adjust') NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_loyalty_user (user_id),
  INDEX idx_loyalty_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gifts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  description TEXT NULL,
  image VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_gifts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  gift_id BIGINT UNSIGNED NOT NULL,
  occasion VARCHAR(120) NOT NULL,
  message TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'assigned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer_gifts_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'general',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (user_id)
) ENGINE=InnoDB;

-- BANAFIBRE category seed data
INSERT INTO categories (name, slug, image, description) VALUES
('Bags & Totes', 'bags', '/categories/bags.png', 'Everyday carry, naturally.'),
('Home & Living', 'home-living', '/categories/home.png', 'Warm textures for your home.'),
('Accessories', 'accessories', '/categories/accessories.png', 'Small details, natural character.'),
('Gifting', 'gifting', '/categories/gifting.png', 'Thoughtful gifts with a lighter footprint.')
ON DUPLICATE KEY UPDATE
  name = VALUES(name), image = VALUES(image), description = VALUES(description);

-- BANAFIBRE product seed data
INSERT INTO products
(id, name, category, price, old_price, image, gallery_images, tag, description, material, dimensions, care, stock)
VALUES
(1, 'Everyday Banana Fibre Tote', 'bags', 899, 1199, '/products/tote.png',
 JSON_ARRAY('/products/tote.png','/products/tote.png'), 'Bestseller',
 'A versatile everyday tote made with natural banana fibre. Designed for daily errands, work and weekend outings.',
 'Banana fibre blend', 'Approx. 14 × 12 inches', 'Keep dry. Spot clean with a soft damp cloth.', 100),
(2, 'Handwoven Storage Basket', 'home-living', 649, NULL, '/products/basket.png',
 JSON_ARRAY('/products/basket.png','/products/basket.png'), 'Handwoven',
 'A practical handwoven basket for organising your home with natural texture.',
 'Natural banana fibre', 'Approx. 10 × 8 inches', 'Dust gently and keep away from prolonged moisture.', 100),
(3, 'Natural Fibre Sling Bag', 'bags', 1099, NULL, '/products/sling.png',
 JSON_ARRAY('/products/sling.png','/products/sling.png'), 'New',
 'A compact sling bag with a clean, timeless silhouette.',
 'Banana fibre blend', 'Approx. 9 × 7 inches', 'Spot clean only.', 100),
(4, 'Woven Table Mat Set', 'home-living', 499, 599, '/products/table-mat.png',
 JSON_ARRAY('/products/table-mat.png','/products/table-mat.png'), 'Set of 4',
 'Bring natural warmth to your dining table with this woven mat set.',
 'Natural banana fibre', 'Approx. 12 inches each', 'Wipe gently after use. Store dry.', 100),
(5, 'Banana Fibre Gift Hamper', 'gifting', 1299, NULL, '/categories/gifting.png',
 JSON_ARRAY('/categories/gifting.png'), 'Gift pick',
 'A thoughtful gift selection packed in a reusable natural-fibre basket.',
 'Banana fibre and assorted materials', 'Varies by hamper', 'Care instructions depend on included products.', 100),
(6, 'Woven Key & Utility Pouch', 'accessories', 349, NULL, '/categories/accessories.png',
 JSON_ARRAY('/categories/accessories.png'), '',
 'A compact pouch for small essentials, crafted with a natural woven finish.',
 'Banana fibre blend', 'Approx. 6 × 4 inches', 'Spot clean with a dry or slightly damp cloth.', 100)
ON DUPLICATE KEY UPDATE
  name = VALUES(name), category = VALUES(category), price = VALUES(price),
  old_price = VALUES(old_price), image = VALUES(image), gallery_images = VALUES(gallery_images),
  tag = VALUES(tag), description = VALUES(description), material = VALUES(material),
  dimensions = VALUES(dimensions), care = VALUES(care);
