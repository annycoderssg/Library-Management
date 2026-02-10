# Library Management Service

A small neighborhood library application to manage its members, books, and lending operations.

## Tech Stack

- **Python** for the server implementation
- **REST API** with FastAPI for the service interface
- **PostgreSQL** as the data store
- **React** with Vite for the frontend

## Features

### Core Functionality
- ✅ **Books Management**: Create, update, delete, and view books with availability tracking
- ✅ **Members Management**: Manage library members with contact information and user accounts
- ✅ **Borrowing Operations**: Track book borrowings and returns with due dates
- ✅ **Overdue Tracking**: Automatic detection of overdue books
- ✅ **Fine Calculation**: Automatic fine calculation for overdue books ($1/day)
- ✅ **Email Reminders**: Scheduled email notifications for due/overdue books

### Additional Features
- ✅ Dashboard with library statistics
- ✅ User authentication (JWT-based)
- ✅ Role-based access control (Admin/Member)
- ✅ Pagination and search
- ✅ Responsive UI

## Project Structure

```
Library-Management/
├── api-service/                 # Backend (FastAPI)
│   ├── main.py                  # FastAPI application entry point
│   ├── database.py              # Database configuration
│   ├── models/                  # SQLAlchemy models
│   │   ├── book.py
│   │   ├── member.py
│   │   ├── borrowing.py
│   │   └── user.py
│   ├── routers/                 # API endpoints
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── books.py             # Books CRUD
│   │   ├── members.py           # Members CRUD
│   │   ├── borrowings.py        # Borrowings management
│   │   ├── dashboard.py         # Dashboard data
│   │   └── statistics.py        # Library statistics
│   ├── schemas.py               # Pydantic schemas
│   ├── auth.py                  # JWT authentication
│   ├── email_reminder.py        # Email reminder cron job
│   ├── schema.sql               # PostgreSQL schema
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment variables template
├── view-service/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── Members.jsx
│   │   │   ├── Borrowings.jsx
│   │   │   └── common/          # Reusable components
│   │   ├── api.js               # API client
│   │   ├── App.jsx              # Main application
│   │   └── main.jsx             # Entry point
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.js           # Vite configuration
│   └── .env.example             # Environment variables template
└── README.md                    # This file
```

## Prerequisites

- **Python 3.12+**
- **PostgreSQL 12+**
- **Node.js 18+**
- **npm**

## Quick Start

### 1. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE USER project WITH PASSWORD 'Password@123';
CREATE DATABASE project_assignment OWNER project;
GRANT ALL PRIVILEGES ON DATABASE project_assignment TO project;
\q

# Import schema (optional - tables are auto-created)
psql -U project -d project_assignment -f api-service/schema.sql
```

### 2. Backend Setup

```bash
cd api-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8891
```

**API Documentation**: http://localhost:8891/docs

### 3. Frontend Setup

```bash
cd view-service

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed (default API URL: http://localhost:8891/api)

# Run development server
npm run dev -- --port 8890
```

**Frontend**: http://localhost:8890

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new member |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/profile` | Get current user profile |
| PUT | `/api/profile` | Update profile |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books (paginated) |
| GET | `/api/books/{id}` | Get book by ID |
| POST | `/api/books` | Create book (admin) |
| PUT | `/api/books/{id}` | Update book (admin) |
| DELETE | `/api/books/{id}` | Delete book (admin) |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members (paginated) |
| GET | `/api/members/{id}` | Get member by ID |
| POST | `/api/members` | Create member (admin) |
| PUT | `/api/members/{id}` | Update member (admin) |
| DELETE | `/api/members/{id}` | Delete member (admin) |
| GET | `/api/members/{id}/borrowings` | Get member's borrowings |

### Borrowings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/borrowings` | Get all borrowings (paginated, filterable) |
| GET | `/api/borrowings/{id}` | Get borrowing by ID |
| POST | `/api/borrowings` | Create borrowing |
| PUT | `/api/borrowings/{id}/return` | Return a book |
| DELETE | `/api/borrowings/{id}` | Delete borrowing (admin) |

### Dashboard & Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard data |
| GET | `/api/user/dashboard` | Get user's borrowed books |
| GET | `/api/stats` | Get library statistics |

## Database Schema

### Tables
- **books**: Library book inventory
- **members**: Library members
- **users**: User accounts (authentication)
- **borrowings**: Book borrowing records

### Key Relationships
- `borrowings.book_id` → `books.id`
- `borrowings.member_id` → `members.id`
- `users.member_id` → `members.id`

## Email Reminders

The `email_reminder.py` script sends email notifications for:
- Books due within configured days (default: 3 days)
- Overdue books

### Setup Cron Job
```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/api-service && ./venv/bin/python email_reminder.py
```

### Email Configuration
Configure SMTP settings in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

## Default Users

After setup, you can create an admin user:
```bash
cd api-service
source venv/bin/activate
python create_admin.py
```

## Environment Variables

### Backend (api-service/.env)
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_USER | PostgreSQL username | project |
| DATABASE_PASSWORD | PostgreSQL password | - |
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5432 |
| DATABASE_NAME | Database name | project_assignment |
| JWT_SECRET_KEY | JWT signing key (min 32 chars) | - |
| ALLOWED_ORIGINS | CORS allowed origins | localhost:8890 |
| DEFAULT_BOOKS_PER_PAGE | Pagination limit | 10 |

### Frontend (view-service/.env)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | Backend API URL | http://localhost:8891/api |
| VITE_ITEMS_PER_PAGE | Pagination limit | 10 |

## License

This project is for educational purposes.
