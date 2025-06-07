# 📋 Task Dashboard 2.0

A modern, full-stack task management application built with Next.js, React, and FastAPI.

## 🚀 Features

- **📊 Analytics Dashboard** - Comprehensive task analytics with charts and KPIs
- **🎯 SLA Management** - Track due dates and overdue tasks with visual indicators
- **💬 Comments System** - Add notes and comments to tasks
- **🔔 Toast Notifications** - Real-time feedback for all user actions
- **🌙 Dark/Light Mode** - Full theme support throughout the application
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🔍 Advanced Filtering** - Filter tasks by status, priority, client, and date ranges
- **📈 Real-time Updates** - Live data synchronization between frontend and backend

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **TailwindCSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Chart.js** - Data visualization
- **React Query** - Data fetching and caching (recommended)

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite/PostgreSQL** - Database options
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Docker (optional, recommended)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd task-dashboard

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if using PostgreSQL)
alembic upgrade head

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

### Option 3: PowerShell Script (Windows)
```powershell
# Run the automated setup script
.\start-app.ps1
```

## 📁 Project Structure

```
task-dashboard/
├── src/                          # Frontend source code
│   ├── app/                      # Next.js App Router
│   │   ├── components/           # React components
│   │   ├── contexts/             # React contexts
│   │   ├── hooks/                # Custom hooks
│   │   ├── analytics/            # Analytics dashboard
│   │   └── filtered-tasks/       # Task filtering page
│   ├── services/                 # API services
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── backend/                      # Backend source code
│   ├── main.py                   # FastAPI application
│   ├── models.py                 # Database models
│   ├── schemas.py                # Pydantic schemas
│   ├── database.py               # Database configuration
│   └── migrations/               # Database migrations
├── public/                       # Static assets
├── docs/                         # Documentation files
└── docker-compose.yml            # Docker configuration
```

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

#### Backend
```bash
# In backend directory
uvicorn main:app --reload    # Development server
python -m pytest            # Run tests
black .                      # Format code
isort .                      # Sort imports
flake8 .                     # Lint code
```

#### Docker
```bash
npm run docker:build    # Build Docker images
npm run docker:up       # Start containers
npm run docker:down     # Stop containers
```

### Environment Variables

Create `.env.local` for development:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="Task Dashboard"
NODE_ENV=development
```

Create `backend/.env` for backend:
```bash
DATABASE_URL=sqlite:///./task_manager.db
SECRET_KEY=your-secret-key-here
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

## 📊 API Documentation

The FastAPI backend provides interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
- `GET /clients/` - List all clients with tasks
- `POST /clients/` - Create new client
- `POST /tasks/` - Create new task
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task
- `POST /tasks/{task_id}/comments/` - Add comment to task

## 🧪 Testing

### Frontend Testing
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

### Backend Testing
```bash
cd backend
python -m pytest          # Run all tests
python -m pytest -v       # Verbose output
python -m pytest --cov    # With coverage
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
npm run build
npm start

# Backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Database**: Indexed queries for fast data retrieval
- **Caching**: React Query for client-side caching (recommended)

## 🔒 Security

- Input validation with Pydantic
- SQL injection protection with SQLAlchemy
- XSS protection with content sanitization
- CORS configuration for cross-origin requests
- Rate limiting (configurable)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and type checking

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation files](./docs/) in the project
2. Review the [API documentation](http://localhost:8000/docs) when running
3. Create an issue in the repository

## 🎯 Roadmap

- [ ] User authentication and authorization
- [ ] Real-time notifications with WebSockets
- [ ] Advanced reporting and export features
- [ ] Mobile app with React Native
- [ ] Integration with external calendar systems
- [ ] Advanced task automation and workflows

---

**Built with ❤️ using modern web technologies**
