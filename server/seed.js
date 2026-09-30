require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Bike = require('./models/Bike');
const Booking = require('./models/Booking');
const InventoryItem = require('./models/InventoryItem');
const connectDB = require('./config/db');

// Connect to DB
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Bike.deleteMany();
    await Booking.deleteMany();
    await InventoryItem.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create Mechanic using User.create() which triggers the pre-save hook.
    // Pass plain text so the hook hashes it exactly once (no double-hashing).
    const mechanic = await User.create({
      name: 'Kumar Mechanic',
      email: 'mechanic@motofix.com',
      passwordHash: 'password123',
      phone: '9876543210',
      role: 'mechanic',
      specialty: 'Master Technician'
    });

    // Create Customers
    const customers = await User.insertMany([
      { name: 'Arun', email: 'arun@example.com', passwordHash, phone: '9988776655', role: 'customer' },
      { name: 'Ramesh', email: 'ramesh@example.com', passwordHash, phone: '9988776644', role: 'customer' },
      { name: 'Karthik', email: 'karthik@example.com', passwordHash, phone: '9988776633', role: 'customer' }
    ]);

    // Create Bikes
    const bikes = await Bike.insertMany([
      { customerId: customers[0]._id, brand: 'Yamaha', model: 'R15 V4', registrationNumber: 'TN 72 AB 1234', year: 2024 },
      { customerId: customers[1]._id, brand: 'Honda', model: 'Activa', registrationNumber: 'TN 72 CD 5678', year: 2022 },
      { customerId: customers[2]._id, brand: 'Royal Enfield', model: 'Classic 350', registrationNumber: 'TN 72 EF 9876', year: 2021 }
    ]);

    // Create Inventory
    await InventoryItem.insertMany([
      { name: 'Motul Synthetic Oil 1L', partNumber: 'OIL-M-01', category: 'Oil & Fluids', quantity: 20, unitPrice: 750 },
      { name: 'Brembo Brake Pads Front', partNumber: 'BRK-B-F1', category: 'Brakes', quantity: 15, unitPrice: 1200 },
      { name: 'Air Filter Universal', partNumber: 'FLT-A-01', category: 'Body/General', quantity: 30, unitPrice: 350 }
    ]);

    // Create Bookings (Today)
    const todayStr = new Date().toISOString().split('T')[0];
    
    await Booking.create([
      {
        bookingCode: 'MF-A1B2C',
        customerId: customers[0]._id,
        mechanicId: mechanic._id,
        bikeId: bikes[0]._id,
        serviceType: 'General Service',
        problemDescription: 'Regular maintenance, chain lube',
        date: todayStr,
        day: 'Tuesday',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        status: 'Completed'
      },
      {
        bookingCode: 'MF-D3E4F',
        customerId: customers[1]._id,
        mechanicId: mechanic._id,
        bikeId: bikes[1]._id,
        serviceType: 'Oil Change',
        problemDescription: 'Engine sounding rough',
        date: todayStr,
        day: 'Tuesday',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        status: 'Repairing',
        estimatedCompletionTime: `${todayStr} 11:30 AM` // testing extension
      },
      {
        bookingCode: 'MF-G5H6I',
        customerId: customers[2]._id,
        mechanicId: mechanic._id,
        bikeId: bikes[2]._id,
        serviceType: 'Brake Repair',
        problemDescription: 'Brakes are squeaking loudly',
        date: todayStr,
        day: 'Tuesday',
        startTime: '02:00 PM',
        endTime: '03:00 PM',
        status: 'Confirmed'
      }
    ]);

    console.log('Database Seeded Successfully!');
    console.log('Demo Mechanic: mechanic@motofix.com / password123');
    console.log('Demo Customer: arun@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
