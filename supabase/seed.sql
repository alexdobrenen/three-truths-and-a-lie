-- Sample seed data for testing the application
-- Run this after schema.sql to populate initial teams

INSERT INTO teams (name) VALUES
  ('Engineering'),
  ('Product'),
  ('Marketing'),
  ('Sales'),
  ('Design')
ON CONFLICT (name) DO NOTHING;
