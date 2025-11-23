const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopmonkey.local' },
    update: {},
    create: {
      email: 'admin@shopmonkey.local',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', admin.email);

  // Create service advisor
  const advisorPassword = await bcrypt.hash('advisor123', 12);
  const advisor = await prisma.user.upsert({
    where: { email: 'advisor@shopmonkey.local' },
    update: {},
    create: {
      email: 'advisor@shopmonkey.local',
      name: 'Service Advisor',
      password: advisorPassword,
      role: 'SERVICE_ADVISOR',
    },
  });

  console.log('Service Advisor created:', advisor.email);

  // Create technician
  const techPassword = await bcrypt.hash('tech123', 12);
  const tech = await prisma.user.upsert({
    where: { email: 'tech@shopmonkey.local' },
    update: {},
    create: {
      email: 'tech@shopmonkey.local',
      name: 'Technician User',
      password: techPassword,
      role: 'TECHNICIAN',
    },
  });

  console.log('Technician created:', tech.email);

  // Create some sample services
  const services = [
    { name: 'Oil Change', description: 'Standard oil change service', defaultPrice: 49.99, laborHours: 0.5 },
    { name: 'Brake Inspection', description: 'Complete brake system inspection', defaultPrice: 89.99, laborHours: 1 },
    { name: 'Tire Rotation', description: 'Rotate all four tires', defaultPrice: 39.99, laborHours: 0.5 },
    { name: 'Battery Replacement', description: 'Replace vehicle battery', defaultPrice: 149.99, laborHours: 0.5 },
    { name: 'Engine Diagnostic', description: 'Full engine diagnostic scan', defaultPrice: 129.99, laborHours: 1.5 },
    { name: 'Transmission Service', description: 'Transmission fluid change and inspection', defaultPrice: 199.99, laborHours: 2 },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    });
    
    if (!existing) {
      await prisma.service.create({
        data: service,
      });
    }
  }

  console.log('Services created');

  // Create some sample parts
  const parts = [
    { name: 'Oil Filter', partNumber: 'OF-2024', price: 12.99, cost: 6.50, quantityInStock: 50, minStockLevel: 10 },
    { name: 'Air Filter', partNumber: 'AF-2024', price: 24.99, cost: 12.00, quantityInStock: 30, minStockLevel: 10 },
    { name: 'Brake Pads (Front)', partNumber: 'BP-FRONT', price: 89.99, cost: 45.00, quantityInStock: 20, minStockLevel: 5 },
    { name: 'Brake Pads (Rear)', partNumber: 'BP-REAR', price: 79.99, cost: 40.00, quantityInStock: 15, minStockLevel: 5 },
    { name: 'Battery 12V', partNumber: 'BAT-12V', price: 149.99, cost: 75.00, quantityInStock: 10, minStockLevel: 3 },
    { name: 'Wiper Blades', partNumber: 'WB-2024', price: 29.99, cost: 15.00, quantityInStock: 25, minStockLevel: 5 },
  ];

  for (const part of parts) {
    if (part.partNumber) {
      await prisma.part.upsert({
        where: { partNumber: part.partNumber },
        update: {},
        create: part,
      });
    }
  }

  console.log('Parts created');

  // Create a sample customer
  const customer = await prisma.customer.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0123',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
  });

  console.log('Sample customer created:', customer.firstName, customer.lastName);

  // Create a sample vehicle for the customer
  const vehicle = await prisma.vehicle.create({
    data: {
      customerId: customer.id,
      year: 2020,
      make: 'Toyota',
      model: 'Camry',
      color: 'Silver',
      licensePlate: 'ABC-1234',
      vin: '1HGBH41JXMN109186',
      mileage: 45000,
    },
  });

  console.log('Sample vehicle created:', vehicle.year, vehicle.make, vehicle.model);

  console.log('Seeding completed!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@shopmonkey.local / admin123');
  console.log('Service Advisor: advisor@shopmonkey.local / advisor123');
  console.log('Technician: tech@shopmonkey.local / tech123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
