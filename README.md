# Library Management Service

A small neighborhood library application to manage its members, books, and lending operations.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.12+ with FastAPI |
| **Database** | PostgreSQL 12+ |
| **ORM** | SQLAlchemy |
| **Frontend** | React 19 with Vite |
| **Authentication** | JWT (JSON Web Tokens) |
| **API** | RESTful API |

## Features

### Core Functionality
- ✅ **Books Management**: Create, update, delete, and view books with availability tracking
- ✅ **Members Management**: Manage library members with contact information and user accounts
- ✅ **Borrowing Operations**: Track book borrowings and returns with due dates
- ✅ **Overdue Tracking**: Automatic detection of overdue books
- ✅ **Fine Calculation**: Automatic fine calculation for overdue books ($1/day)
- ✅ **Email Reminders**: Scheduled email notifications for due/overdue books

### Additional Features
- ✅ **Dashboard**: Real-time library statistics (total books, members, borrowings, overdue)
- ✅ **Authentication**: JWT-based user authentication
- ✅ **Authorization**: Role-based access control (Admin/Member)
- ✅ **Pagination**: Configurable pagination for all list views
- ✅ **Search**: Search functionality for books, members, and borrowings
- ✅ **Status Filtering**: Filter borrowings by status (borrowed/returned/overdue)
- ✅ **Responsive UI**: Mobile-friendly design

## Project Structure

```
Library-Management/
├── api-service/                 # Backend (FastAPI)
│   ├── main.py                  # FastAPI application entry point
│   ├── database.py              # Database configuration (read/write replicas)
│   ├── auth.py                  # JWT authentication logic
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── book.py
│   │   ├── member.py
│   │   ├── borrowing.py
│   │   └── user.py
│   ├── routers/                 # API route handlers
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── books.py             # Books CRUD with search
│   │   ├── members.py           # Members CRUD with search
│   │   ├── borrowings.py        # Borrowings with filters & search
│   │   ├── dashboard.py         # Dashboard statistics
│   │   └── statistics.py        # Library statistics
│   ├── email_reminder.py        # Email reminder cron script
│   ├── create_admin.py          # Admin user creation script
│   ├── create_tables.py         # Database table creation
│   ├── schema.sql               # PostgreSQL schema
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment template
│   └── venv/                    # Python virtual environment
├── view-service/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Dashboard.jsx    # Admin dashboard
│   │   │   ├── Books.jsx        # Books management with search
│   │   │   ├── Members.jsx      # Members management with search
│   │   │   ├── Borrowings.jsx   # Borrowings with filters & search
│   │   │   ├── Home.jsx         # Public landing page
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Signup.jsx       # Registration page
│   │   │   ├── UserDashboard.jsx # Member dashboard
│   │   │   ├── MyProfile.jsx    # Profile management
│   │   │   ├── Pagination.jsx   # Reusable pagination
│   │   │   └── common/          # Shared UI components
│   │   ├── styles/              # CSS stylesheets
│   │   ├── api.js               # Axios API client
│   │   ├── App.jsx              # Main router
│   │   └── main.jsx             # React entry point
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.js           # Vite configuration
│   └── .env.example             # Environment template
└── README.md                    # This file
```

## Prerequisites

- **Python 3.12+**
- **PostgreSQL 12+**
- **Node.js 18+**
- **npm**

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/annycoderssg/Library-Management.git
cd Library-Management
```

### 2. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE USER project WITH PASSWORD 'Password@123';
CREATE DATABASE project_assignment OWNER project;
GRANT ALL PRIVILEGES ON DATABASE project_assignment TO project;
\q

# Import schema (optional - tables are auto-created on startup)
psql -U project -d project_assignment -f api-service/schema.sql
```

### 3. Backend Setup

```bash
cd api-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Generate JWT secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Run the server
./venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8891
```

**API Documentation**: http://localhost:8891/docs (Swagger UI)

### 4. Frontend Setup

```bash
cd view-service

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed

# Run development server
npm run dev -- --port 8890
```

**Frontend**: http://localhost:8890

### 5. Create Admin User

```bash
cd api-service
source venv/bin/activate
python create_admin.py
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new member | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| GET | `/api/profile` | Get user profile with member info | Yes |
| PUT | `/api/profile` | Update profile | Yes |

### Books
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/books?skip=0&limit=10&search=python` | Get books (paginated, searchable) | No |
| GET | `/api/books/{id}` | Get book by ID | No |
| POST | `/api/books` | Create book | Admin |
| PUT | `/api/books/{id}` | Update book | Admin |
| DELETE | `/api/books/{id}` | Delete book | Admin |

### Members
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/members?skip=0&limit=10&search=john` | Get members (paginated, searchable) | Admin |
| GET | `/api/members/{id}` | Get member by ID | Admin |
| POST | `/api/members` | Create member (with optional user account) | Admin |
| PUT | `/api/members/{id}` | Update member | Admin |
| DELETE | `/api/members/{id}` | Delete member | Admin |
| GET | `/api/members/{id}/borrowings` | Get member's borrowings | Admin |
| GET | `/api/members/{id}/user` | Get member's user account info | Admin |

### Borrowings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/borrowings?skip=0&limit=10&status_filter=borrowed&search=gatsby` | Get borrowings (paginated, filterable, searchable) | Yes |
| GET | `/api/borrowings/{id}` | Get borrowing by ID | Yes |
| POST | `/api/borrowings` | Create borrowing | Yes |
| PUT | `/api/borrowings/{id}/return` | Return a book | Yes |
| DELETE | `/api/borrowings/{id}` | Delete borrowing | Admin |

### Dashboard & Statistics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard` | Get dashboard stats & new books | No |
| GET | `/api/user/dashboard` | Get user's active borrowings | Yes |
| GET | `/api/stats` | Get library statistics | No |

## Search Functionality

All list endpoints support search:

| Endpoint | Search Fields |
|----------|---------------|
| `/api/books?search=` | title, author, ISBN |
| `/api/members?search=` | name, email, phone |
| `/api/borrowings?search=` | book title, member name |

**Example:**
```bash
curl 'http://localhost:8891/api/books?search=python&skip=0&limit=10'
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `books` | Library book inventory |
| `members` | Library members |
| `users` | User accounts for authentication |
| `borrowings` | Book borrowing records |

## Email Reminders

The `email_reminder.py` script sends notifications for:
- Books due within N days (configurable)
- Overdue books

### Test Email Reminders
```bash
cd api-service
./venv/bin/python email_reminder.py
```

### Setup Cron Job (Production)
```bash
# Edit crontab
crontab -e

# Add line to run daily at 9 AM
0 9 * * * cd /path/to/Library-Management/api-service && ./venv/bin/python email_reminder.py >> /var/log/library-reminders.log 2>&1
```

### Email Configuration
Add to `api-service/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password    # Use Gmail App Password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Neighborhood Library
REMINDER_DAYS_AHEAD=3
FINE_PER_DAY=1.0
```

## Environment Variables

### Backend (`api-service/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_USER` | PostgreSQL username | Yes | - |
| `DATABASE_PASSWORD` | PostgreSQL password | Yes | - |
| `DATABASE_HOST` | PostgreSQL host | No | localhost |
| `DATABASE_PORT` | PostgreSQL port | No | 5432 |
| `DATABASE_NAME` | Database name | Yes | - |
| `JWT_SECRET_KEY` | JWT signing key (min 32 chars) | Yes | - |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | No | localhost:8890 |
| `DEFAULT_BOOKS_PER_PAGE` | Books pagination limit | No | 10 |
| `DEFAULT_MEMBERS_PER_PAGE` | Members pagination limit | No | 10 |
| `SMTP_HOST` | SMTP server host | No | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | No | 587 |
| `SMTP_USER` | SMTP username | No | - |
| `SMTP_PASSWORD` | SMTP password | No | - |
| `FROM_EMAIL` | Sender email address | No | - |
| `FROM_NAME` | Sender name | No | Neighborhood Library |
| `REMINDER_DAYS_AHEAD` | Days before due date to remind | No | 3 |
| `FINE_PER_DAY` | Fine amount per overdue day | No | 1.0 |

### Frontend (`view-service/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | No | http://localhost:8891/api |
| `VITE_ITEMS_PER_PAGE` | Pagination limit | No | 10 |
| `VITE_PROFILE_CACHE_DURATION` | Profile cache duration (ms) | No | 5000 |

## Running in Production

### Backend
```bash
cd api-service
./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8891 --workers 4
```

### Frontend
```bash
cd view-service
npm run build
npm run preview -- --port 8890
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'fastapi'"
Use the virtual environment's Python:
```bash
./venv/bin/uvicorn main:app --reload --port 8891
```

### CORS Errors
Update `ALLOWED_ORIGINS` in `api-service/.env`:
```env
ALLOWED_ORIGINS=http://localhost:8890,http://127.0.0.1:8890
```

### Database Connection Failed
1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Check credentials in `.env`
3. Ensure database exists: `psql -U postgres -c "\l"`

## License

This project is for educational purposes.

---

**Repository**: https://github.com/annycoderssg/Library-Management
