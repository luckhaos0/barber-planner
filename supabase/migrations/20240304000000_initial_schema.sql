-- Initial Schema for NORRAL Barber Planner

-- shops table
CREATE TABLE IF NOT EXISTS shops (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  shop_id BIGINT REFERENCES shops(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'barber')) NOT NULL
);

-- goals table
CREATE TABLE IF NOT EXISTS goals (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id),
  type TEXT CHECK(type IN ('daily', 'weekly', 'monthly')) NOT NULL,
  metric TEXT CHECK(metric IN ('quantity', 'revenue')) NOT NULL,
  target_value REAL NOT NULL,
  weekly_target REAL,
  bonus_value REAL DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  UNIQUE(user_id, type, metric)
);

-- daily_entries table
CREATE TABLE IF NOT EXISTS daily_entries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id),
  date TEXT NOT NULL,
  revenue REAL DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- services table
CREATE TABLE IF NOT EXISTS services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id),
  service_name TEXT NOT NULL,
  price REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Seed Data
-- Note: You can run this in Supabase SQL Editor

-- INSERT INTO shops (name) VALUES ('Classic Cuts');
-- INSERT INTO users (shop_id, name, email, password, role) VALUES (1, 'Deivid', 'admin@barber.com', 'admin123', 'admin');
-- INSERT INTO users (shop_id, name, email, password, role) VALUES (1, 'Pedro Silva', 'pedro@barber.com', 'barber123', 'barber');
-- INSERT INTO users (shop_id, name, email, password, role) VALUES (1, 'Lucas Santos', 'lucas@barber.com', 'barber123', 'barber');
-- INSERT INTO users (shop_id, name, email, password, role) VALUES (1, 'Felipe Oliveira', 'felipe@barber.com', 'barber123', 'barber');
