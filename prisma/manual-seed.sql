-- Run this SQL in your PostgreSQL database to create initial users
-- Passwords: admin123, advisor123, tech123 (hashed with bcrypt)

INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'admin@shopmonkey.local', 'Admin User', '$2b$12$yr.t9t257V/g.agU0Tlz1OSoRW/j2xGPvY8437gL8LZcP3kYTBWjy', 'ADMIN', NOW(), NOW()),
  (gen_random_uuid(), 'advisor@shopmonkey.local', 'Service Advisor', '$2b$12$nKEoorvN/Kh3ZhkA05WpBOLD84dt0l6XIdZ9KY.1UmshG8PVb7tXW', 'SERVICE_ADVISOR', NOW(), NOW()),
  (gen_random_uuid(), 'tech@shopmonkey.local', 'Technician User', '$2b$12$NwBMhKr5RXFFfFlClk6lMeGdiCc76TIAkUPBmv3wfDnqnZN1qxyHq', 'TECHNICIAN', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create some sample services
INSERT INTO "Service" (id, name, description, "defaultPrice", "laborHours", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Oil Change', 'Standard oil change service', 49.99, 0.5, true, NOW(), NOW()),
  (gen_random_uuid(), 'Brake Inspection', 'Complete brake system inspection', 89.99, 1.0, true, NOW(), NOW()),
  (gen_random_uuid(), 'Tire Rotation', 'Rotate all four tires', 39.99, 0.5, true, NOW(), NOW()),
  (gen_random_uuid(), 'Battery Replacement', 'Replace vehicle battery', 149.99, 0.5, true, NOW(), NOW()),
  (gen_random_uuid(), 'Engine Diagnostic', 'Full engine diagnostic scan', 129.99, 1.5, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create some sample parts
INSERT INTO "Part" (id, name, "partNumber", description, price, cost, "quantityInStock", "minStockLevel", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Oil Filter', 'OF-2024', NULL, 12.99, 6.50, 50, 10, true, NOW(), NOW()),
  (gen_random_uuid(), 'Air Filter', 'AF-2024', NULL, 24.99, 12.00, 30, 10, true, NOW(), NOW()),
  (gen_random_uuid(), 'Brake Pads (Front)', 'BP-FRONT', NULL, 89.99, 45.00, 20, 5, true, NOW(), NOW()),
  (gen_random_uuid(), 'Battery 12V', 'BAT-12V', NULL, 149.99, 75.00, 10, 3, true, NOW(), NOW())
ON CONFLICT ("partNumber") DO NOTHING;
