# Neighborhood Library Service

A full-stack web application for managing a neighborhood library's books, members, and lending operations.

## Overview

This application provides a complete solution for library management with:
- **Books Management**: Create, update, delete, and view books with availability tracking
- **Members Management**: Manage library members with contact information
- **Borrowing Operations**: Track book borrowings and returns with due dates
- **Overdue Tracking**: Automatic detection and fine calculation for overdue books
- **Statistics Dashboard**: View library statistics at a glance

## Tech Stack

### Backend
- **Python 3.12+** with FastAPI
- **MySQL** database
- **SQLAlchemy** ORM
- **Pydantic** for data validation

### Frontend
- **React 19** with Vite
- **Axios** for API calls
- **Modern CSS** for styling

## Project Structure

```
ProjectAssignment/
├── api-service/
│   ├── venv/                  # Python virtual environment
│   ├── main.py               # FastAPI application
│   ├── models.py             # SQLAlchemy database models
│   ├── schemas.py            # Pydantic schemas for validation
│   ├── database.py           # Database configuration
│   ├── create_tables.py      # Script to create database tables
│   ├── schema.sql            # MySQL schema SQL
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── view-service/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── Members.jsx
│   │   │   └── Borrowings.jsx
│   │   ├── api.js            # API client functions
│   │   ├── App.jsx           # Main React component
│   │   └── main.jsx          # React entry point
│   ├── package.json          # Node.js dependencies
│   └── vite.config.js        # Vite configuration
└── README.md                 # This file
```

## Prerequisites

- **Python 3.12+**
- **PostgreSQL** (12+)
- **Node.js** (18+)
- **npm** or **yarn**

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U project -d postgres

# Create database
CREATE DATABASE project_assignment;

# Exit PostgreSQL
\q
```

### 2. Configure Database Connection

Create a `.env` file in the `api-service` directory:

```bash
cd api-service
```

Create `.env` file with your PostgreSQL credentials:

```env
DATABASE_USER=project
DATABASE_PASSWORD=Password@123
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=project_assignment
```

### 3. Create Database Tables

You have two options:

**Option A: Using SQLAlchemy (Recommended)**
```bash
cd api-service
source venv/bin/activate
python create_tables.py
```

**Option B: Using SQL Script**
```bash
psql -U project -d project_assignment -f api-service/schema.sql
```

## Backend Setup (API Service)

### 1. Activate Virtual Environment

```bash
cd api-service
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate    # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 9002
```

The API will be available at:
- **API**: http://localhost:9002
- **API Documentation**: http://localhost:9002/docs (Swagger UI)
- **Alternative Docs**: http://localhost:9002/redoc

## Frontend Setup (View Service)

### 1. Install Dependencies

```bash
cd view-service
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The React app will be available at `http://localhost:9001`

### 3. Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

### Members
- `GET /api/members` - Get all members
- `GET /api/members/{id}` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member
- `GET /api/members/{id}/borrowings` - Get member's borrowings

### Borrowings
- `GET /api/borrowings` - Get all borrowings (with optional filters)
- `GET /api/borrowings/{id}` - Get borrowing by ID
- `POST /api/borrowings` - Create new borrowing
- `PUT /api/borrowings/{id}/return` - Return a book
- `PUT /api/borrowings/{id}` - Update borrowing
- `DELETE /api/borrowings/{id}` - Delete borrowing

### Statistics
- `GET /api/stats` - Get library statistics

## Database Schema

### Books Table
- `id` (Primary Key)
- `title` (Required)
- `author` (Required)
- `isbn` (Unique, Optional)
- `published_year` (Optional)
- `total_copies` (Default: 1)
- `available_copies` (Default: 1)
- `created_at`, `updated_at` (Timestamps)

### Members Table
- `id` (Primary Key)
- `name` (Required)
- `email` (Unique, Required)
- `phone` (Optional)
- `address` (Optional)
- `membership_date` (Default: Current Date)
- `created_at`, `updated_at` (Timestamps)

### Borrowings Table
- `id` (Primary Key)
- `book_id` (Foreign Key → books)
- `member_id` (Foreign Key → members)
- `borrow_date` (Default: Current Date)
- `due_date` (Required)
- `return_date` (Optional)
- `status` (borrowed/returned/overdue)
- `fine_amount` (Default: 0.00)
- `created_at`, `updated_at` (Timestamps)

## Features

### Core Functionality
✅ Create/Update/Delete books and members
✅ Record book borrowings with due dates
✅ Record book returns
✅ Query borrowings by member, book, or status
✅ Automatic overdue detection
✅ Fine calculation ($1 per day overdue)
✅ Availability tracking (prevents borrowing unavailable books)

### Additional Features
✅ Statistics dashboard
✅ Real-time availability updates
✅ Input validation
✅ Error handling
✅ Responsive UI

## Usage Examples

### Creating a Book
```bash
curl -X POST "http://localhost:9002/api/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "published_year": 1925,
    "total_copies": 3,
    "available_copies": 3
  }'
```

### Creating a Member
```bash
curl -X POST "http://localhost:9002/api/members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St"
  }'
```

### Borrowing a Book
```bash
curl -X POST "http://localhost:9002/api/borrowings" \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "member_id": 1,
    "due_date": "2024-12-31"
  }'
```

### Returning a Book
```bash
curl -X PUT "http://localhost:9002/api/borrowings/1/return"
```

## Testing the Application

1. **Start the backend**:
   ```bash
   cd api-service
   source venv/bin/activate
   uvicorn main:app --reload
   ```

2. **Start the frontend** (in a new terminal):
   ```bash
   cd view-service
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:9001
   - API Docs: http://localhost:9002/docs

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `sudo systemctl status mysql` (or `mysqld`)
- Check database credentials in `.env` file
- Ensure database `project_assignment` exists

### Port Conflicts
- Backend default port: 9002 (change with `--port` flag)
- Frontend default port: 5173 (Vite will auto-select another if busy)

### Python Package Issues
- Ensure virtual environment is activated
- Reinstall packages: `pip install -r requirements.txt --force-reinstall`

### React Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Development Notes

- The API automatically creates tables on first run (via `Base.metadata.create_all()`)
- CORS is enabled for `localhost:9001`, `localhost:5173`, and `localhost:3000`
- All timestamps are timezone-aware
- Fine calculation: $1 per day overdue (can be customized)

## License

This project is for educational purposes.
## Author

Neighborhood Library Service - Full Stack Implementation

