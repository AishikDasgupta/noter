# Notes Management Application

A full-stack notes management application built with Angular and Node.js, featuring role-based access control, note sharing, and analytics dashboard.

## 🚀 Features

### ✅ **User Authentication**

- Register and login with JWT authentication
- Secure password storage using bcrypt
- Role-based access control (User/Admin)

### ✅ **Notes Management**

- Create, read, update, delete notes
- Rich text content support
- Tag management with chips
- Archive/unarchive functionality
- Search by title, content, and tags
- Pagination for large note collections

### ✅ **Sharing & Permissions**

- Share notes with other users
- Read-only or read-write permissions
- Owner can manage all sharing settings
- Users see only notes they own or that are shared with them

### ✅ **Analytics Dashboard** (Admin Only)

- Most active users statistics
- Most used tags visualization
- Notes created per day (last 7 days chart)
- Interactive charts using Chart.js

### ✅ **Role Management**

- **User Role**: Standard application user
  - Create and manage personal notes
  - Share notes with other users
  - Access shared notes
- **Admin Role**: System administrator
  - All user permissions
  - Access to analytics dashboard
  - View system-wide statistics

## 🛠️ Tech Stack

### Backend

- **Framework**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **API Design**: REST with proper HTTP methods

### Frontend

- **Framework**: Angular 17
- **UI Components**: Angular Material
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **State Management**: RxJS Observables

## 📁 Project Structure

```
notes-app/
├── backend/              # Node.js API server
│   ├── middlewares/      # Auth & admin middlewares
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── frontend/            # Angular application
│   ├── src/app/
│   │   ├── core/        # Guards, services, interceptors
│   │   ├── features/    # Feature modules
│   │   └── shared/      # Shared components & models
└── package.json         # Root scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (cloud or local)

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Setup

Create `backend/.env` file:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Run the Application

```bash
# Run both backend and frontend
npm run dev

# Or run separately
npm run dev:backend  # Backend on port 5000
npm run dev:frontend # Frontend on port 3000
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## 👥 User Roles & Testing

### Creating Users

#### Regular User Registration

1. Go to http://localhost:3000/register
2. Fill in username, email, password
3. User will be created with "user" role by default

#### Creating an Admin User

Use the API endpoint to create an admin user:

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Or use Postman/Insomnia with:

- **URL**: `POST http://localhost:5000/api/auth/create-admin`
- **Body**:

```json
{
  "username": "adminuser",
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Testing Role-Based Access

1. **Login as Admin**:

   - Email: admin@example.com
   - Password: admin123
   - Can access: Notes, Dashboard, Roles, Profile

2. **Login as Regular User**:
   - Register a new user or use existing user
   - Can access: Notes, Roles, Profile
   - Dashboard menu item hidden
   - Dashboard route protected (redirects to notes)

## 🎯 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/create-admin` - Create admin user

### Notes

- `GET /api/notes` - Get user's notes (with pagination & search)
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/share` - Share note with user
- `PUT /api/notes/:noteId/share/:userId` - Update share permission
- `DELETE /api/notes/:noteId/share/:userId` - Remove share

### Analytics (Admin Only)

- `GET /api/admin/analytics/most-active-users` - Top active users
- `GET /api/admin/analytics/most-used-tags` - Popular tags
- `GET /api/admin/analytics/notes-created-daily` - Daily notes chart

## 🎨 UI Features

### Enhanced Design

- **Modern Gradient Backgrounds**: Beautiful blue-purple gradients
- **Glass Morphism Cards**: Translucent cards with backdrop blur
- **Responsive Design**: Mobile-first approach
- **Interactive Animations**: Smooth hover and transition effects
- **Material Design**: Consistent UI components
- **Loading States**: Elegant spinners and indicators
- **Error Handling**: User-friendly error messages

### Responsive Features

- Mobile-optimized navigation
- Adaptive card layouts
- Touch-friendly interactions
- Responsive charts and tables

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Authorization**: Protected routes and endpoints
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Frontend and backend validation
- **Route Guards**: Protected Angular routes

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Create, edit, delete notes
- [ ] Search and filter notes
- [ ] Share notes with different permissions
- [ ] Admin access to analytics dashboard
- [ ] Role-based navigation visibility
- [ ] Responsive design on different devices

### Test Data

Create some test notes with various tags to see the analytics in action:

- Technology, Personal, Work, Ideas, etc.

## 📊 Analytics Features

The admin dashboard provides insights into:

- **User Activity**: See which users are most active
- **Tag Usage**: Popular tags across all notes
- **Growth Trends**: Daily note creation patterns
- **Interactive Charts**: Visual data representation

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Run both servers
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
npm run install:all      # Install all dependencies
```

### Backend Development

- Uses nodemon for auto-reload
- MongoDB connection with retry logic
- Environment variable configuration
- Structured route organization

### Frontend Development

- Angular CLI development server
- Hot module replacement
- Lazy-loaded feature modules
- Standalone components

## 🚀 Production Deployment

### Backend

- Set production environment variables
- Use PM2 or similar for process management
- Configure reverse proxy (nginx)
- Set up SSL certificates

### Frontend

- Build with `ng build --prod`
- Deploy to CDN or static hosting
- Configure environment variables for production API

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Enjoy managing your notes with role-based security and beautiful analytics! 🎉**
