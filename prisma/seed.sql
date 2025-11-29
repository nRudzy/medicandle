-- Seed file for medicandle database

-- Insert admin user (password: admin123)
INSERT INTO "User" (id, email, "passwordHash", role, name, "createdAt")
VALUES (
  gen_random_uuid(),
  'admin@medicandle.com',
  '$2a$10$rK.gZqHrJz2d9N4Y0a7n1.8qHwGkYF5IZd8hMF9AhL3K7uu8P6OFi', -- bcrypt hash of 'admin123'
  'ADMIN',
  'Admin',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert default production settings
INSERT INTO "ProductionSettings" (id, "laborRate", "electricityCost", "amortizationCost")
VALUES (
  gen_random_uuid(),
  25.0,
  0.5,
  0.2
);

-- Insert default pricing settings  
INSERT INTO "PricingSettings" (id, "targetMargin", "multiplierEntry", "multiplierPremium", "multiplierLuxury")
VALUES (
  gen_random_uuid(),
  50.0,
  2.5,
  3.0,
  4.0
);

-- Insert sample materials
INSERT INTO "Material" (id, name, type, "costPerUnit", unit, supplier, "currentStock")
VALUES
  (gen_random_uuid(), 'Cire de Soja Bio', 'WAX', 12.50, 'KG', 'Fournisseur Bio', 10.0),
  (gen_random_uuid(), 'Fragrance Bois de Santal', 'SCENT', 45.00, 'L', 'Grasse Parfums', 1.0),
  (gen_random_uuid(), 'Mèche Coton T3', 'WICK', 0.15, 'PIECE', 'WickMaster', 500),
  (gen_random_uuid(), 'Pot Verre Ambré 180ml', 'CONTAINER', 1.20, 'PIECE', 'GlassCo', 200);
