# MUTCU Full Stack Setup Guide

This guide will help you set up and run both the React frontend and Node.js backend.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Backend Setup

### 1. Navigate to backend directory

```bash
cd mut-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE mutcu_db;
```

### 4. Configure environment variables

Create a `.env` file in `mut-backend/`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/mutcu_db?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@mutcu.ac.ke
ADMIN_PASSWORD=admin123
```

**⚠️ Update the DATABASE_URL with your PostgreSQL credentials!**

### 5. Setup database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed
```

### 6. Start backend server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to frontend directory

```bash
cd mut-react
```

### 2. Install dependencies (if not already done)

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in `mut-react/`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start frontend development server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Testing the Connection

1. **Backend Health Check**: Visit `http://localhost:5000/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Visit `http://localhost:5173`
   - Should load the MUTCU homepage

3. **Test API Integration**:
   - Submit a prayer request on the homepage
   - Subscribe to newsletter
   - Submit contact form

## Admin Access

1. Login at `/api/auth/login` with:
   - Email: `admin@mutcu.ac.ke`
   - Password: `admin123`

2. Access admin dashboard at `/admin` (after login)

## API Endpoints Summary

### Public Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/events` - Get events
- `GET /api/ministries` - Get ministries
- `POST /api/prayer` - Submit prayer request
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

### Protected Endpoints (Require Authentication)

- `GET /api/auth/profile` - Get user profile
- `GET /api/admin/dashboard` - Admin dashboard stats
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)
- And more...

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### CORS Errors

- Verify FRONTEND_URL in backend `.env` matches frontend URL
- Check that frontend `.env` has correct VITE_API_URL

### Port Already in Use

- Change PORT in backend `.env`
- Update VITE_API_URL in frontend `.env` accordingly

## Next Steps

1. **Production Deployment**:
   - Use environment-specific `.env` files
   - Set strong JWT_SECRET
   - Enable HTTPS
   - Configure proper database backups

2. **Additional Features**:
   - Email notifications
   - File uploads for images
   - Advanced admin features
   - Analytics integration

## Support

For issues or questions, refer to the README files in each project directory.
