# MotoFix - Smart Bike Service & Workshop Management

MotoFix is a complete full-stack MERN application designed to manage bike service bookings for customers and workshop operations for mechanics.

## Key Features

### Customer Portal
- **Dashboard & Landing Page**: Clean, modern interface inspired by professional service platforms.
- **My Bikes**: Add and manage multiple bikes (Brand, Model, Registration Number).
- **Service Booking**: Select bike, service type, describe problem, and choose a date.
- **Interactive Mechanic Availability**: See live, dynamic availability slots for the mechanic.
  - 🟩 Available: Slot is free to book.
  - 🟥 Booked: Slot is taken.
  - 🟨 Working: Mechanic is currently repairing a bike in this slot.
  - ⬜ Completed: Past slots or completed jobs.
- **My Bookings**: Track repair progress timeline.
- **Notifications**: In-app alerts for booking confirmations and repair updates.

### Mechanic Portal (Workshop OS)
- **Dashboard**: Professional workshop interface with today's stats, active jobs, and low inventory alerts.
- **Schedule Management**: View daily schedule and open job details.
- **Active Repairs**: Update status workflow (Inspection → Repairing → Quality Check → Completed).
- **Extensions**: Extend estimated completion times (which notifies the customer).
- **Inventory**: (Backend logic included) Manage spare parts and stock limits.
- **Billing**: (Backend logic included) Generate bills for labor and parts.

## Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, React Router, Lucide React, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs.

## Project Structure

```
/client
  /src
    /components
    /contexts
    /layouts
    /pages
    /services
/server
  /config
  /controllers
  /middleware
  /models
  /routes
```

## Installation & Setup

1. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure Backend Environment Variables**:
   In `server/.env`, configure your MongoDB connection:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/motofix
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd client
   npm install
   ```

## Database Seed & Demo Accounts

To populate the database with realistic test data (mechanic, customers, bikes, inventory, and diverse test bookings):

```bash
cd server
npm run seed
```

**Demo Accounts:**
- **Customer**: `arun@example.com` / `password123`
- **Mechanic**: `mechanic@motofix.com` / `password123`
*(A quick demo login button is also provided on the frontend login page)*

## Running the Application

**Start Backend (Terminal 1):**
```bash
cd server
npm run dev
```

**Start Frontend (Terminal 2):**
```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

## Important Implementation Notes
- **Server-Side Availability Logic**: The backend calculates dynamic working availability based on current date, time, and active repair statuses to prevent double bookings.
- **Role Protection**: JWT middleware actively prevents customers from accessing mechanic routes, and vice versa.
